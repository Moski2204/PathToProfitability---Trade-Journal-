import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "journal-data.json");
const DIST_DIR = path.join(__dirname, "dist");
const INDEX_FILE = path.join(DIST_DIR, "index.html");
const isProduction = process.argv.includes("--prod");
const PORT = Number(process.env.PORT) || (isProduction ? 4173 : 3001);
const JWT_SECRET = process.env.JWT_SECRET || "moskiptp-local-dev-secret";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "15mb" }));

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ users: [] }, null, 2), "utf8");
  }
}

async function readDatabase() {
  await ensureDataFile();

  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw || "{}");
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
    };
  } catch {
    return { users: [] };
  }
}

async function writeDatabase(database) {
  await ensureDataFile();
  const tempFile = `${DATA_FILE}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(database, null, 2), "utf8");
  await fs.rename(tempFile, DATA_FILE);
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function serializeUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function normalizeReflectionInput(input) {
  const date = String(input?.date || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Reflection date must be in YYYY-MM-DD format.");
  }

  return {
    date,
    overall_summary: String(input?.overall_summary || "").trim(),
    did_right: String(input?.did_right || "").trim(),
    did_wrong: String(input?.did_wrong || "").trim(),
    improve_tomorrow: String(input?.improve_tomorrow || "").trim(),
  };
}

function normalizeDailyAiReviewInput(input) {
  const date = String(input?.date || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("AI review date must be in YYYY-MM-DD format.");
  }

  return {
    date,
    ai_summary: String(input?.ai_summary || "").trim(),
    strengths: String(input?.strengths || "").trim(),
    weaknesses: String(input?.weaknesses || "").trim(),
    tag_patterns: String(input?.tag_patterns || "").trim(),
    behavior_patterns: String(input?.behavior_patterns || "").trim(),
    tomorrow_focus: String(input?.tomorrow_focus || "").trim(),
  };
}

function roundCurrencyValue(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.round(numeric * 100) / 100;
}

function normalizeStartingBalanceInput(value) {
  if (value === null || value === undefined || value === "") return 0;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    throw new Error("Starting balance must be a valid number.");
  }
  return roundCurrencyValue(numeric);
}

function normalizeAccountTransactionType(value, amount = 0) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "deposit" || normalized === "withdrawal") return normalized;
  return Number(amount) < 0 ? "withdrawal" : "deposit";
}

function sortAccountTransactionsDescending(transactions) {
  return [...transactions].sort((a, b) => {
    const byDate = String(b.date || "").localeCompare(String(a.date || ""));
    if (byDate !== 0) return byDate;
    const byUpdatedAt = String(b.updated_at || "").localeCompare(String(a.updated_at || ""));
    if (byUpdatedAt !== 0) return byUpdatedAt;
    return String(a.account || "").localeCompare(String(b.account || ""));
  });
}

function normalizeAccountTransactionInput(input) {
  const account = String(input?.account || "").trim();
  const type = normalizeAccountTransactionType(input?.type, input?.amount);
  const date = String(input?.date || "").trim();
  const amount = Number(input?.amount);

  if (!account) {
    throw new Error("Transaction account is required.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Transaction date must be in YYYY-MM-DD format.");
  }
  if (!Number.isFinite(amount)) {
    throw new Error("Transaction amount must be a valid number.");
  }

  return {
    id: String(input?.id || crypto.randomUUID()),
    account,
    type,
    date,
    amount: Math.abs(roundCurrencyValue(amount)),
  };
}

function sortReflectionsDescending(reflections) {
  return [...reflections].sort((a, b) => {
    const byDate = String(b.date || "").localeCompare(String(a.date || ""));
    if (byDate !== 0) return byDate;
    return String(b.updated_at || "").localeCompare(String(a.updated_at || ""));
  });
}

function getUserReflections(user) {
  return Array.isArray(user.reflections) ? user.reflections : [];
}

function sortDailyAiReviewsDescending(reviews) {
  return [...reviews].sort((a, b) => {
    const byDate = String(b.date || "").localeCompare(String(a.date || ""));
    if (byDate !== 0) return byDate;
    return String(b.updated_at || "").localeCompare(String(a.updated_at || ""));
  });
}

function getUserDailyAiReviews(user) {
  return Array.isArray(user.daily_ai_reviews) ? user.daily_ai_reviews : [];
}

function getUserAccountTransactions(user) {
  return Array.isArray(user.account_transactions) ? sortAccountTransactionsDescending(user.account_transactions) : [];
}

function upsertUserReflection(user, input) {
  const nextInput = normalizeReflectionInput(input);
  const now = new Date().toISOString();
  const current = getUserReflections(user);
  const existing = current.find((entry) => entry.date === nextInput.date);

  if (existing) {
    Object.assign(existing, nextInput, {
      updated_at: now,
    });
    user.reflections = sortReflectionsDescending(current);
    return existing;
  }

  const created = {
    id: crypto.randomUUID(),
    user_id: user.id,
    ...nextInput,
    created_at: now,
    updated_at: now,
  };

  user.reflections = sortReflectionsDescending([...current, created]);
  return created;
}

function upsertUserDailyAiReview(user, input) {
  const nextInput = normalizeDailyAiReviewInput(input);
  const now = new Date().toISOString();
  const current = getUserDailyAiReviews(user);
  const existing = current.find((entry) => entry.date === nextInput.date);

  if (existing) {
    Object.assign(existing, nextInput, {
      updated_at: now,
    });
    user.daily_ai_reviews = sortDailyAiReviewsDescending(current);
    return existing;
  }

  const created = {
    id: crypto.randomUUID(),
    user_id: user.id,
    ...nextInput,
    created_at: now,
    updated_at: now,
  };

  user.daily_ai_reviews = sortDailyAiReviewsDescending([...current, created]);
  return created;
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "30d" },
  );
}

function findUserByIdentifier(users, identifier) {
  const normalizedIdentifier = normalizeEmail(identifier);

  return users.find((user) => {
    return (
      normalizeEmail(user.email) === normalizedIdentifier ||
      String(user.username || "").trim().toLowerCase() === normalizedIdentifier
    );
  });
}

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json({ error: "Authentication required." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const database = await readDatabase();
    const user = database.users.find((entry) => entry.id === payload.sub);

    if (!user) {
      return res.status(401).json({ error: "Session is no longer valid." });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Session expired. Please log in again." });
  }
}

app.post("/api/auth/register", async (req, res) => {
  const username = String(req.body?.username || "").trim();
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");

  if (username.length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters." });
  }

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  const database = await readDatabase();

  if (database.users.some((user) => normalizeEmail(user.email) === email)) {
    return res.status(409).json({ error: "That email is already registered." });
  }

  if (
    database.users.some(
      (user) => String(user.username || "").trim().toLowerCase() === username.toLowerCase(),
    )
  ) {
    return res.status(409).json({ error: "That username is already taken." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: crypto.randomUUID(),
    username,
    email,
    passwordHash,
    trades: [],
    reflections: [],
    daily_ai_reviews: [],
    account_transactions: [],
    starting_balance: 0,
    createdAt: new Date().toISOString(),
  };

  database.users.push(user);
  await writeDatabase(database);

  return res.status(201).json({
    token: signToken(user),
    user: serializeUser(user),
    trades: user.trades,
    reflections: getUserReflections(user),
    daily_ai_reviews: getUserDailyAiReviews(user),
    account_transactions: getUserAccountTransactions(user),
    starting_balance: user.starting_balance || 0,
  });
});

app.post("/api/auth/login", async (req, res) => {
  const identifier = String(req.body?.identifier || "").trim();
  const password = String(req.body?.password || "");

  if (!identifier || !password) {
    return res.status(400).json({ error: "Enter your username or email and password." });
  }

  const database = await readDatabase();
  const user = findUserByIdentifier(database.users, identifier);

  if (!user) {
    return res.status(401).json({ error: "Invalid login credentials." });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid login credentials." });
  }

  return res.json({
    token: signToken(user),
    user: serializeUser(user),
    trades: Array.isArray(user.trades) ? user.trades : [],
    reflections: getUserReflections(user),
    daily_ai_reviews: getUserDailyAiReviews(user),
    account_transactions: getUserAccountTransactions(user),
    starting_balance: user.starting_balance || 0,
  });
});

app.get("/api/auth/session", authenticate, async (req, res) => {
  return res.json({
    user: serializeUser(req.user),
    trades: Array.isArray(req.user.trades) ? req.user.trades : [],
    reflections: getUserReflections(req.user),
    daily_ai_reviews: getUserDailyAiReviews(req.user),
    account_transactions: getUserAccountTransactions(req.user),
    starting_balance: req.user.starting_balance || 0,
  });
});

app.put("/api/trades", authenticate, async (req, res) => {
  const trades = req.body?.trades;

  if (!Array.isArray(trades)) {
    return res.status(400).json({ error: "Trades payload must be an array." });
  }

  const database = await readDatabase();
  const user = database.users.find((entry) => entry.id === req.user.id);

  if (!user) {
    return res.status(401).json({ error: "Session is no longer valid." });
  }

  user.trades = trades;
  user.updatedAt = new Date().toISOString();
  await writeDatabase(database);

  return res.json({ trades: user.trades });
});

app.get("/api/account-transactions", authenticate, async (req, res) => {
  return res.json({
    starting_balance: req.user.starting_balance || 0,
    account_transactions: getUserAccountTransactions(req.user),
  });
});

app.put("/api/account-transactions", authenticate, async (req, res) => {
  const startingBalance = req.body?.starting_balance;
  const accountTransactions = req.body?.account_transactions;

  if (!Array.isArray(accountTransactions)) {
    return res.status(400).json({ error: "Account transactions payload must be an array." });
  }

  const database = await readDatabase();
  const user = database.users.find((entry) => entry.id === req.user.id);

  if (!user) {
    return res.status(401).json({ error: "Session is no longer valid." });
  }

  try {
    const now = new Date().toISOString();
    const currentTransactions = getUserAccountTransactions(user);
    const normalizedTransactions = accountTransactions.map((entry) => {
      const nextEntry = normalizeAccountTransactionInput(entry);
      const existing = currentTransactions.find((transaction) => transaction.id === nextEntry.id);
      const changed = !existing
        || existing.account !== nextEntry.account
        || normalizeAccountTransactionType(existing.type, existing.amount) !== nextEntry.type
        || existing.date !== nextEntry.date
        || roundCurrencyValue(existing.amount) !== nextEntry.amount;

      return {
        ...nextEntry,
        user_id: user.id,
        created_at: existing?.created_at || String(entry?.created_at || entry?.createdAt || now),
        updated_at: changed
          ? now
          : String(existing?.updated_at || entry?.updated_at || entry?.updatedAt || now),
      };
    });

    user.starting_balance = normalizeStartingBalanceInput(startingBalance);
    user.account_transactions = sortAccountTransactionsDescending(normalizedTransactions);
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid account transactions." });
  }

  user.updatedAt = new Date().toISOString();
  await writeDatabase(database);

  return res.json({
    starting_balance: user.starting_balance,
    account_transactions: getUserAccountTransactions(user),
  });
});

app.put("/api/reflections", authenticate, async (req, res) => {
  const reflection = req.body?.reflection;

  if (!reflection || typeof reflection !== "object" || Array.isArray(reflection)) {
    return res.status(400).json({ error: "Reflection payload must be an object." });
  }

  const database = await readDatabase();
  const user = database.users.find((entry) => entry.id === req.user.id);

  if (!user) {
    return res.status(401).json({ error: "Session is no longer valid." });
  }

  try {
    upsertUserReflection(user, reflection);
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid reflection." });
  }

  user.updatedAt = new Date().toISOString();
  await writeDatabase(database);

  return res.json({ reflections: getUserReflections(user) });
});

app.put("/api/daily-ai-reviews", authenticate, async (req, res) => {
  const review = req.body?.review;

  if (!review || typeof review !== "object" || Array.isArray(review)) {
    return res.status(400).json({ error: "AI review payload must be an object." });
  }

  const database = await readDatabase();
  const user = database.users.find((entry) => entry.id === req.user.id);

  if (!user) {
    return res.status(401).json({ error: "Session is no longer valid." });
  }

  try {
    upsertUserDailyAiReview(user, review);
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid AI review." });
  }

  user.updatedAt = new Date().toISOString();
  await writeDatabase(database);

  return res.json({ daily_ai_reviews: getUserDailyAiReviews(user) });
});

if (isProduction) {
  app.use(express.static(DIST_DIR));

  app.use(async (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }

    try {
      await fs.access(INDEX_FILE);
      res.sendFile(INDEX_FILE);
    } catch {
      next(new Error("Production build not found. Run `npm run build` before `npm run preview`."));
    }
  });
}

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found." });
  }

  return res.status(404).json({ error: "Route not found." });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const message = error instanceof Error ? error.message : "Internal server error.";
  return res.status(500).json({ error: message });
});

await ensureDataFile();

app.listen(PORT, () => {
  console.log(
    `[moskiptp] ${isProduction ? "production" : "api"} server listening on http://localhost:${PORT}`,
  );
});
