import bcrypt from "bcryptjs";
import { Component, useState, useEffect, useRef, useMemo, startTransition } from "react";
import { createPortal } from "react-dom";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const BRAND={name:"MoskiPTP",tagline:"Path to Profitability"};

const LIGHT_THEME = {
  bg:"#F7F9FC",
  bgElevated:"#EEF4FF",
  surface:"#FFFFFF",
  surfaceAlt:"#F8FBFF",
  surfaceSoft:"#F1F5F9",
  border:"#DDE7F3",
  accent:"#3B82F6",
  accentStrong:"#2563EB",
  accentBg:"rgba(59,130,246,0.12)",
  accentBgSoft:"rgba(59,130,246,0.08)",
  green:"#22C55E",
  greenBg:"rgba(34,197,94,0.12)",
  red:"#EF4444",
  redBg:"rgba(239,68,68,0.12)",
  amber:"#F59E0B",
  amberBg:"rgba(245,158,11,0.12)",
  purple:"#8B5CF6",
  purpleBg:"rgba(139,92,246,0.12)",
  teal:"#14B8A6",
  tealBg:"rgba(20,184,166,0.12)",
  text:"#0F172A",
  textSoft:"#1E293B",
  muted:"#64748B",
  dim:"#94A3B8",
  grid:"#E2E8F0",
  shadow:"0 4px 20px rgba(15,23,42,0.05)",
  shadowMd:"0 16px 40px rgba(15,23,42,0.08)",
  shadowLg:"0 24px 60px rgba(15,23,42,0.12)",
  radius:20,
  radiusSm:12,
  radiusXs:10,
  glass:"rgba(255,255,255,0.7)",
  glassStrong:"rgba(255,255,255,0.82)",
  headerGlass:"rgba(247,249,252,0.92)",
  fieldBg:"#FFFFFF",
  fieldBorder:"1px solid rgba(148,163,184,0.16)",
  fieldInset:"inset 0 0 0 1px rgba(226,232,240,0.8)",
  tooltipBg:"#0F172A",
  chatBg:"linear-gradient(180deg, rgba(248,251,255,0.92), rgba(255,255,255,0.98))",
  chatAiBubble:"#0E1118",
  heroPanel:"linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,251,255,0.94))",
  overlay:"linear-gradient(180deg, rgba(255,255,255,0.18), rgba(248,250,252,0.62))",
  authBackdrop:"radial-gradient(circle at top left, rgba(59,130,246,0.14), transparent 34%), radial-gradient(circle at bottom right, rgba(139,92,246,0.10), transparent 32%), linear-gradient(135deg, #eef2ff 0%, #f8fafc 58%, #ffffff 100%)",
  decorBlue:"rgba(59,130,246,0.08)",
  decorPurple:"rgba(139,92,246,0.08)",
  contrastText:"#FFFFFF",
};

const DARK_THEME = {
  bg:"#08111F",
  bgElevated:"#0D1A2B",
  surface:"#0F1B2D",
  surfaceAlt:"#14233A",
  surfaceSoft:"#182A44",
  border:"#233752",
  accent:"#60A5FA",
  accentStrong:"#3B82F6",
  accentBg:"rgba(96,165,250,0.18)",
  accentBgSoft:"rgba(96,165,250,0.10)",
  green:"#4ADE80",
  greenBg:"rgba(74,222,128,0.14)",
  red:"#F87171",
  redBg:"rgba(248,113,113,0.14)",
  amber:"#FBBF24",
  amberBg:"rgba(251,191,36,0.14)",
  purple:"#A78BFA",
  purpleBg:"rgba(167,139,250,0.16)",
  teal:"#2DD4BF",
  tealBg:"rgba(45,212,191,0.14)",
  text:"#E6EEF9",
  textSoft:"#C9D7EB",
  muted:"#90A4C1",
  dim:"#6F84A1",
  grid:"rgba(144,164,193,0.20)",
  shadow:"0 8px 24px rgba(2,6,23,0.40)",
  shadowMd:"0 18px 48px rgba(2,6,23,0.48)",
  shadowLg:"0 30px 72px rgba(2,6,23,0.56)",
  radius:20,
  radiusSm:12,
  radiusXs:10,
  glass:"rgba(8,17,31,0.72)",
  glassStrong:"rgba(10,19,34,0.84)",
  headerGlass:"rgba(7,13,24,0.88)",
  fieldBg:"#0B1628",
  fieldBorder:"1px solid rgba(96,165,250,0.16)",
  fieldInset:"inset 0 0 0 1px rgba(59,130,246,0.08)",
  tooltipBg:"#08111F",
  chatBg:"linear-gradient(180deg, rgba(8,17,31,0.96), rgba(15,27,45,0.98))",
  chatAiBubble:"#08111F",
  heroPanel:"linear-gradient(180deg, rgba(15,27,45,0.96), rgba(20,35,58,0.96))",
  overlay:"linear-gradient(180deg, rgba(8,17,31,0.16), rgba(8,17,31,0.62))",
  authBackdrop:"radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 34%), radial-gradient(circle at bottom right, rgba(139,92,246,0.12), transparent 32%), linear-gradient(135deg, #08111f 0%, #0d1a2b 58%, #111f34 100%)",
  decorBlue:"rgba(59,130,246,0.14)",
  decorPurple:"rgba(139,92,246,0.12)",
  contrastText:"#FFFFFF",
};

let C=LIGHT_THEME;
let ACTIVE_THEME="light";

const STRATEGIES=["ORB","Breakout","Reversal","Gap Fill","VWAP Reclaim","Support/Resistance","Trend Follow","Scalp","Other"];
const MISTAKE_TAGS=[
  "Chasing",
  "No Confirmation",
  "Early Exit",
  "Panic Sold",
  "Didn't sell in time",
  "Overtrading",
  "Revenge Trading",
  "Ignored Plan",
  "Entered Too Early",
  "Broke Time Rule (After Noon)",
  "Oversized Position",
];
const POSITIVE_TAGS=[
  "Patient",
  "Waited for Retest",
  "A+ Setup",
  "No Chase Entry",
  "Respected ORB Rules",
  "Took Profits Properly",
  "Cut Loss Early",
  "Protected Gains",
  "Position Sized Correctly",
  "Stopped on Time (Before Noon)",
  "No Trade (Good Discipline)",
  "Level Confluence (PDH/PDL/PMH/PML)",
  "FVG + Level Alignment",
  "VWAP Confirmation",
  "Volume Confirmation",
];
const LEGACY_MISTAKE_TAG_ALIASES={
  "Revenge Trade":"Revenge Trading",
  "FOMO":"Chasing",
  "Early Exit":"Early Exit",
  "Panic sold":"Panic Sold",
  "Didnt sell in time":"Didn't sell in time",
  "Late Entry":"Entered Too Early",
  "Oversize":"Oversized Position",
  "No Stop":"Ignored Plan",
  "Moved Stop":"Ignored Plan",
  "Chased Entry":"Chasing",
  "Overtrading":"Overtrading",
};
const EMOTIONS=["Calm","Confident","Anxious","Fearful","Greedy","Frustrated","Excited","FOMO","Neutral"];
const MARKETS=["Stocks","Options","Futures","Crypto","Forex"];
const VIEWS=["Dashboard","Trade Log","Analytics","AI Coach"];
const STORAGE_KEY="ej_trades_v3";
const LEGACY_STORAGE_KEYS=["ej_trades","ej_trades_v2"];
const AUTH_TOKEN_KEY="ej_auth_token_v1";
const AUTH_SOURCE_KEY="ej_auth_source_v1";
const VIEW_STORAGE_KEY="ej_last_view_v1";
const LOCAL_AUTH_DB_KEY="ej_local_auth_db_v1";
const LOCAL_JWT_SECRET="moskiptp-local-jwt-secret";
const THEME_STORAGE_KEY="ej_theme_v1";
const ACCOUNT_LEDGER_STORAGE_PREFIX="ej_account_ledger_v1";
const ACCOUNT_TRANSACTION_TYPES=["deposit","withdrawal"];

const storage={
  get(key){
    if(typeof window==="undefined")return{value:null};
    try{return{value:window.localStorage.getItem(key)};}catch{return{value:null};}
  },
  set(key,value){
    if(typeof window==="undefined")return false;
    try{window.localStorage.setItem(key,value);return true;}catch{return false;}
  },
  remove(key){
    if(typeof window==="undefined")return false;
    try{window.localStorage.removeItem(key);return true;}catch{return false;}
  },
};

function getStoredView(){
  const value=Number(storage.get(VIEW_STORAGE_KEY).value);
  return Number.isInteger(value)&&value>=0&&value<VIEWS.length?value:0;
}

function getStoredTheme(){
  const saved=storage.get(THEME_STORAGE_KEY).value;
  if(saved==="light"||saved==="dark")return saved;
  if(typeof window!=="undefined"&&window.matchMedia?.("(prefers-color-scheme: dark)").matches)return"dark";
  return"light";
}

function clearLegacyTradeStorage(){
  [STORAGE_KEY,...LEGACY_STORAGE_KEYS].forEach(key=>storage.remove(key));
}

function loadLegacyTradesFromStorage(){
  try{
    const collected=[STORAGE_KEY,...LEGACY_STORAGE_KEYS].flatMap(key=>{
      const saved=storage.get(key).value;
      const parsed=saved?JSON.parse(saved):[];
      return Array.isArray(parsed)?parsed:[];
    });
    return mergeTrades([],normalizeTrades(collected)).trades;
  }catch{
    return[];
  }
}

function normalizeIdentifier(value){
  return String(value||"").trim().toLowerCase();
}

function loadLocalAuthDb(){
  try{
    const raw=storage.get(LOCAL_AUTH_DB_KEY).value;
    const parsed=raw?JSON.parse(raw):{};
    return{users:Array.isArray(parsed.users)?parsed.users:[]};
  }catch{
    return{users:[]};
  }
}

function saveLocalAuthDb(db){
  const saved=storage.set(LOCAL_AUTH_DB_KEY,JSON.stringify({users:Array.isArray(db?.users)?db.users:[]}));
  if(!saved)throw new Error("Browser storage is full. Start the journal server to save screenshot-heavy trades reliably.");
}

function getStoredAccountLedgerKey(userId){
  return`${ACCOUNT_LEDGER_STORAGE_PREFIX}:${String(userId||"guest").trim()}`;
}

function loadStoredAccountLedger(userId){
  if(!userId)return{startingBalance:0,transactions:[]};
  try{
    const raw=storage.get(getStoredAccountLedgerKey(userId)).value;
    const parsed=raw?JSON.parse(raw):{};
    return{
      startingBalance:normalizeStartingBalance(parsed.startingBalance??parsed.starting_balance),
      transactions:normalizeAccountTransactions(parsed.transactions??parsed.account_transactions,userId),
    };
  }catch{
    return{startingBalance:0,transactions:[]};
  }
}

function saveStoredAccountLedger(userId,{startingBalance,transactions}){
  if(!userId)return false;
  const saved=storage.set(getStoredAccountLedgerKey(userId),JSON.stringify({
    startingBalance:normalizeStartingBalance(startingBalance),
    transactions:normalizeAccountTransactions(transactions,userId),
  }));
  if(!saved)throw new Error("Browser storage is full. Unable to save account transactions locally.");
  return true;
}

function sortReflectionsDescending(reflections){
  return [...reflections].sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))||String(b.updated_at||"").localeCompare(String(a.updated_at||"")));
}

function normalizeReflection(reflection,userId=""){
  if(!reflection||typeof reflection!=="object")return null;
  const date=String(reflection.date||"").trim();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return null;

  const createdAt=String(reflection.created_at||reflection.createdAt||new Date().toISOString());
  const updatedAt=String(reflection.updated_at||reflection.updatedAt||createdAt);

  return{
    id:String(reflection.id||`reflection-${crypto.randomUUID?.()||Date.now()}`),
    user_id:String(reflection.user_id||reflection.userId||userId||""),
    date,
    overall_summary:String(reflection.overall_summary||reflection.overallSummary||"").trim(),
    did_right:String(reflection.did_right||reflection.didRight||"").trim(),
    did_wrong:String(reflection.did_wrong||reflection.didWrong||"").trim(),
    improve_tomorrow:String(reflection.improve_tomorrow||reflection.improveTomorrow||"").trim(),
    created_at:createdAt,
    updated_at:updatedAt,
  };
}

function normalizeReflections(reflections,userId=""){
  const byDate={};
  (Array.isArray(reflections)?reflections:[]).forEach(reflection=>{
    const normalized=normalizeReflection(reflection,userId);
    if(!normalized)return;
    const existing=byDate[normalized.date];
    if(!existing||String(normalized.updated_at||"").localeCompare(String(existing.updated_at||""))>0){
      byDate[normalized.date]=normalized;
    }
  });
  return sortReflectionsDescending(Object.values(byDate));
}

function sortDailyAiReviewsDescending(reviews){
  return [...reviews].sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))||String(b.updated_at||"").localeCompare(String(a.updated_at||"")));
}

function normalizeDailyAiReview(review,userId=""){
  if(!review||typeof review!=="object")return null;
  const date=String(review.date||"").trim();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return null;

  const createdAt=String(review.created_at||review.createdAt||new Date().toISOString());
  const updatedAt=String(review.updated_at||review.updatedAt||createdAt);

  return{
    id:String(review.id||`daily-ai-review-${crypto.randomUUID?.()||Date.now()}`),
    user_id:String(review.user_id||review.userId||userId||""),
    date,
    ai_summary:String(review.ai_summary||review.aiSummary||"").trim(),
    strengths:String(review.strengths||"").trim(),
    weaknesses:String(review.weaknesses||"").trim(),
    tag_patterns:String(review.tag_patterns||review.tagPatterns||"").trim(),
    behavior_patterns:String(review.behavior_patterns||review.behaviorPatterns||"").trim(),
    tomorrow_focus:String(review.tomorrow_focus||review.tomorrowFocus||"").trim(),
    created_at:createdAt,
    updated_at:updatedAt,
  };
}

function normalizeDailyAiReviews(reviews,userId=""){
  const byDate={};
  (Array.isArray(reviews)?reviews:[]).forEach(review=>{
    const normalized=normalizeDailyAiReview(review,userId);
    if(!normalized)return;
    const existing=byDate[normalized.date];
    if(!existing||String(normalized.updated_at||"").localeCompare(String(existing.updated_at||""))>0){
      byDate[normalized.date]=normalized;
    }
  });
  return sortDailyAiReviewsDescending(Object.values(byDate));
}

function roundCurrencyValue(value){
  const numeric=Number(value);
  if(!Number.isFinite(numeric))return 0;
  return Math.round(numeric*100)/100;
}

function normalizeStartingBalance(value){
  const parsed=parseMaybeNumber(value);
  return parsed===null?0:roundCurrencyValue(parsed);
}

function normalizeAccountTransactionType(value,amount=0){
  const normalized=String(value||"").trim().toLowerCase();
  if(ACCOUNT_TRANSACTION_TYPES.includes(normalized))return normalized;
  return Number(amount)<0?"withdrawal":"deposit";
}

function getSignedTransactionAmount(transaction){
  const type=normalizeAccountTransactionType(transaction?.type,transaction?.amount);
  const amount=Math.abs(roundCurrencyValue(transaction?.amount));
  return type==="withdrawal"?-amount:amount;
}

function sortAccountTransactionsDescending(transactions){
  return [...transactions].sort((a,b)=>
    String(b.date||"").localeCompare(String(a.date||""))||
    String(b.updated_at||"").localeCompare(String(a.updated_at||""))||
    String(a.account||"").localeCompare(String(b.account||""))
  );
}

function normalizeAccountTransaction(transaction,userId=""){
  if(!transaction||typeof transaction!=="object")return null;
  const account=String(transaction.account||"").trim();
  const date=String(transaction.date||"").trim();
  const amount=parseMaybeNumber(transaction.amount);

  if(!account||!/^\d{4}-\d{2}-\d{2}$/.test(date)||amount===null)return null;

  const createdAt=String(transaction.created_at||transaction.createdAt||new Date().toISOString());
  const updatedAt=String(transaction.updated_at||transaction.updatedAt||createdAt);

  return{
    id:String(transaction.id||`account-transaction-${crypto.randomUUID?.()||Date.now()}`),
    user_id:String(transaction.user_id||transaction.userId||userId||""),
    account,
    date,
    type:normalizeAccountTransactionType(transaction.type,amount),
    amount:Math.abs(roundCurrencyValue(amount)),
    created_at:createdAt,
    updated_at:updatedAt,
  };
}

function normalizeAccountTransactions(transactions,userId=""){
  const byId={};
  (Array.isArray(transactions)?transactions:[]).forEach(transaction=>{
    const normalized=normalizeAccountTransaction(transaction,userId);
    if(!normalized)return;
    const existing=byId[normalized.id];
    if(!existing||String(normalized.updated_at||"").localeCompare(String(existing.updated_at||""))>0){
      byId[normalized.id]=normalized;
    }
  });
  return sortAccountTransactionsDescending(Object.values(byId));
}

function calcCashFlowTotal(transactions){
  return roundCurrencyValue(
    normalizeAccountTransactions(transactions).reduce((sum,transaction)=>sum+getSignedTransactionAmount(transaction),0)
  );
}

function calcTradesPnlTotal(trades){
  return roundCurrencyValue((Array.isArray(trades)?trades:[]).reduce((sum,trade)=>sum+calcPnl(trade),0));
}

function calcLedgerSummary(startingBalance,transactions,trades=[]){
  const netDeposits=calcCashFlowTotal(transactions);
  const allTimeReturn=calcTradesPnlTotal(trades);
  const currentValue=roundCurrencyValue(netDeposits+allTimeReturn);
  const allTimeRoiPct=Math.abs(netDeposits)>0.005
    ?allTimeReturn/netDeposits
    :null;

  return{
    startingBalance:normalizeStartingBalance(startingBalance),
    netDeposits,
    allTimeReturn,
    currentValue,
    allTimeRoiPct,
  };
}

function calcCurrentCashBalance(startingBalance,transactions,trades=[]){
  return calcLedgerSummary(startingBalance,transactions,trades).currentValue;
}

function encodeBase64Url(value){
  const bytes=value instanceof Uint8Array?value:new TextEncoder().encode(value);
  let binary="";
  bytes.forEach(byte=>{binary+=String.fromCharCode(byte);});
  return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}

function decodeBase64Url(value){
  const normalized=String(value||"").replace(/-/g,"+").replace(/_/g,"/");
  const padded=normalized+"=".repeat((4-(normalized.length%4))%4);
  const binary=atob(padded);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return bytes;
}

async function getLocalJwtKey(){
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(LOCAL_JWT_SECRET),
    {name:"HMAC",hash:"SHA-256"},
    false,
    ["sign","verify"],
  );
}

async function signLocalToken(user){
  const header=encodeBase64Url(JSON.stringify({alg:"HS256",typ:"JWT"}));
  const payload=encodeBase64Url(JSON.stringify({
    sub:user.id,
    username:user.username,
    email:user.email,
    exp:Math.floor(Date.now()/1000)+(30*24*60*60),
    iss:"moskiptp-local",
  }));
  const unsigned=`${header}.${payload}`;
  const signature=await crypto.subtle.sign("HMAC",await getLocalJwtKey(),new TextEncoder().encode(unsigned));
  return`${unsigned}.${encodeBase64Url(new Uint8Array(signature))}`;
}

async function verifyLocalToken(token){
  const parts=String(token||"").split(".");
  if(parts.length!==3)throw new Error("Session expired. Please log in again.");

  const [header,payload,signature]=parts;
  const unsigned=`${header}.${payload}`;
  const valid=await crypto.subtle.verify(
    "HMAC",
    await getLocalJwtKey(),
    decodeBase64Url(signature),
    new TextEncoder().encode(unsigned),
  );

  if(!valid)throw new Error("Session expired. Please log in again.");

  let decodedPayload;
  try{
    decodedPayload=JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)));
  }catch{
    throw new Error("Session expired. Please log in again.");
  }

  if(decodedPayload.exp&&decodedPayload.exp<Math.floor(Date.now()/1000)){
    throw new Error("Session expired. Please log in again.");
  }

  return decodedPayload;
}

function serializeLocalUser(user){
  return{
    id:user.id,
    username:user.username,
    email:user.email,
    createdAt:user.createdAt,
  };
}

function createServerUnavailableError(){
  const error=new Error("Unable to reach the journal server. Start `npm run dev`, `npm run api`, or `npm run preview`.");
  error.code="SERVER_UNREACHABLE";
  return error;
}

function isServerUnavailableError(error){
  return error?.code==="SERVER_UNREACHABLE";
}

function isInvalidCredentialsError(error){
  return /invalid login credentials/i.test(String(error?.message||""));
}

function isMissingReflectionRouteError(error){
  return /\bnot found\b/i.test(String(error?.message||""));
}

function isMissingDailyAiReviewRouteError(error){
  return /\bnot found\b/i.test(String(error?.message||""));
}

function isMissingAccountTransactionsRouteError(error){
  return /\bnot found\b/i.test(String(error?.message||""));
}

async function localRegister({username,email,password}){
  const db=loadLocalAuthDb();
  const trimmedUsername=String(username||"").trim();
  const normalizedEmail=normalizeIdentifier(email);

  if(db.users.some(user=>normalizeIdentifier(user.email)===normalizedEmail))throw new Error("That email is already registered.");
  if(db.users.some(user=>normalizeIdentifier(user.username)===normalizeIdentifier(trimmedUsername)))throw new Error("That username is already taken.");

  const user={
    id:crypto.randomUUID(),
    username:trimmedUsername,
    email:normalizedEmail,
    passwordHash:await bcrypt.hash(password,10),
    trades:[],
    reflections:[],
    daily_ai_reviews:[],
    account_transactions:[],
    starting_balance:0,
    createdAt:new Date().toISOString(),
  };

  db.users.push(user);
  saveLocalAuthDb(db);

  return{
    token:await signLocalToken(user),
    user:serializeLocalUser(user),
    trades:user.trades,
    reflections:user.reflections,
    daily_ai_reviews:user.daily_ai_reviews,
    account_transactions:user.account_transactions,
    starting_balance:user.starting_balance,
  };
}

async function localLogin({identifier,password}){
  const db=loadLocalAuthDb();
  const normalized=normalizeIdentifier(identifier);
  const user=db.users.find(entry=>normalizeIdentifier(entry.email)===normalized||normalizeIdentifier(entry.username)===normalized);

  if(!user)throw new Error("Invalid login credentials.");

  const validPassword=await bcrypt.compare(password,user.passwordHash);
  if(!validPassword)throw new Error("Invalid login credentials.");

  return{
    token:await signLocalToken(user),
    user:serializeLocalUser(user),
    trades:Array.isArray(user.trades)?user.trades:[],
    reflections:normalizeReflections(user.reflections,user.id),
    daily_ai_reviews:normalizeDailyAiReviews(user.daily_ai_reviews,user.id),
    account_transactions:normalizeAccountTransactions(user.account_transactions,user.id),
    starting_balance:normalizeStartingBalance(user.starting_balance),
  };
}

async function localSession(token){
  const payload=await verifyLocalToken(token);
  const db=loadLocalAuthDb();
  const user=db.users.find(entry=>entry.id===payload.sub);

  if(!user)throw new Error("Session is no longer valid.");

  return{
    user:serializeLocalUser(user),
    trades:Array.isArray(user.trades)?user.trades:[],
    reflections:normalizeReflections(user.reflections,user.id),
    daily_ai_reviews:normalizeDailyAiReviews(user.daily_ai_reviews,user.id),
    account_transactions:normalizeAccountTransactions(user.account_transactions,user.id),
    starting_balance:normalizeStartingBalance(user.starting_balance),
  };
}

async function localSaveTrades(token,trades){
  const payload=await verifyLocalToken(token);
  const db=loadLocalAuthDb();
  const user=db.users.find(entry=>entry.id===payload.sub);

  if(!user)throw new Error("Session is no longer valid.");

  user.trades=trades;
  user.updatedAt=new Date().toISOString();
  saveLocalAuthDb(db);

  return{trades:user.trades};
}

async function localSaveReflection(token,reflection){
  const payload=await verifyLocalToken(token);
  const db=loadLocalAuthDb();
  const user=db.users.find(entry=>entry.id===payload.sub);

  if(!user)throw new Error("Session is no longer valid.");

  const normalized=normalizeReflection(reflection,user.id);
  if(!normalized)throw new Error("Reflection date must be in YYYY-MM-DD format.");

  const current=normalizeReflections(user.reflections,user.id);
  const existing=current.find(entry=>entry.date===normalized.date);
  const now=new Date().toISOString();

  user.reflections=normalizeReflections([
    ...current.filter(entry=>entry.date!==normalized.date),
    existing
      ?{
        ...existing,
        ...normalized,
        id:existing.id,
        user_id:user.id,
        created_at:existing.created_at,
        updated_at:now,
      }
      :{
        ...normalized,
        id:normalized.id||`reflection-${crypto.randomUUID?.()||Date.now()}`,
        user_id:user.id,
        created_at:now,
        updated_at:now,
      },
  ],user.id);
  user.updatedAt=now;
  saveLocalAuthDb(db);

  return{reflections:user.reflections};
}

async function localSaveDailyAiReview(token,review){
  const payload=await verifyLocalToken(token);
  const db=loadLocalAuthDb();
  const user=db.users.find(entry=>entry.id===payload.sub);

  if(!user)throw new Error("Session is no longer valid.");

  const normalized=normalizeDailyAiReview(review,user.id);
  if(!normalized)throw new Error("AI review date must be in YYYY-MM-DD format.");

  const current=normalizeDailyAiReviews(user.daily_ai_reviews,user.id);
  const existing=current.find(entry=>entry.date===normalized.date);
  const now=new Date().toISOString();

  user.daily_ai_reviews=normalizeDailyAiReviews([
    ...current.filter(entry=>entry.date!==normalized.date),
    existing
      ?{
        ...existing,
        ...normalized,
        id:existing.id,
        user_id:user.id,
        created_at:existing.created_at,
        updated_at:now,
      }
      :{
        ...normalized,
        id:normalized.id||`daily-ai-review-${crypto.randomUUID?.()||Date.now()}`,
        user_id:user.id,
        created_at:now,
        updated_at:now,
      },
  ],user.id);
  user.updatedAt=now;
  saveLocalAuthDb(db);

  return{daily_ai_reviews:user.daily_ai_reviews};
}

async function localSaveAccountLedger(token,{startingBalance,transactions}){
  const payload=await verifyLocalToken(token);
  const db=loadLocalAuthDb();
  const user=db.users.find(entry=>entry.id===payload.sub);

  if(!user)throw new Error("Session is no longer valid.");

  user.starting_balance=normalizeStartingBalance(startingBalance);
  user.account_transactions=normalizeAccountTransactions(transactions,user.id);
  user.updatedAt=new Date().toISOString();
  saveLocalAuthDb(db);

  return{
    starting_balance:user.starting_balance,
    account_transactions:user.account_transactions,
  };
}

function getApiCandidates(path){
  if(typeof window==="undefined")return[path];
  if(/^https?:\/\//i.test(path))return[path];

  const candidates=[];
  const push=url=>{
    if(url&&!candidates.includes(url))candidates.push(url);
  };

  const protocol=window.location.protocol;
  const hostname=window.location.hostname;
  const isFile=protocol==="file:";
  const isLocalHost=hostname==="localhost"||hostname==="127.0.0.1"||hostname==="0.0.0.0";

  if(!isFile)push(path);
  if(isLocalHost){
    push(`http://127.0.0.1:3001${path}`);
    push(`http://localhost:3001${path}`);
  }
  if(!candidates.length)push(path);

  return candidates;
}

async function apiRequest(path,{method="GET",token,body}={}){
  let fallbackError=null;

  for(const candidate of getApiCandidates(path)){
    let response;

    try{
      response=await fetch(candidate,{
        method,
        headers:{
          ...(body!==undefined?{"Content-Type":"application/json"}:{ }),
          ...(token?{Authorization:`Bearer ${token}`}:{ }),
        },
        body:body!==undefined?JSON.stringify(body):undefined,
      });
    }catch{
      fallbackError=createServerUnavailableError();
      continue;
    }

    const text=await response.text();
    let payload={};

    if(text){
      try{
        payload=JSON.parse(text);
      }catch{
        payload={};
      }
    }

    if(response.ok)return payload;

    const message=payload.error||"Request failed.";
    const shouldRetryCandidate=!payload.error&&(response.status===404||response.status>=500);

    if(shouldRetryCandidate){
      fallbackError=createServerUnavailableError();
      continue;
    }

    throw new Error(message);
  }

  throw fallbackError||createServerUnavailableError();
}

function normalizeHeader(header){
  return String(header||"")
    .trim()
    .toLowerCase()
    .replace(/%/g," pct")
    .replace(/[^a-z0-9]+/g,"_")
    .replace(/^_+|_+$/g,"");
}

function parseMaybeNumber(value){
  if(value===null||value===undefined)return null;
  if(typeof value==="number")return Number.isFinite(value)?value:null;
  const cleaned=String(value).trim().replace(/[$,%\s]/g,"").replace(/,/g,"");
  if(!cleaned||cleaned==="-"||cleaned==="--")return null;
  const num=Number(cleaned);
  return Number.isFinite(num)?num:null;
}

function parseHoldMinutes(value){
  const match=String(value||"").toUpperCase().match(/(\d+)\s*MIN/);
  return match?Number(match[1]):null;
}

async function readFileAsDataUrl(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(String(reader.result||""));
    reader.onerror=()=>reject(new Error("Unable to read the selected image."));
    reader.readAsDataURL(file);
  });
}

async function optimizeScreenshot(file,{maxDimension=1280,quality=0.8}={}){
  if(typeof window==="undefined"||!file||!String(file.type||"").startsWith("image/"))return null;
  const source=await readFileAsDataUrl(file);

  return new Promise((resolve,reject)=>{
    const image=new Image();
    image.onload=()=>{
      const scale=Math.min(1,maxDimension/Math.max(image.width||1,image.height||1));
      const width=Math.max(1,Math.round((image.width||1)*scale));
      const height=Math.max(1,Math.round((image.height||1)*scale));
      const canvas=document.createElement("canvas");
      canvas.width=width;
      canvas.height=height;
      const ctx=canvas.getContext("2d");
      if(!ctx){
        reject(new Error("Unable to process the selected image."));
        return;
      }
      ctx.fillStyle="#ffffff";
      ctx.fillRect(0,0,width,height);
      ctx.drawImage(image,0,0,width,height);
      resolve(canvas.toDataURL("image/jpeg",quality));
    };
    image.onerror=()=>reject(new Error("Unable to process the selected image."));
    image.src=source;
  });
}

function parseTimeParts(value){
  const match=String(value||"").trim().match(/^(\d{1,2}):(\d{2})$/);
  if(!match)return null;
  const hours=Number(match[1]);
  const minutes=Number(match[2]);
  if(hours<0||hours>23||minutes<0||minutes>59)return null;
  return{hours,minutes};
}

function addMinutesToTime(value,minutesToAdd){
  const parts=parseTimeParts(value);
  const minutes=parseMaybeNumber(minutesToAdd);
  if(!parts||minutes===null)return value||"";
  const total=((parts.hours*60)+parts.minutes+minutes)%(24*60);
  const normalized=total<0?total+(24*60):total;
  const hours=String(Math.floor(normalized/60)).padStart(2,"0");
  const minutesPart=String(normalized%60).padStart(2,"0");
  return`${hours}:${minutesPart}`;
}

function formatTime12h(value){
  const parts=parseTimeParts(value);
  if(!parts)return value||"";
  const period=parts.hours>=12?"PM":"AM";
  const hour12=parts.hours%12||12;
  return`${hour12}:${String(parts.minutes).padStart(2,"0")} ${period}`;
}

function formatTimeRange(start,end){
  const startLabel=formatTime12h(start);
  const endLabel=formatTime12h(end);
  if(startLabel&&endLabel)return`${startLabel} - ${endLabel}`;
  return startLabel||endLabel||"";
}

function formatHourLabel(hour){
  return formatTime12h(`${String(hour).padStart(2,"0")}:00`);
}

function parseDateOnly(value){
  const match=String(value||"").trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!match)return null;
  return new Date(Number(match[1]),Number(match[2])-1,Number(match[3]));
}

function normalizeDateKey(value){
  const text=String(value||"").trim();
  return parseDateOnly(text)?text:"";
}

function formatShortDate(value){
  const date=parseDateOnly(value);
  return date?date.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):String(value||"");
}

function startOfDay(date){
  return new Date(date.getFullYear(),date.getMonth(),date.getDate());
}

function addDays(date,days){
  const next=new Date(date);
  next.setDate(next.getDate()+days);
  return startOfDay(next);
}

function startOfWeek(date){
  const day=(date.getDay()+6)%7;
  return addDays(startOfDay(date),-day);
}

function startOfMonth(date){
  return new Date(date.getFullYear(),date.getMonth(),1);
}

function startOfYear(date){
  return new Date(date.getFullYear(),0,1);
}

function getTradeDateTime(trade){
  const date=parseDateOnly(getRowDate(trade?.entries?.[0],trade?.date));
  if(!date)return 0;
  const time=parseTimeParts(trade?.entries?.[0]?.time)||parseTimeParts(trade?.exits?.[0]?.time);
  if(time)date.setHours(time.hours,time.minutes,0,0);
  else date.setHours(0,0,0,0);
  return date.getTime();
}

function getTradeExitDateTime(trade){
  const date=parseDateOnly(getTradeExitDateKey(trade));
  if(!date)return getTradeDateTime(trade);
  const exits=getTimedTradeExitRows(trade);
  const finalExit=exits[exits.length-1];
  const time=parseTimeParts(finalExit?.time);
  if(time)date.setHours(time.hours,time.minutes,0,0);
  else date.setHours(0,0,0,0);
  return date.getTime();
}

function matchesDatePreset(trade,preset,now=new Date()){
  if(preset==="ALL")return true;
  const tradeDate=parseDateOnly(getRowDate(trade?.entries?.[0],trade?.date));
  if(!tradeDate)return false;
  const tradeDay=startOfDay(tradeDate);
  const today=startOfDay(now);
  const tomorrow=addDays(today,1);
  const yesterday=addDays(today,-1);
  const thisWeekStart=startOfWeek(today);
  const nextWeekStart=addDays(thisWeekStart,7);
  const lastWeekStart=addDays(thisWeekStart,-7);
  const thisMonthStart=startOfMonth(today);
  const nextMonthStart=new Date(today.getFullYear(),today.getMonth()+1,1);
  const lastMonthStart=new Date(today.getFullYear(),today.getMonth()-1,1);
  const thisYearStart=startOfYear(today);
  const nextYearStart=new Date(today.getFullYear()+1,0,1);

  if(preset==="TODAY")return tradeDay>=today&&tradeDay<tomorrow;
  if(preset==="YESTERDAY")return tradeDay>=yesterday&&tradeDay<today;
  if(preset==="THIS_WEEK")return tradeDay>=thisWeekStart&&tradeDay<nextWeekStart;
  if(preset==="LAST_WEEK")return tradeDay>=lastWeekStart&&tradeDay<thisWeekStart;
  if(preset==="THIS_MONTH")return tradeDay>=thisMonthStart&&tradeDay<nextMonthStart;
  if(preset==="LAST_MONTH")return tradeDay>=lastMonthStart&&tradeDay<thisMonthStart;
  if(preset==="THIS_YEAR")return tradeDay>=thisYearStart&&tradeDay<nextYearStart;
  return true;
}

function normalizeMarket(value){
  const raw=String(value||"").trim().toUpperCase();
  if(raw==="OPTION"||raw==="OPTIONS")return"Options";
  if(raw==="STOCK"||raw==="STOCKS")return"Stocks";
  if(raw==="FUTURE"||raw==="FUTURES")return"Futures";
  if(raw==="CRYPTO")return"Crypto";
  if(raw==="FOREX"||raw==="FX")return"Forex";
  return value||"Stocks";
}

function normalizeDirection(value){
  const raw=String(value||"").trim().toUpperCase();
  if(raw==="SHORT"||raw==="SELL"||raw==="PUT")return"SHORT";
  if(raw==="LONG"||raw==="BUY"||raw==="CALL")return"LONG";
  return"LONG";
}

function getDirectionLabel(value){
  return normalizeDirection(value)==="SHORT"?"PUT":"CALL";
}

function getDirectionColor(value){
  return normalizeDirection(value)==="SHORT"?C.red:C.green;
}

function getDirectionActiveBackground(value){
  return normalizeDirection(value)==="SHORT"?C.redBg:C.greenBg;
}

function normalizeMistakeTag(value){
  const raw=String(value||"").trim();
  return LEGACY_MISTAKE_TAG_ALIASES[raw]||raw;
}

function normalizePositiveTag(value){
  return String(value||"").trim();
}

function parseCsvRows(text){
  const rows=[];
  let row=[];
  let cell="";
  let inQuotes=false;

  for(let i=0;i<text.length;i++){
    const ch=text[i];
    const next=text[i+1];

    if(ch==='"'){
      if(inQuotes&&next==='"'){
        cell+='"';
        i++;
      }else if(inQuotes){
        inQuotes=false;
      }else if(cell===""){
        inQuotes=true;
      }else{
        cell+='"';
      }
      continue;
    }

    if(ch===","&&!inQuotes){
      row.push(cell);
      cell="";
      continue;
    }

    if((ch==="\n"||ch==="\r")&&!inQuotes){
      if(ch==="\r"&&next==="\n")i++;
      row.push(cell);
      if(row.some(value=>String(value).trim()!==""))rows.push(row);
      row=[];
      cell="";
      continue;
    }

    cell+=ch;
  }

  if(cell.length||row.length){
    row.push(cell);
    if(row.some(value=>String(value).trim()!==""))rows.push(row);
  }

  return rows;
}

const SAMPLE=[
  {id:"s1",date:"2025-04-07",symbol:"SPY",market:"Stocks",direction:"SHORT",
   entries:[{price:658.20,qty:5,time:"09:45"}],exits:[{price:660.60,qty:5,time:"10:32"}],
   targetPrice:644,stopLoss:661,fees:3.50,strategy:"ORB",mistakes:["Revenge Trade"],emotion:"Frustrated",
   preTrade:"Bearish bias. Geopolitical risk (Iran/Hormuz). PDH ~658, PDL ~644. Plan: short ORB break below 655.",
   postTrade:"Entered too early before ORB confirmed. Revenge traded after the gap down open. Should have waited for 15m candle close below range."},
  {id:"s2",date:"2025-04-08",symbol:"SPY",market:"Stocks",direction:"SHORT",
   entries:[{price:655.10,qty:3,time:"09:47"}],exits:[{price:641.30,qty:3,time:"10:49"}],
   targetPrice:640,stopLoss:658,fees:2.10,strategy:"ORB",mistakes:[],emotion:"Confident",
   preTrade:"Clean ORB short setup. PDL 644 as target, PDH 658 as stop. R:R ~2.8. Waited for full 15m candle close below range.",
   postTrade:"Perfect execution. Held through consolidation at 648. Let trade develop. Should be model trade."},
  {id:"s3",date:"2025-04-09",symbol:"SPY",market:"Stocks",direction:"LONG",
   entries:[{price:643.50,qty:4,time:"10:02"}],exits:[{price:649.20,qty:4,time:"10:33"}],
   targetPrice:655,stopLoss:641,fees:2.80,strategy:"ORB",mistakes:["FOMO","Early Exit"],emotion:"FOMO",
   preTrade:"No real long setup. SPY bouncing but primary trend is down. FOMO from missing previous short.",
   postTrade:"FOMO long against trend. Exited early at 649 instead of 655 target. Net positive but bad process. PML was not broken."},
  {id:"s4",date:"2025-04-10",symbol:"SPY",market:"Stocks",direction:"SHORT",
   entries:[{price:651.80,qty:5,time:"09:46"}],exits:[{price:648.90,qty:5,time:"10:41"}],
   targetPrice:645,stopLoss:654.50,fees:3.50,strategy:"Breakout",mistakes:[],emotion:"Calm",
   preTrade:"VWAP breakdown. Target PDL 644. Stop above VWAP reclaim.",
   postTrade:"Good trade. Could have held to 645 but 648.90 exit was reasonable given midday approach."},
  {id:"s5",date:"2025-04-11",symbol:"SPY",market:"Stocks",direction:"SHORT",
   entries:[{price:653.40,qty:4,time:"09:48"}],exits:[{price:655.10,qty:4,time:"10:06"}],
   targetPrice:646,stopLoss:656,fees:2.80,strategy:"ORB",mistakes:["Early Exit"],emotion:"Anxious",
   preTrade:"ORB short. Target 646. Stop 656. Setup was valid.",
   postTrade:"Exited too early at small loss when trade needed more time. Anxiety from prior losses."},
  {id:"s6",date:"2025-04-14",symbol:"SPY",market:"Stocks",direction:"SHORT",
   entries:[{price:649.20,qty:5,time:"09:47"}],exits:[{price:640.80,qty:5,time:"11:05"}],
   targetPrice:640,stopLoss:652,fees:3.50,strategy:"ORB",mistakes:[],emotion:"Confident",
   preTrade:"Strong ORB short. PMH broken. Target 640 PML. R:R 3:1. Full conviction.",
   postTrade:"Best trade of month. Patient hold through 644 consolidation. Let structure play out. Exited at target."},
  {id:"s7",date:"2025-04-15",symbol:"SPY",market:"Stocks",direction:"LONG",
   entries:[{price:641.50,qty:3,time:"10:15"}],exits:[{price:638.20,qty:3,time:"10:37"}],
   targetPrice:648,stopLoss:639.50,fees:2.10,strategy:"Breakout",mistakes:["Revenge Trade","FOMO"],emotion:"Frustrated",
   preTrade:"Trying to long into bounce. No real setup defined.",
   postTrade:"Revenge long after strong short run. Counter-trend. Stopped out fast. Classic tilt pattern."},
  {id:"s8",date:"2025-04-16",symbol:"SPY",market:"Stocks",direction:"SHORT",
   entries:[{price:645.60,qty:5,time:"09:48"}],exits:[{price:638.90,qty:5,time:"10:52"}],
   targetPrice:638,stopLoss:648,fees:3.50,strategy:"ORB",mistakes:[],emotion:"Calm",
   preTrade:"Clean ORB break. PDL area as target. R:R ~2.5. Solid setup.",
   postTrade:"Solid execution. Held through noise. Exit slightly early but close to target. Good day."},
];

// â”€â”€ Calculations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function calcPnl(t){
  const realized=parseMaybeNumber(t.realizedPnl);
  if(realized!==null)return realized;
  const eq=t.entries.reduce((s,e)=>s+(+e.qty||0),0);
  const tq=t.exits.reduce((s,e)=>s+(+e.qty),0);
  if(!tq||!eq)return 0;
  const ae=t.entries.reduce((s,e)=>s+(+e.price)*(+e.qty),0)/eq;
  const ax=t.exits.reduce((s,e)=>s+(+e.price)*(+e.qty),0)/tq;
  return((ax-ae)*tq)-(+t.fees||0);
}
function normalizeOutcomeStatus(value){
  const status=String(value||"").trim().toUpperCase();
  if(!status)return"";
  if(["WIN","W"].includes(status))return"WIN";
  if(["LOSS","L"].includes(status))return"LOSS";
  if(["WASH","BE","B/E","BREAKEVEN","BREAK EVEN","EVEN","SCRATCH","FLAT"].includes(status))return"WASH";
  return"";
}
function getTradeOutcome(trade){
  const explicit=normalizeOutcomeStatus(trade?.csvStatus||trade?.status);
  if(explicit)return explicit;
  const pnl=calcPnl(trade);
  if(pnl>0)return"WIN";
  if(pnl<0)return"LOSS";
  return"WASH";
}
function calcRR(t){
  if(!t.stopLoss||!t.targetPrice)return null;
  const eq=t.entries.reduce((s,e)=>s+(+e.qty||0),0);
  if(!eq)return null;
  const ae=t.entries.reduce((s,e)=>s+(+e.price)*(+e.qty),0)/eq;
  const risk=Math.abs(ae-t.stopLoss),reward=Math.abs(+t.targetPrice-ae);
  return risk>0?(reward/risk).toFixed(2):null;
}

function elapsedMinutes(startMinutes,endMinutes){
  if(startMinutes===null||endMinutes===null)return null;
  const elapsed=endMinutes-startMinutes;
  return elapsed>=0?elapsed:elapsed+(24*60);
}

function getTimedTradeRows(rows,fallbackDate=""){
  return(Array.isArray(rows)?rows:[])
    .map((row,index)=>({
      index,
      date:getRowDate(row,fallbackDate),
      time:row?.time||"",
      minutes:timeToMinutes(row?.time),
      sortMinutes:getRowSortMinutes(row,fallbackDate),
    }))
    .filter(row=>row.minutes!==null)
    .sort((a,b)=>(a.sortMinutes??a.minutes)-(b.sortMinutes??b.minutes)||a.index-b.index);
}

function calcDur(t){
  if(parseMaybeNumber(t.holdMinutes)!==null)return parseMaybeNumber(t.holdMinutes);
  const entries=getTimedTradeRows(t.entries,t.date);
  const exits=getTimedTradeExitRows(t);
  if(!entries.length||!exits.length)return null;
  return elapsedTradeRowMinutes(entries[0],exits[exits.length-1]);
}

function getTradeTimeRangeLabel(trade){
  const entries=getTimedTradeRows(trade?.entries,trade?.date);
  const exits=getTimedTradeExitRows(trade);
  const entry=entries[0];
  const exit=exits[exits.length-1];
  const base=formatTimeRange(entry?.time,exit?.time);
  if(!base||!exit?.date||exit.date===(normalizeDateKey(trade?.date)||entry?.date))return base;
  return`${base} (${formatShortDate(exit.date)} exit)`;
}

function getTradeEntryDateKey(trade){
  return getRowDate(trade?.entries?.[0],trade?.date);
}

function getTradeExitDateKey(trade){
  const entryDate=getTradeEntryDateKey(trade);
  const firstEntry=getTimedTradeRows(trade?.entries,trade?.date)[0]||null;
  const exits=Array.isArray(trade?.exits)?trade.exits:[];
  if(!exits.length)return entryDate;
  const datedExits=exits
    .map((exit,index)=>{
      const date=getEffectiveExitDateKey(exit,entryDate,firstEntry?.minutes);
      const parsed=parseDateOnly(date);
      const sortMinutes=getRowSortMinutes({...exit,date},entryDate);
      return{
        date,
        index,
        sortValue:sortMinutes??(parsed?parsed.getTime()/60000:-Infinity),
      };
    })
    .filter(exit=>exit.date);
  if(!datedExits.length)return entryDate;
  datedExits.sort((a,b)=>a.sortValue-b.sortValue||a.index-b.index);
  return datedExits[datedExits.length-1].date;
}

function getTradeLifecycleLabel(trade){
  const entries=getTimedTradeRows(trade?.entries,trade?.date);
  const exits=getTimedTradeExitRows(trade);
  const entry=entries[0]||{date:getTradeEntryDateKey(trade),time:trade?.entries?.[0]?.time||""};
  const exit=exits[exits.length-1]||{date:getTradeExitDateKey(trade),time:trade?.exits?.[0]?.time||""};
  const entryLabel=[entry.date?formatShortDate(entry.date):"",entry.time?formatTime12h(entry.time):""].filter(Boolean).join(" ");
  const exitLabel=[exit.date?formatShortDate(exit.date):"",exit.time?formatTime12h(exit.time):""].filter(Boolean).join(" ");
  if(entryLabel&&exitLabel)return`Entered ${entryLabel} | Exited ${exitLabel}`;
  if(entryLabel)return`Entered ${entryLabel}`;
  if(exitLabel)return`Exited ${exitLabel}`;
  return"Entry/exit date not set";
}

function fmtDuration(minutes){
  const total=Math.round(Number(minutes));
  if(!Number.isFinite(total)||total<0)return"Hold N/A";
  if(total<60)return`${total} min`;
  const hours=Math.floor(total/60);
  const mins=total%60;
  return mins?`${hours}h ${mins}m`:`${hours}h`;
}

function calcContractQty(trade){
  const entryQty=(Array.isArray(trade?.entries)?trade.entries:[]).reduce((sum,row)=>sum+(parseMaybeNumber(row?.qty)??0),0);
  if(entryQty>0)return entryQty;
  return(Array.isArray(trade?.exits)?trade.exits:[]).reduce((sum,row)=>sum+(parseMaybeNumber(row?.qty)??0),0);
}

function formatContractQty(qty){
  const value=Number(qty);
  if(!Number.isFinite(value)||value<=0)return"Contracts N/A";
  const label=Number.isInteger(value)?String(value):value.toFixed(2).replace(/\.?0+$/,"");
  return`${label} contract${value===1?"":"s"}`;
}
function calcStats(trades){
  if(!trades.length)return{totalPnl:0,winRate:0,avgWin:0,avgLoss:0,profitFactor:0,expectancy:0,maxDD:0,curve:[0],wins:0,losses:0,washes:0,decisiveTrades:0,loggedTrades:0};
  const pnls=trades.map(calcPnl);
  const outcomes=trades.map(getTradeOutcome);
  const wP=pnls.filter((_,index)=>outcomes[index]==="WIN");
  const lP=pnls.filter((_,index)=>outcomes[index]==="LOSS");
  const washCount=outcomes.filter(outcome=>outcome==="WASH").length;
  const decisiveTrades=wP.length+lP.length;
  const gw=wP.reduce((s,p)=>s+p,0),gl=Math.abs(lP.reduce((s,p)=>s+p,0));
  const wr=decisiveTrades?wP.length/decisiveTrades:0;
  const aw=wP.length?gw/wP.length:0,al=lP.length?gl/lP.length:0;
  const curve=[0];pnls.forEach(p=>curve.push(curve[curve.length-1]+p));
  let eq=0,peak=0,mdd=0;pnls.forEach(p=>{eq+=p;if(eq>peak)peak=eq;const d=peak-eq;if(d>mdd)mdd=d;});
  return{totalPnl:pnls.reduce((s,p)=>s+p,0),winRate:wr,avgWin:aw,avgLoss:al,profitFactor:gl>0?gw/gl:gw>0?999:0,expectancy:wr*aw-(1-wr)*al,maxDD:mdd,curve,wins:wP.length,losses:lP.length,washes:washCount,decisiveTrades,loggedTrades:trades.length};
}

function avg(nums){
  return nums.length?nums.reduce((sum,n)=>sum+n,0)/nums.length:0;
}

function fmtMoney(n,decimals=0){
  return`${n>=0?"+$":"-$"}${Math.abs(n).toFixed(decimals)}`;
}

function fmtCash(n,decimals=2,{showPlus=false}={}){
  const amount=roundCurrencyValue(n);
  return`${amount<0?"-":showPlus&&amount>0?"+":""}$${Math.abs(amount).toFixed(decimals)}`;
}

function fmtUsd(n,decimals=2,options={}){
  return`${fmtCash(n,decimals,options)} USD`;
}

function fmtPct(n){
  return`${(n*100).toFixed(1)}%`;
}

function fmtSignedPct(n){
  return`${n>0?"+":""}${fmtPct(n)}`;
}

function timeToMinutes(value){
  const parts=parseTimeParts(value);
  return parts?(parts.hours*60)+parts.minutes:null;
}

function getRowDate(row,fallbackDate=""){
  return normalizeDateKey(row?.date)||normalizeDateKey(fallbackDate);
}

function getRowSortMinutes(row,fallbackDate=""){
  const minutes=timeToMinutes(row?.time);
  if(minutes===null)return null;
  const date=parseDateOnly(getRowDate(row,fallbackDate));
  return date?(date.getTime()/60000)+minutes:minutes;
}

function getEffectiveExitDateKey(exit,entryDate,firstEntryMinutes=null){
  const date=getRowDate(exit,entryDate);
  const exitMinutes=timeToMinutes(exit?.time);
  if(
    date&&
    entryDate&&
    date===entryDate&&
    exitMinutes!==null&&
    firstEntryMinutes!==null&&
    exitMinutes<firstEntryMinutes
  ){
    const parsed=parseDateOnly(date);
    return parsed?dateToKey(addDays(parsed,1)):date;
  }
  return date;
}

function getTimedTradeExitRows(trade){
  const entryDate=getTradeEntryDateKey(trade);
  const firstEntry=getTimedTradeRows(trade?.entries,trade?.date)[0]||null;
  const exits=(Array.isArray(trade?.exits)?trade.exits:[]).map(exit=>({
    ...exit,
    date:getEffectiveExitDateKey(exit,entryDate,firstEntry?.minutes),
  }));
  return getTimedTradeRows(exits,entryDate);
}

function elapsedTradeRowMinutes(start,end){
  if(!start||!end)return null;
  if(start.sortMinutes!==null&&end.sortMinutes!==null){
    const elapsed=end.sortMinutes-start.sortMinutes;
    return elapsed>=0?elapsed:elapsed+(24*60);
  }
  return elapsedMinutes(start.minutes,end.minutes);
}

function buildExitRoiBreakdown(trade){
  const entries=(Array.isArray(trade?.entries)?trade.entries:[])
    .map((entry,index)=>({
      index,
      price:parseMaybeNumber(entry?.price),
      qty:parseMaybeNumber(entry?.qty)??0,
      minutes:timeToMinutes(entry?.time),
      sortMinutes:getRowSortMinutes(entry,trade?.date),
    }))
    .filter(entry=>entry.price!==null&&entry.qty>0)
    .sort((a,b)=>
      (a.sortMinutes??-Infinity)-(b.sortMinutes??-Infinity)||
      a.index-b.index
    );

  const exits=(Array.isArray(trade?.exits)?trade.exits:[])
    .map((exit,index)=>({
      index,
      price:parseMaybeNumber(exit?.price),
      qty:parseMaybeNumber(exit?.qty)??0,
      minutes:timeToMinutes(exit?.time),
      sortMinutes:getRowSortMinutes({
        ...exit,
        date:getEffectiveExitDateKey(exit,getTradeEntryDateKey(trade),entries[0]?.minutes),
      },trade?.date),
    }))
    .sort((a,b)=>
      (a.sortMinutes??Infinity)-(b.sortMinutes??Infinity)||
      a.index-b.index
    );

  const breakdown=Array.from({length:Array.isArray(trade?.exits)?trade.exits.length:0},()=>({
    avgCost:null,
    costBasis:null,
    pnl:null,
    roi:null,
  }));
  let entryCursor=0;
  let activeQty=0;
  let activeCost=0;

  exits.forEach(exit=>{
    const exitSortMinutes=exit.sortMinutes??Infinity;
    while(entryCursor<entries.length&&(entries[entryCursor].sortMinutes??-Infinity)<=exitSortMinutes){
      activeQty+=entries[entryCursor].qty;
      activeCost+=entries[entryCursor].price*entries[entryCursor].qty;
      entryCursor+=1;
    }

    if(exit.price===null||exit.qty<=0||activeQty<=0||activeCost<=0)return;

    const avgCost=activeCost/activeQty;
    const costBasis=avgCost*exit.qty;
    const pnl=(exit.price-avgCost)*exit.qty;
    breakdown[exit.index]={
      avgCost,
      costBasis,
      pnl,
      roi:costBasis>0?pnl/costBasis:null,
    };

    activeQty-=exit.qty;
    activeCost-=avgCost*exit.qty;
    if(activeQty<=0.000001||activeCost<=0.000001){
      activeQty=0;
      activeCost=0;
    }
  });

  return breakdown;
}

function buildExitHoldBreakdown(trade){
  const entries=(Array.isArray(trade?.entries)?trade.entries:[])
    .map((entry,index)=>({
      index,
      qty:parseMaybeNumber(entry?.qty)??0,
      minutes:timeToMinutes(entry?.time),
      sortMinutes:getRowSortMinutes(entry,trade?.date),
    }))
    .filter(entry=>entry.qty>0&&entry.sortMinutes!==null)
    .sort((a,b)=>a.sortMinutes-b.sortMinutes||a.index-b.index);

  const exits=(Array.isArray(trade?.exits)?trade.exits:[])
    .map((exit,index)=>({
      index,
      qty:parseMaybeNumber(exit?.qty)??0,
      minutes:timeToMinutes(exit?.time),
      sortMinutes:getRowSortMinutes({
        ...exit,
        date:getEffectiveExitDateKey(exit,getTradeEntryDateKey(trade),entries[0]?.minutes),
      },trade?.date),
    }))
    .sort((a,b)=>
      (a.sortMinutes??Infinity)-(b.sortMinutes??Infinity)||
      a.index-b.index
    );

  const breakdown=Array.from({length:Array.isArray(trade?.exits)?trade.exits.length:0},()=>null);
  const activeLots=[];
  let entryCursor=0;

  exits.forEach(exit=>{
    if(exit.qty<=0||exit.sortMinutes===null)return;

    while(entryCursor<entries.length&&entries[entryCursor].sortMinutes<=exit.sortMinutes){
      activeLots.push({...entries[entryCursor],remainingQty:entries[entryCursor].qty});
      entryCursor+=1;
    }

    let remainingExitQty=exit.qty;
    let matchedQty=0;
    let weightedHold=0;

    while(remainingExitQty>0&&activeLots.length){
      const lot=activeLots[0];
      const consumedQty=Math.min(remainingExitQty,lot.remainingQty);
      const hold=elapsedTradeRowMinutes(lot,exit);
      if(hold!==null){
        weightedHold+=hold*consumedQty;
        matchedQty+=consumedQty;
      }

      lot.remainingQty-=consumedQty;
      remainingExitQty-=consumedQty;
      if(lot.remainingQty<=0.000001)activeLots.shift();
    }

    breakdown[exit.index]=matchedQty>0?weightedHold/matchedQty:null;
  });

  return breakdown;
}

const NOTE_SIGNALS=[
  {key:"early_exit",label:"selling winners early",tone:"negative",patterns:[/\bsold early\b/i,/\bexit(?:ed)? early\b/i,/left money/i,/could(?:'ve| have) held/i,/should(?:'ve| have) sold/i,/more profit/i]},
  {key:"early_entry",label:"entering too early",tone:"negative",patterns:[/entered too early/i,/entry was too early/i,/way too early/i,/didn'?t wait/i,/did not wait/i,/should(?:'ve| have) waited/i]},
  {key:"revenge",label:"revenge trading",tone:"negative",patterns:[/revenge/i,/\btilt\b/i]},
  {key:"fomo",label:"FOMO and chasing",tone:"negative",patterns:[/\bfomo\b/i,/chas(?:ed|ing)/i,/missing previous/i,/greedy/i]},
  {key:"outside_signal",label:"following outside signals",tone:"negative",patterns:[/\bsignal\b/i,/discord/i,/diamond/i,/community trader/i,/justabossbabe/i]},
  {key:"no_plan",label:"taking unplanned trades",tone:"negative",patterns:[/no real setup/i,/unnecessary/i,/just for fun/i,/counter-trend/i,/do not trade/i,/not 5 min orb/i]},
  {key:"patience",label:"patience and trusting the plan",tone:"positive",patterns:[/\bpatient/i,/waited/i,/let trade develop/i,/trusted/i,/held through/i,/full conviction/i]},
];

function clipText(text,limit=120){
  const cleaned=String(text||"").replace(/\s+/g," ").trim();
  if(cleaned.length<=limit)return cleaned;
  return`${cleaned.slice(0,limit-3).trim()}...`;
}

function cleanTradeNoteText(text){
  return String(text||"").replace(/\s+/g," ").trim();
}

function getTradeNotePreviewLine(label,text,emptyLabel){
  const cleaned=cleanTradeNoteText(text);
  return cleaned?`${label}: "${cleaned}"`:`${label}: ${emptyLabel}`;
}

function getTradeNotesText(trade){
  return[cleanTradeNoteText(trade.preTrade),cleanTradeNoteText(trade.postTrade)].filter(Boolean).join(" ").trim();
}

function extractNoteSignals(trade){
  const text=getTradeNotesText(trade);
  if(!text)return[];
  return NOTE_SIGNALS.filter(signal=>signal.patterns.some(pattern=>pattern.test(text)));
}

function buildCoachDataset(trades){
  const pnls=trades.map(calcPnl);
  const stats=calcStats(trades);
  const byStrategy={};
  const byDirection={LONG:{pnl:0,n:0,w:0},SHORT:{pnl:0,n:0,w:0}};
  const byHour={};
  const byNoteSignal={};
  const byMistakeTag={};
  const reviewedPnls=[];
  const durations=[];

  trades.forEach((trade,index)=>{
    const pnl=pnls[index];
    const outcome=getTradeOutcome(trade);
    const isWin=outcome==="WIN";
    const isLoss=outcome==="LOSS";
    const direction=byDirection[trade.direction]||{pnl:0,n:0,w:0};
    direction.pnl+=pnl;
    if(isWin||isLoss)direction.n+=1;
    if(isWin)direction.w+=1;
    byDirection[trade.direction]=direction;

    if(!byStrategy[trade.strategy])byStrategy[trade.strategy]={pnl:0,n:0,w:0};
    byStrategy[trade.strategy].pnl+=pnl;
    if(isWin||isLoss)byStrategy[trade.strategy].n+=1;
    if(isWin)byStrategy[trade.strategy].w+=1;

    const hour=trade.entries[0]?.time?.slice(0,2);
    if(hour){
      if(!byHour[hour])byHour[hour]={pnl:0,n:0,w:0};
      byHour[hour].pnl+=pnl;
      if(isWin||isLoss)byHour[hour].n+=1;
      if(isWin)byHour[hour].w+=1;
    }

    const duration=calcDur(trade);
    if(duration!==null)durations.push(duration);

    trade.mistakes?.forEach(tag=>{
      const label=normalizeMistakeTag(tag)||tag;
      if(!byMistakeTag[label])byMistakeTag[label]={label,pnl:0,n:0,samples:[]};
      byMistakeTag[label].pnl+=pnl;
      byMistakeTag[label].n+=1;
      if(byMistakeTag[label].samples.length<2){
        byMistakeTag[label].samples.push(clipText(trade.postTrade||trade.preTrade||`${trade.symbol} ${getDirectionLabel(trade.direction)} trade`,110));
      }
    });

    const noteText=getTradeNotesText(trade);
    if(noteText){
      reviewedPnls.push(pnl);
      extractNoteSignals(trade).forEach(signal=>{
        if(!byNoteSignal[signal.key])byNoteSignal[signal.key]={...signal,pnl:0,n:0,samples:[]};
        byNoteSignal[signal.key].pnl+=pnl;
        byNoteSignal[signal.key].n+=1;
        if(byNoteSignal[signal.key].samples.length<2){
          byNoteSignal[signal.key].samples.push(clipText(trade.postTrade||trade.preTrade,110));
        }
      });
    }
  });

  const enrich=row=>({...row,winRate:row.n?row.w/row.n:0,avgPnl:row.n?row.pnl/row.n:0});
  const strategyRows=Object.entries(byStrategy).map(([name,row])=>[name,enrich(row)]);
  const directionRows=Object.entries(byDirection).map(([name,row])=>[name,enrich(row)]);
  const hourRows=Object.entries(byHour).map(([name,row])=>[name,enrich(row)]).sort((a,b)=>a[0].localeCompare(b[0]));
  const noteRows=Object.values(byNoteSignal).map(enrich);
  const mistakeTagRows=Object.values(byMistakeTag).map(enrich);
  const negativeNoteRows=noteRows.filter(row=>row.tone==="negative");
  const positiveNoteRows=noteRows.filter(row=>row.tone==="positive");

  const bestStrategy=[...strategyRows].sort((a,b)=>b[1].pnl-a[1].pnl||b[1].winRate-a[1].winRate)[0]||null;
  const worstStrategy=[...strategyRows].sort((a,b)=>a[1].pnl-b[1].pnl||a[1].winRate-b[1].winRate)[0]||null;
  const bestHour=[...hourRows].sort((a,b)=>b[1].avgPnl-a[1].avgPnl||b[1].pnl-a[1].pnl)[0]||null;
  const worstHour=[...hourRows].sort((a,b)=>a[1].avgPnl-b[1].avgPnl||a[1].pnl-b[1].pnl)[0]||null;
  const worstNoteSignal=[...negativeNoteRows].sort((a,b)=>a.pnl-b.pnl||b.n-a.n)[0]||null;
  const bestDisciplineSignal=[...positiveNoteRows].sort((a,b)=>b.avgPnl-a.avgPnl||b.pnl-a.pnl)[0]||null;
  const topMistakeTag=[...mistakeTagRows].sort((a,b)=>b.n-a.n||a.pnl-b.pnl||a.label.localeCompare(b.label))[0]||null;
  const reviewedTradeAvg=avg(reviewedPnls);
  const earlyExitSignal=noteRows.find(row=>row.key==="early_exit")||null;

  return{
    pnls,
    stats,
    byStrategy,
    byDirection,
    bestStrategy,
    worstStrategy,
    bestHour,
    worstHour,
    worstNoteSignal,
    bestDisciplineSignal,
    topMistakeTag,
    avgDuration:avg(durations),
    reviewedTradeAvg,
    reviewedTradeCount:reviewedPnls.length,
    earlyExitSignal,
    noteRows,
    mistakeTagRows,
    directionRows,
  };
}

function biggestRule(dataset){
  const shorts=dataset.byDirection.SHORT;
  const longs=dataset.byDirection.LONG;
  if(dataset.worstNoteSignal){
    if(dataset.worstNoteSignal.key==="early_exit")return"Primary rule: hold to a preplanned target or a structural break instead of reacting to open profit.";
    if(dataset.worstNoteSignal.key==="early_entry")return"Primary rule: wait for full confirmation before entry. No anticipatory clicks.";
    if(dataset.worstNoteSignal.key==="revenge")return"Primary rule: after an emotional loss, step away for 15 minutes before the next trade.";
    if(dataset.worstNoteSignal.key==="outside_signal")return"Primary rule: no trade goes on unless your own chart, levels, and thesis are written first.";
    if(dataset.worstNoteSignal.key==="no_plan")return"Primary rule: skip any trade that does not have a clear setup and reason written down.";
    if(dataset.worstNoteSignal.key==="fomo")return"Primary rule: if the move already happened, let it go. Do not chase missed setups.";
  }
  if(shorts.n&&longs.n&&shorts.avgPnl>longs.avgPnl){
    return"Primary rule: keep size concentrated in SHORT setups until your LONG criteria are tighter.";
  }
  if(dataset.earlyExitSignal){
    return"Primary rule: hold until target or stop unless market structure objectively breaks.";
  }
  if(dataset.worstHour){
    return`Primary rule: avoid initiating trades around ${formatHourLabel(dataset.worstHour[0])} unless the setup is A-grade.`;
  }
  return"Primary rule: keep pressing your best setup and stay selective outside it.";
}

function describePrimaryBehaviorLeak(dataset){
  if(dataset.worstNoteSignal&&dataset.worstNoteSignal.n){
    return{
      source:"notes",
      label:dataset.worstNoteSignal.label,
      count:dataset.worstNoteSignal.n,
      pnl:dataset.worstNoteSignal.pnl,
      sample:dataset.worstNoteSignal.samples?.[0]||"",
      sentence:`Your review notes most often flag ${dataset.worstNoteSignal.label}, worth ${fmtMoney(dataset.worstNoteSignal.pnl)} across ${dataset.worstNoteSignal.n} trade(s).${dataset.worstNoteSignal.samples?.[0]?` Example: "${dataset.worstNoteSignal.samples[0]}"`:""}`,
    };
  }

  if(dataset.topMistakeTag&&dataset.topMistakeTag.n){
    return{
      source:"tags",
      label:dataset.topMistakeTag.label,
      count:dataset.topMistakeTag.n,
      pnl:dataset.topMistakeTag.pnl,
      sample:dataset.topMistakeTag.samples?.[0]||"",
      sentence:`Your mistake tags most often point to ${dataset.topMistakeTag.label}, showing up on ${dataset.topMistakeTag.n} trade(s) for ${fmtMoney(dataset.topMistakeTag.pnl)} total P&L.${dataset.topMistakeTag.samples?.[0]?` Example: "${dataset.topMistakeTag.samples[0]}"`:""}`,
    };
  }

  return null;
}

function buildCoachInsights(trades){
  if(!trades.length)return[];
  const dataset=buildCoachDataset(trades);
  const insights=[];
  const primaryLeak=describePrimaryBehaviorLeak(dataset);

  if(primaryLeak){
    insights.push({
      icon:"!",
      color:C.red,
      title:primaryLeak.source==="notes"?"Biggest notes-based leak":"Biggest tagged mistake",
      text:primaryLeak.sentence,
    });
  }

  if(dataset.bestStrategy){
    const [name,row]=dataset.bestStrategy;
    insights.push({
      icon:"+",
      color:C.green,
      title:"Best setup",
      text:`${name} leads with ${fmtMoney(row.pnl)} across ${row.n} trade(s) at ${fmtPct(row.winRate)} win rate.`,
    });
  }

  if(dataset.bestHour){
    const [hour,row]=dataset.bestHour;
    insights.push({
      icon:">",
      color:C.accent,
      title:"Best entry window",
      text:`Your ${formatHourLabel(hour)} entries average ${fmtMoney(row.avgPnl)} per trade. Trade quality is strongest there.`,
    });
  }

  if(dataset.bestDisciplineSignal){
    insights.push({
      icon:"=",
      color:C.teal,
      title:"Notes-based edge",
      text:`Reviews mentioning ${dataset.bestDisciplineSignal.label} average ${fmtMoney(dataset.bestDisciplineSignal.avgPnl)} per trade.`,
    });
  }

  return insights.slice(0,4);
}

function generateCoachReply(question,trades){
  if(!trades.length){
    return"No trades are logged yet. Import a CSV or add a few trades and I can coach off real performance data.";
  }

  const q=question.toLowerCase();
  const dataset=buildCoachDataset(trades);
  const {stats,bestStrategy,bestHour,byDirection,earlyExitSignal,bestDisciplineSignal,topMistakeTag}=dataset;
  const primaryLeak=describePrimaryBehaviorLeak(dataset);
  const shorts=byDirection.SHORT;
  const longs=byDirection.LONG;
  const strategyLine=bestStrategy?`${bestStrategy[0]} is your top setup with ${fmtMoney(bestStrategy[1].pnl)} and ${fmtPct(bestStrategy[1].winRate)} wins.`:"No clear setup edge yet.";
  const hourLine=bestHour?`Your best time is ${formatHourLabel(bestHour[0])} with ${fmtMoney(bestHour[1].avgPnl)} average P&L per trade.`:"Time-of-day edge is not clear yet.";
  const leakLine=primaryLeak
    ?primaryLeak.sentence
    :"You need more review notes or mistake tags before I can call out a repeat behavioral pattern.";
  const directionLine=shorts.n&&longs.n
    ?`SHORT trades produced ${fmtMoney(shorts.pnl)} versus LONG trades at ${fmtMoney(longs.pnl)}.`
    :"Direction edge is still forming.";
  const exitLine=earlyExitSignal
    ?`Your notes mention selling early on ${earlyExitSignal.n} trade(s) for ${fmtMoney(earlyExitSignal.pnl)} total P&L.`
    :topMistakeTag?.label==="Early exits"
      ?`Your mistake tags show Early exits on ${topMistakeTag.n} trade(s) for ${fmtMoney(topMistakeTag.pnl)} total P&L.`
      :"Early exits are not the main pattern showing up in your notes or tags.";
  const disciplineLine=bestDisciplineSignal
    ?`Your best reviews mention ${bestDisciplineSignal.label}, and those trades average ${fmtMoney(bestDisciplineSignal.avgPnl)}.`
    :"Your strongest positive pattern is still forming.";
  const ruleLine=biggestRule(dataset);

  if(/full performance analysis|deep analysis|performance analysis|full breakdown/.test(q)){
    return`You are net ${fmtMoney(stats.totalPnl)} with a ${fmtPct(stats.winRate)} win rate and ${stats.profitFactor>=999?"infinite":stats.profitFactor.toFixed(2)} profit factor. ${strategyLine} ${directionLine} ${hourLine} ${leakLine} ${disciplineLine} ${ruleLine}`;
  }

  if(/most profitable setup|best setup|profitable setup|best strategy|setup/.test(q)){
    return`${strategyLine} ${dataset.worstStrategy?`${dataset.worstStrategy[0]} is weakest at ${fmtMoney(dataset.worstStrategy[1].pnl)}.`:""} ${ruleLine}`;
  }

  if(/time of day|perform best|when should i be trading|best results/.test(q)){
    return`${hourLine} ${dataset.worstHour?`Your weakest window is ${formatHourLabel(dataset.worstHour[0])} at ${fmtMoney(dataset.worstHour[1].avgPnl)} per trade.`:""} ${ruleLine}`;
  }

  if(/losing money|hurting my p&l|patterns are hurting|why am i losing/.test(q)){
    return`${leakLine} ${directionLine} ${exitLine} ${ruleLine}`;
  }

  if(/early exit|exiting winners early|exit winners/.test(q)){
    return`${exitLine} Your win rate is ${fmtPct(stats.winRate)}, so the issue is often management, not read quality. Primary fix: pre-commit the target and only exit early if structure actually invalidates the thesis.`;
  }

  if(/rule would have the biggest impact|biggest impact|single rule/.test(q)){
    return ruleLine;
  }

  return`You are net ${fmtMoney(stats.totalPnl)} with ${fmtPct(stats.winRate)} wins. ${strategyLine} ${hourLine} ${leakLine} ${disciplineLine} ${ruleLine}`;
}

function normalizeTrade(trade){
  if(!trade)return null;

  const entries=Array.isArray(trade.entries)?trade.entries:[];
  const exits=Array.isArray(trade.exits)?trade.exits:[];
  const holdMinutes=parseMaybeNumber(trade.holdMinutes);
  const fallbackEntryDate=normalizeDateKey(trade.date)||new Date().toISOString().slice(0,10);
  const normalizedEntries=entries.map(entry=>({
    ...entry,
    price:parseMaybeNumber(entry?.price),
    qty:parseMaybeNumber(entry?.qty)??0,
    date:getRowDate(entry,fallbackEntryDate)||fallbackEntryDate,
    time:entry?.time||"",
  }));
  const tradeDate=getRowDate(normalizedEntries[0],trade.date);
  const firstEntry=getTimedTradeRows(normalizedEntries,tradeDate)[0]||null;
  const normalizedExits=exits.map(exit=>({
    ...exit,
    price:parseMaybeNumber(exit?.price),
    qty:parseMaybeNumber(exit?.qty)??0,
    date:getEffectiveExitDateKey(exit,tradeDate,firstEntry?.minutes)||tradeDate,
    time:exit?.time||"",
  }));
  if(normalizedExits[0]&& !normalizedExits[0].time && normalizedEntries[0]?.time && holdMinutes!==null){
    normalizedExits[0]={...normalizedExits[0],time:addMinutesToTime(normalizedEntries[0].time,holdMinutes)};
  }

  const hasPricing=
    parseMaybeNumber(trade.realizedPnl)!==null||
    (parseMaybeNumber(normalizedEntries[0]?.price)!==null&&parseMaybeNumber(normalizedExits[0]?.price)!==null);

  if(!trade.symbol||!tradeDate||!hasPricing)return null;

  return{
    ...trade,
    date:tradeDate,
    market:normalizeMarket(trade.market),
    direction:normalizeDirection(trade.direction),
    targetPrice:parseMaybeNumber(trade.targetPrice)??"",
    stopLoss:parseMaybeNumber(trade.stopLoss)??"",
    fees:parseMaybeNumber(trade.fees)??0,
    realizedPnl:parseMaybeNumber(trade.realizedPnl),
    holdMinutes,
    entries:normalizedEntries,
    exits:normalizedExits,
    mistakes:Array.isArray(trade.mistakes)?[...new Set(trade.mistakes.map(normalizeMistakeTag).filter(Boolean))]:[],
    positiveTags:Array.isArray(trade.positiveTags)?[...new Set(trade.positiveTags.map(normalizePositiveTag).filter(Boolean))]:[],
    emotion:trade.emotion||"Neutral",
    strategy:trade.strategy||"Other",
    preTrade:trade.preTrade||"",
    postTrade:trade.postTrade||"",
    screenshots:Array.isArray(trade.screenshots)?trade.screenshots.filter(value=>typeof value==="string"&&value.startsWith("data:image/")):[],
  };
}

function normalizeTrades(trades){
  return(Array.isArray(trades)?trades:[]).map(normalizeTrade).filter(Boolean);
}

function tradeFingerprint(trade){
  return[
    getRowDate(trade.entries?.[0],trade.date)||"",
    trade.symbol||"",
    trade.direction||"",
    trade.market||"",
    trade.entries?.[0]?.date||"",
    trade.entries?.[0]?.time||"",
    trade.exits?.[0]?.date||"",
    parseMaybeNumber(trade.entries?.[0]?.price)??"",
    parseMaybeNumber(trade.exits?.[0]?.price)??"",
    parseMaybeNumber(trade.entries?.[0]?.qty)??"",
    parseMaybeNumber(trade.realizedPnl)??"",
  ].join("|");
}

function mergeTrades(existing,incoming){
  const merged=[...existing];
  const seen=new Set(existing.map(tradeFingerprint));
  let added=0;

  incoming.forEach(trade=>{
    const key=tradeFingerprint(trade);
    if(seen.has(key))return;
    seen.add(key);
    merged.unshift(trade);
    added++;
  });

  return{trades:merged,added,skipped:incoming.length-added};
}

// â”€â”€ Micro UI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const inp=(ex={})=>({
  background:C.surface,
  border:`1px solid rgba(148,163,184,0.18)`,
  boxShadow:"inset 0 0 0 1px rgba(226,232,240,0.85)",
  borderRadius:C.radiusSm,
  padding:"12px 14px",
  color:C.text,
  fontSize:14,
  outline:"none",
  width:"100%",
  boxSizing:"border-box",
  ...ex,
});

const btnBase=(ex={})=>({
  padding:"10px 16px",
  borderRadius:C.radiusXs,
  border:"none",
  background:C.surface,
  color:C.textSoft,
  fontSize:13,
  fontWeight:600,
  cursor:"pointer",
  boxShadow:C.shadow,
  transition:"transform 160ms ease, box-shadow 160ms ease, background 160ms ease, color 160ms ease",
  ...ex,
});

function Icon({name,size=18,color=C.text,stroke=1.9}){
  const common={fill:"none",stroke:color,strokeWidth:stroke,strokeLinecap:"round",strokeLinejoin:"round"};

  const paths={
    chart:<>
      <path {...common} d="M4 16l4.2-4.6 3.8 3.2 5.8-7.6"/>
      <path {...common} d="M4 6.5V18h16"/>
    </>,
    wallet:<>
      <rect {...common} x="3" y="6" width="18" height="12" rx="3"/>
      <path {...common} d="M16 11h5"/>
      <circle cx="16.5" cy="12" r="0.8" fill={color}/>
    </>,
    target:<>
      <circle {...common} cx="12" cy="12" r="7"/>
      <circle {...common} cx="12" cy="12" r="3"/>
      <path {...common} d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22"/>
    </>,
    pulse:<>
      <path {...common} d="M3 12h4l2.2-4 3.5 8 2.4-4H21"/>
    </>,
    spark:<>
      <path {...common} d="M12 3l1.5 4.2L18 9l-4.5 1.8L12 15l-1.5-4.2L6 9l4.5-1.8L12 3z"/>
      <path {...common} d="M18.5 3.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z"/>
    </>,
    calendar:<>
      <rect {...common} x="3" y="5" width="18" height="16" rx="3"/>
      <path {...common} d="M8 3v4M16 3v4M3 10h18"/>
    </>,
    user:<>
      <circle {...common} cx="12" cy="8" r="3.5"/>
      <path {...common} d="M5 19c1.8-3 4.1-4.5 7-4.5s5.2 1.5 7 4.5"/>
    </>,
    bot:<>
      <rect {...common} x="5" y="7" width="14" height="11" rx="4"/>
      <path {...common} d="M12 3v4M8.5 12h.01M15.5 12h.01M9 16h6"/>
    </>,
    upload:<>
      <path {...common} d="M12 16V6"/>
      <path {...common} d="M8 10l4-4 4 4"/>
      <path {...common} d="M5 18h14"/>
    </>,
    download:<>
      <path {...common} d="M12 6v10"/>
      <path {...common} d="M8 12l4 4 4-4"/>
      <path {...common} d="M5 18h14"/>
    </>,
    plus:<>
      <path {...common} d="M12 5v14M5 12h14"/>
    </>,
    pencil:<>
      <path {...common} d="M4 20l4.2-.8L18.6 8.8 15.2 5.4 4.8 15.8 4 20z"/>
      <path {...common} d="M13.8 6.8l3.4 3.4"/>
    </>,
    trash:<>
      <path {...common} d="M5 7h14M9 7V4h6v3M8 10v7M12 10v7M16 10v7"/>
      <path {...common} d="M6.5 7l1 13h9l1-13"/>
    </>,
    back:<>
      <path {...common} d="M10 6l-6 6 6 6"/>
      <path {...common} d="M4 12h16"/>
    </>,
    arrowUp:<>
      <path {...common} d="M12 19V5"/>
      <path {...common} d="M6 11l6-6 6 6"/>
    </>,
    arrowDown:<>
      <path {...common} d="M12 5v14"/>
      <path {...common} d="M18 13l-6 6-6-6"/>
    </>,
    layers:<>
      <path {...common} d="M12 4l8 4-8 4-8-4 8-4z"/>
      <path {...common} d="M4 12l8 4 8-4"/>
      <path {...common} d="M4 16l8 4 8-4"/>
    </>,
    note:<>
      <rect {...common} x="5" y="4" width="14" height="16" rx="3"/>
      <path {...common} d="M8 9h8M8 13h8M8 17h5"/>
    </>,
    filter:<>
      <path {...common} d="M4 6h16l-6 7v5l-4-2v-3L4 6z"/>
    </>,
    alert:<>
      <path {...common} d="M12 8v5"/>
      <path {...common} d="M12 16h.01"/>
      <path {...common} d="M10.3 3.9l-7 12.1A1.4 1.4 0 0 0 4.5 18h15a1.4 1.4 0 0 0 1.2-2l-7-12.1a1.4 1.4 0 0 0-2.4 0z"/>
    </>,
    sun:<>
      <circle {...common} cx="12" cy="12" r="4"/>
      <path {...common} d="M12 2.5v2.2M12 19.3v2.2M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6"/>
    </>,
    moon:<>
      <path {...common} d="M19 14.8A7.5 7.5 0 1 1 9.2 5a6.2 6.2 0 0 0 9.8 9.8z"/>
    </>,
    logout:<>
      <path {...common} d="M10 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3"/>
      <path {...common} d="M14 16l5-4-5-4"/>
      <path {...common} d="M9 12h10"/>
    </>,
  };

  return<div style={{width:size,height:size,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{paths[name]||paths.spark}</svg>
  </div>;
}

function Pill({label,color=C.accent,sm}){
  const size=sm?{padding:"5px 10px",fontSize:11}:{padding:"7px 12px",fontSize:12};
  return<span style={{
    display:"inline-flex",
    alignItems:"center",
    justifyContent:"center",
    gap:6,
    ...size,
    borderRadius:999,
    background:color==="transparent"?C.surfaceSoft:`linear-gradient(180deg, ${color}15, ${color}08)`,
    color:color==="transparent"?C.textSoft:color,
    fontWeight:700,
    whiteSpace:"nowrap",
    boxShadow:"inset 0 0 0 1px rgba(148,163,184,0.10)",
  }}>{label}</span>;
}

function Card({children,style={},accent,glass}){
  return<div style={{
    background:glass?C.glass:C.surface,
    backdropFilter:glass?"blur(18px)":undefined,
    borderRadius:C.radius,
    padding:"20px 22px",
    boxShadow:accent?`${C.shadow}, inset 0 0 0 1px ${accent}18`:C.shadow,
    position:"relative",
    overflow:"hidden",
    ...style,
  }}>
    {accent&&<div style={{position:"absolute",inset:"0 auto auto 0",width:72,height:72,background:`radial-gradient(circle, ${accent}20, transparent 70%)`,pointerEvents:"none"}}/>}
    {children}
  </div>;
}

function SLabel({children}){
  return<div style={{fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:12}}>{children}</div>;
}

function Metric({label,value,color=C.text,sub,small,icon="spark",trend,emphasis}){
  return<div style={{
    background:emphasis?`linear-gradient(180deg, rgba(59,130,246,0.12), ${C.surface})`:C.surface,
    borderRadius:18,
    padding:small?"16px 18px":"20px 20px",
    display:"flex",
    flexDirection:"column",
    gap:small?8:10,
    boxShadow:C.shadow,
    minHeight:small?124:144,
    justifyContent:"space-between",
  }}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        <span style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700}}>{label}</span>
        <span style={{fontSize:small?24:30,fontWeight:800,color,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1.1}}>{value}</span>
      </div>
      <div style={{width:42,height:42,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",background:emphasis?C.surface:`linear-gradient(180deg, ${C.surfaceAlt}, ${C.surface})`,boxShadow:"inset 0 0 0 1px rgba(148,163,184,0.12)"}}>
        <Icon name={icon} color={color===C.text?C.accent:color}/>
      </div>
    </div>
    {(sub||trend)&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
      {sub&&<span style={{fontSize:12,color:C.muted,lineHeight:1.5}}>{sub}</span>}
      {trend&&<span style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,fontWeight:700,color:trend.tone==="negative"?C.red:trend.tone==="warning"?C.amber:C.green}}>
        <Icon name={trend.tone==="negative"?"arrowDown":"arrowUp"} size={14} color={trend.tone==="negative"?C.red:trend.tone==="warning"?C.amber:C.green}/>
        {trend.label}
      </span>}
    </div>}
  </div>;
}

function Divider(){return<div style={{height:1,background:"rgba(148,163,184,0.18)",margin:"4px 0"}}/>;}

function ThemeToggleButton({theme,onToggle}){
  const dark=theme==="dark";
  return<button
    type="button"
    onClick={onToggle}
    aria-label={dark?"Switch to light mode":"Switch to dark mode"}
    style={{
      ...btnBase(),
      padding:"10px 14px",
      borderRadius:999,
      display:"inline-flex",
      alignItems:"center",
      gap:8,
      background:C.surfaceAlt,
      color:C.textSoft,
      boxShadow:`${C.shadow}, inset 0 0 0 1px ${C.border}`,
      whiteSpace:"nowrap",
    }}
  >
    <Icon name={dark?"sun":"moon"} size={15} color={dark?C.amber:C.accentStrong}/>
    {dark?"Light mode":"Dark mode"}
  </button>;
}

function PageIntro({eyebrow,title,description,actions}){
  return<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:18,flexWrap:"wrap"}}>
    <div style={{maxWidth:640}}>
      {eyebrow&&<div style={{fontSize:12,color:C.accentStrong,fontWeight:800,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>{eyebrow}</div>}
      <div style={{fontSize:30,fontWeight:800,color:C.text,lineHeight:1.08,fontFamily:"'Sora','Manrope',sans-serif",marginBottom:10}}>{title}</div>
      {description&&<div style={{fontSize:14,color:C.muted,lineHeight:1.7}}>{description}</div>}
    </div>
    {actions&&<div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>{actions}</div>}
  </div>;
}

function EmptyState({icon="chart",title,message,action}){
  return<Card style={{padding:"44px 28px",textAlign:"center",background:`linear-gradient(180deg, ${C.surface}, ${C.surfaceAlt})`}}>
    <div style={{width:64,height:64,borderRadius:20,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center",background:C.accentBg,boxShadow:C.shadow}}>
      <Icon name={icon} size={28} color={C.accent}/>
    </div>
    <div style={{fontSize:22,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",marginBottom:8}}>{title}</div>
    <div style={{fontSize:14,color:C.muted,lineHeight:1.7,maxWidth:480,margin:"0 auto"}}>{message}</div>
    {action&&<div style={{marginTop:18}}>{action}</div>}
  </Card>;
}

function AccountTransactionsModal({open,user,tradesCount,startingBalance,transactions,trades,onClose,onSaveLedger}){
  const formCardRef=useRef(null);
  const createBlankTransaction=()=>({
    id:"",
    account:"",
    type:"deposit",
    date:new Date().toISOString().slice(0,10),
    amount:"",
  });
  const[form,setForm]=useState(createBlankTransaction);
  const[error,setError]=useState("");
  const[busy,setBusy]=useState(false);
  const ledgerSummary=useMemo(()=>calcLedgerSummary(startingBalance,transactions,trades),[startingBalance,transactions,trades]);
  const isEditing=Boolean(form.id);

  useEffect(()=>{
    if(!open)return;
    setForm(createBlankTransaction());
    setError("");
  },[open,user?.id]);

  useEffect(()=>{
    if(!open||typeof window==="undefined")return undefined;
    const handleKeyDown=event=>{
      if(event.key==="Escape")onClose();
    };
    window.addEventListener("keydown",handleKeyDown);
    return()=>window.removeEventListener("keydown",handleKeyDown);
  },[open,onClose]);

  useEffect(()=>{
    if(!open||!import.meta.env.DEV)return;
    const expectedValue=roundCurrencyValue(ledgerSummary.netDeposits+ledgerSummary.allTimeReturn);
    if(Math.abs(expectedValue-ledgerSummary.currentValue)>0.005){
      console.error("Ledger summary formula mismatch:",{
        netDeposits:ledgerSummary.netDeposits,
        allTimeReturn:ledgerSummary.allTimeReturn,
        currentValue:ledgerSummary.currentValue,
        expectedValue,
      });
    }
  },[open,ledgerSummary]);

  if(!open||typeof document==="undefined")return null;

  const updateForm=(key,value)=>setForm(current=>({...current,[key]:value}));
  const resetForm=()=>setForm(createBlankTransaction());

  const handleTransactionSubmit=async event=>{
    event.preventDefault();
    const account=String(form.account||"").trim();
    const type=normalizeAccountTransactionType(form.type);
    const date=String(form.date||"").trim();
    const amount=parseMaybeNumber(form.amount);

    if(!account){
      setError("Enter an account name.");
      return;
    }
    if(!ACCOUNT_TRANSACTION_TYPES.includes(type)){
      setError("Choose a transaction type.");
      return;
    }
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){
      setError("Choose a valid transaction date.");
      return;
    }
    if(amount===null||roundCurrencyValue(amount)===0){
      setError("Enter a valid amount greater than zero.");
      return;
    }

    const now=new Date().toISOString();
    const existingTransaction=transactions.find(entry=>entry.id===form.id);
    const transaction={
      id:form.id||`account-transaction-${crypto.randomUUID?.()||Date.now()}`,
      user_id:user?.id||"",
      account,
      type,
      date,
      amount:Math.abs(roundCurrencyValue(amount)),
      created_at:existingTransaction?.created_at||now,
      updated_at:now,
    };
    const nextTransactions=form.id
      ?transactions.map(entry=>entry.id===form.id?transaction:entry)
      :[transaction,...transactions];

    setBusy(true);
    setError("");
    const saved=await onSaveLedger(
      startingBalance,
      nextTransactions,
      form.id?"Transaction updated.":"Transaction added.",
    );
    if(saved)resetForm();
    else setError("Unable to save transaction.");
    setBusy(false);
  };

  const handleEditTransaction=transaction=>{
    setError("");
    setForm({
      id:transaction.id,
      account:transaction.account,
      type:normalizeAccountTransactionType(transaction.type,transaction.amount),
      date:transaction.date,
      amount:String(transaction.amount),
    });
    if(typeof window!=="undefined"){
      window.requestAnimationFrame(()=>formCardRef.current?.scrollIntoView({block:"center",behavior:"smooth"}));
    }
  };

  const handleDeleteTransaction=async transactionId=>{
    setBusy(true);
    setError("");
    const saved=await onSaveLedger(
      startingBalance,
      transactions.filter(transaction=>transaction.id!==transactionId),
      "Transaction deleted.",
      C.red,
    );
    if(saved&&form.id===transactionId)resetForm();
    if(!saved)setError("Unable to delete transaction.");
    setBusy(false);
  };

  return createPortal(<div
    onClick={onClose}
    style={{
      position:"fixed",
      inset:0,
      zIndex:160,
      background:"rgba(8,17,31,0.42)",
      backdropFilter:"blur(8px)",
      display:"flex",
      alignItems:"flex-start",
      justifyContent:"center",
      overflowY:"auto",
      padding:"28px 16px 40px",
    }}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-transactions-title"
      onClick={event=>event.stopPropagation()}
      style={{
        width:"min(1040px, 100%)",
        maxHeight:"96vh",
        display:"grid",
        gridTemplateRows:"auto minmax(0,1fr)",
        background:C.surface,
        borderRadius:24,
        boxShadow:C.shadowLg,
        overflow:"hidden",
        border:`1px solid ${C.border}`,
        margin:"0 auto",
      }}
    >
      <div style={{padding:"20px 22px 18px",borderBottom:`1px solid ${C.border}`,background:`linear-gradient(180deg, ${C.surface}, ${C.surfaceAlt})`,display:"grid",gap:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"start",gap:16}}>
          <div/>
          <div style={{textAlign:"center"}}>
            <div id="account-transactions-title" style={{fontSize:18,color:C.accentStrong,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.16em",marginBottom:10}}>Account Transactions</div>
            <div style={{fontSize:13,color:C.muted}}>
              {user?.username||"Trader"} • {tradesCount} trades saved
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end"}}>
            <button type="button" onClick={onClose} style={{...btnBase(),padding:"10px 14px",fontWeight:800}}>
              Close
            </button>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
          <div style={{padding:"14px 16px",borderRadius:18,background:C.surface,boxShadow:C.shadow}}>
            <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:6}}>Net Deposits</div>
            <div style={{fontSize:28,fontWeight:800,color:ledgerSummary.netDeposits>=0?C.teal:C.red,fontFamily:"'Sora','Manrope',sans-serif"}}>{fmtUsd(ledgerSummary.netDeposits)}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:6}}>Saved deposits and withdrawals only.</div>
          </div>
          <div style={{padding:"14px 16px",borderRadius:18,background:C.surface,boxShadow:C.shadow}}>
            <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:6}}>All-Time Return</div>
            <div style={{fontSize:28,fontWeight:800,color:ledgerSummary.allTimeReturn>=0?C.green:C.red,fontFamily:"'Sora','Manrope',sans-serif"}}>{fmtUsd(ledgerSummary.allTimeReturn,2,{showPlus:true})}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:6}}>Trade gains and losses only.</div>
          </div>
          <div style={{padding:"14px 16px",borderRadius:18,background:C.surface,boxShadow:C.shadow}}>
            <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:6}}>Current Value</div>
            <div style={{display:"flex",alignItems:"baseline",gap:10,flexWrap:"wrap"}}>
              <div style={{fontSize:28,fontWeight:800,color:"#fff",fontFamily:"'Sora','Manrope',sans-serif"}}>{fmtUsd(ledgerSummary.currentValue)}</div>
              <div style={{fontSize:14,fontWeight:800,color:ledgerSummary.allTimeRoiPct===null?C.muted:ledgerSummary.allTimeRoiPct>=0?C.green:C.red}}>
                {ledgerSummary.allTimeRoiPct===null?"ROI N/A":`ROI ${fmtPct(ledgerSummary.allTimeRoiPct)}`}
              </div>
            </div>
            <div style={{fontSize:12,color:C.muted,marginTop:6}}>Net Deposits + All-Time Return.</div>
          </div>
        </div>
      </div>

      <div style={{padding:"22px 24px 28px",overflowY:"auto",minHeight:0,display:"grid",alignContent:"start",gap:18}}>
        <Card style={{padding:"18px 18px 22px",background:`linear-gradient(180deg, ${C.surface}, ${C.surfaceAlt})`,overflow:"visible"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:12}}>
            <SLabel>Brokerage Summary</SLabel>
            <Pill label={`${transactions.length} transaction${transactions.length!==1?"s":""}`} color={C.teal} sm/>
          </div>
          <div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>
            Current Value is calculated automatically from your saved cash transactions and all trade results. Manual balance overrides are not used.
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12}}>
            <Pill label={`Net Deposits ${fmtUsd(ledgerSummary.netDeposits)}`} color={ledgerSummary.netDeposits>=0?C.teal:C.red} sm/>
            <Pill label={`All-Time Return ${fmtUsd(ledgerSummary.allTimeReturn,2,{showPlus:true})}`} color={ledgerSummary.allTimeReturn>=0?C.green:C.red} sm/>
            <Pill label={`Current Value ${fmtUsd(ledgerSummary.currentValue)}`} color="#fff" sm/>
          </div>
        </Card>

        <div ref={formCardRef}>
          <Card style={{padding:"18px 18px 24px",overflow:"visible"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:12}}>
              <SLabel>{isEditing?"Edit Transaction":"Add Transaction"}</SLabel>
              <div style={{fontSize:12,color:C.muted}}>Choose deposit or withdrawal. Amount stays positive.</div>
            </div>
            <form onSubmit={handleTransactionSubmit} style={{display:"grid",gap:12}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,alignItems:"center"}}>
                <input
                  value={form.account}
                  onChange={event=>updateForm("account",event.target.value)}
                  placeholder="Account"
                  style={inp()}
                />
                <select
                  value={form.type}
                  onChange={event=>updateForm("type",event.target.value)}
                  style={inp()}
                >
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdrawal</option>
                </select>
                <input
                  value={form.date}
                  onChange={event=>updateForm("date",event.target.value)}
                  type="date"
                  style={inp()}
                />
                <input
                  value={form.amount}
                  onChange={event=>updateForm("amount",event.target.value)}
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Amount"
                  style={inp()}
                />
              </div>
              <div style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}>
                {isEditing&&<button type="button" onClick={resetForm} style={{...btnBase(),padding:"12px 14px"}}>Cancel</button>}
                <button
                  type="submit"
                  disabled={busy}
                  style={{...btnBase(),padding:"12px 14px",background:C.accent,color:"#fff",boxShadow:"0 16px 30px rgba(59,130,246,0.20)",display:"inline-flex",alignItems:"center",gap:8}}
                >
                  <Icon name={isEditing?"pencil":"plus"} size={14} color="#fff"/>
                  {isEditing?"Save":"Add"}
                </button>
              </div>
              {error&&<div style={{fontSize:12,color:C.red,fontWeight:700}}>{error}</div>}
            </form>
          </Card>
        </div>

        <Card style={{padding:"18px 18px 18px",minHeight:320,overflow:"visible"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:12}}>
            <SLabel>Saved Transactions</SLabel>
            <div style={{fontSize:12,color:C.muted}}>Click edit to update an entry in place.</div>
          </div>
          {!transactions.length
            ?<div style={{padding:"18px 4px 12px",fontSize:13,color:C.muted}}>No transactions saved yet. Add your first ledger entry above.</div>
            :<div style={{overflow:"auto",minHeight:220,maxHeight:"52vh",paddingBottom:8,borderRadius:16,background:C.surfaceAlt}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:760}}>
                <thead>
                  <tr>
                    {["Account","Type","Date","Amount","Actions"].map(label=><th key={label} style={{textAlign:label==="Amount"?"right":"left",padding:"14px 10px 12px",fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,background:C.surfaceAlt,position:"sticky",top:0,zIndex:1}}>{label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction=><tr key={transaction.id} style={{borderTop:`1px solid ${C.border}`}}>
                    <td style={{padding:"14px 10px",fontSize:13,fontWeight:700,color:C.text}}>{transaction.account}</td>
                    <td style={{padding:"14px 10px",fontSize:13}}>
                      <Pill label={normalizeAccountTransactionType(transaction.type,transaction.amount)==="deposit"?"Deposit":"Withdrawal"} color={normalizeAccountTransactionType(transaction.type,transaction.amount)==="deposit"?C.teal:C.amber} sm/>
                    </td>
                    <td style={{padding:"14px 10px",fontSize:13,color:C.muted}}>{parseDateOnly(transaction.date)?.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})||transaction.date}</td>
                    <td style={{padding:"14px 10px",fontSize:13,fontWeight:800,color:getSignedTransactionAmount(transaction)>=0?C.green:C.red,textAlign:"right"}}>{fmtCash(getSignedTransactionAmount(transaction),2,{showPlus:true})}</td>
                    <td style={{padding:"14px 10px"}}>
                      <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
                        <button type="button" onClick={()=>handleEditTransaction(transaction)} style={{...btnBase(),padding:"8px 12px",display:"inline-flex",alignItems:"center",gap:6}}>
                          <Icon name="pencil" size={13} color={C.textSoft}/>
                          Edit
                        </button>
                        <button type="button" onClick={()=>handleDeleteTransaction(transaction.id)} disabled={busy} style={{...btnBase(),padding:"8px 12px",background:C.redBg,color:C.red,display:"inline-flex",alignItems:"center",gap:6}}>
                          <Icon name="trash" size={13} color={C.red}/>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>)}
                </tbody>
              </table>
            </div>}
        </Card>
      </div>
    </div>
  </div>,document.body);
}

class ViewErrorBoundary extends Component{
  constructor(props){
    super(props);
    this.state={error:null};
  }

  static getDerivedStateFromError(error){
    return{error};
  }

  componentDidCatch(error){
    console.error("View render failed:",error);
  }

  render(){
    if(this.state.error){
      return<Card style={{padding:"44px 28px",textAlign:"center",background:`linear-gradient(180deg, ${C.surface}, ${C.surfaceAlt})`}}>
        <div style={{width:64,height:64,borderRadius:20,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center",background:C.redBg,boxShadow:C.shadow}}>
          <Icon name="alert" size={28} color={C.red}/>
        </div>
        <div style={{fontSize:22,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",marginBottom:8}}>This page hit a render error</div>
        <div style={{fontSize:14,color:C.muted,lineHeight:1.7,maxWidth:560,margin:"0 auto"}}>
          {this.state.error?.message||"Something unexpected failed while loading this view."}
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap",marginTop:18}}>
          {this.props.onReset&&<button type="button" onClick={this.props.onReset} style={{...btnBase(),padding:"11px 16px",borderRadius:999,background:C.surface}}>
            Go to Trade Log
          </button>}
          <button type="button" onClick={()=>window.location.reload()} style={{...btnBase(),padding:"11px 16px",borderRadius:999,background:`linear-gradient(180deg, ${C.accent}, ${C.accentStrong})`,color:"#fff"}}>
            Reload
          </button>
        </div>
      </Card>;
    }
    return this.props.children;
  }
}

function AuthField({label,type="text",value,onChange,placeholder,autoComplete}){
  return<div>
    <div style={{fontSize:11,color:C.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700}}>{label}</div>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      style={inp({height:52,background:C.fieldBg,border:C.fieldBorder,boxShadow:C.fieldInset})}
    />
  </div>;
}

function AuthPasswordField({label,value,onChange,placeholder,autoComplete,visible,onToggle}){
  return<div>
    <div style={{fontSize:11,color:C.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700}}>{label}</div>
    <div style={{position:"relative"}}>
      <input
        type={visible?"text":"password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={inp({height:52,paddingRight:74,background:C.fieldBg,border:C.fieldBorder,boxShadow:C.fieldInset})}
      />
      <button
        type="button"
        onClick={onToggle}
        style={{position:"absolute",right:10,top:10,...btnBase(),padding:"7px 10px",fontSize:11,background:C.surfaceAlt,color:C.accentStrong,boxShadow:"none"}}
      >
        {visible?"Hide":"Show"}
      </button>
    </div>
  </div>;
}

function AuthScreen({mode,onModeChange,onLogin,onRegister,loading,error,theme,onToggleTheme}){
  const[loginForm,setLoginForm]=useState({identifier:"",password:""});
  const[registerForm,setRegisterForm]=useState({username:"",email:"",password:"",confirmPassword:""});
  const[localError,setLocalError]=useState("");
  const[showLoginPassword,setShowLoginPassword]=useState(false);
  const[showRegisterPasswords,setShowRegisterPasswords]=useState(false);
  const activeError=localError||error;

  useEffect(()=>{setLocalError("");},[mode,error]);

  const submit=async e=>{
    e.preventDefault();
    setLocalError("");

    if(mode==="login"){
      if(!loginForm.identifier.trim()||!loginForm.password){
        setLocalError("Enter your username or email and password.");
        return;
      }
      await onLogin(loginForm);
      return;
    }

    if(registerForm.username.trim().length<3){
      setLocalError("Username must be at least 3 characters.");
      return;
    }
    if(!registerForm.email.trim()||!registerForm.email.includes("@")){
      setLocalError("Enter a valid email address.");
      return;
    }
    if(registerForm.password.length<8){
      setLocalError("Password must be at least 8 characters.");
      return;
    }
    if(registerForm.password!==registerForm.confirmPassword){
      setLocalError("Passwords do not match.");
      return;
    }

    await onRegister({
      username:registerForm.username.trim(),
      email:registerForm.email.trim(),
      password:registerForm.password,
    });
  };

  const tabStyle=current=>({
    ...btnBase(),
    flex:1,
    padding:"12px 14px",
    background:current?`linear-gradient(180deg, ${C.accent}, ${C.accentStrong})`:"transparent",
    color:current?"#fff":C.muted,
    boxShadow:current?"0 16px 30px rgba(59,130,246,0.18)":"none",
    transform:current?"translateY(-1px)":"translateY(0)",
  });

  return<div style={{
    minHeight:"100vh",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    padding:"32px 20px",
    background:C.authBackdrop,
    position:"relative",
    overflow:"hidden",
  }}>
    <div style={{position:"absolute",inset:0,background:C.overlay}}/>
    <div style={{position:"absolute",top:"10%",left:"10%",width:240,height:240,borderRadius:"50%",background:C.decorBlue,filter:"blur(24px)"}}/>
    <div style={{position:"absolute",right:"12%",bottom:"14%",width:220,height:220,borderRadius:"50%",background:C.decorPurple,filter:"blur(24px)"}}/>
    <div style={{position:"relative",width:"min(560px, 100%)",display:"flex",flexDirection:"column",alignItems:"center",gap:22,animation:"riseIn .55s ease both"}}>
      <div style={{width:"100%",display:"flex",justifyContent:"flex-end"}}>
        <ThemeToggleButton theme={theme} onToggle={onToggleTheme}/>
      </div>
      <div style={{background:C.glassStrong,borderRadius:20,padding:"30px 28px 26px",boxShadow:C.shadowLg,backdropFilter:"blur(16px)"}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:12,marginBottom:24}}>
          <div style={{width:56,height:56,borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(180deg, #4f8cff, #2563eb)",boxShadow:"0 16px 28px rgba(59,130,246,0.22)"}}>
            <Icon name="chart" color="#fff" size={24}/>
          </div>
          <div>
            <div style={{fontSize:26,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif"}}>{BRAND.name}</div>
            <div style={{fontSize:13,color:C.muted,marginTop:4}}>{BRAND.tagline}</div>
          </div>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:22,padding:6,borderRadius:16,background:C.surfaceSoft}}>
          <button type="button" onClick={()=>onModeChange("login")} style={tabStyle(mode==="login")}>Log In</button>
          <button type="button" onClick={()=>onModeChange("register")} style={tabStyle(mode==="register")}>Register</button>
        </div>

        <div style={{marginBottom:22,textAlign:"center"}}>
          <div style={{fontSize:38,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1.02,marginBottom:10}}>
            {mode==="login"?"Welcome back":"Create your account"}
          </div>
          <div style={{fontSize:14,color:C.muted,lineHeight:1.75,marginBottom:8}}>
            {mode==="login"
              ?"Sign in to access your trades and performance insights."
              :"Create an account to save trades and restore your journal automatically."}
          </div>
        </div>

        <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>
          {mode==="login"?<>
            <AuthField
              label="Email"
              value={loginForm.identifier}
              onChange={e=>setLoginForm(form=>({...form,identifier:e.target.value}))}
              placeholder="Enter your email or username"
              autoComplete="username"
            />
            <AuthPasswordField
              label="Password"
              value={loginForm.password}
              onChange={e=>setLoginForm(form=>({...form,password:e.target.value}))}
              placeholder="Enter your password"
              autoComplete="current-password"
              visible={showLoginPassword}
              onToggle={()=>setShowLoginPassword(value=>!value)}
            />
          </>:<>
            <AuthField
              label="Username"
              value={registerForm.username}
              onChange={e=>setRegisterForm(form=>({...form,username:e.target.value}))}
              placeholder="Choose a username"
              autoComplete="username"
            />
            <AuthField
              label="Email"
              type="email"
              value={registerForm.email}
              onChange={e=>setRegisterForm(form=>({...form,email:e.target.value}))}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <AuthPasswordField
              label="Password"
              value={registerForm.password}
              onChange={e=>setRegisterForm(form=>({...form,password:e.target.value}))}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              visible={showRegisterPasswords}
              onToggle={()=>setShowRegisterPasswords(value=>!value)}
            />
            <AuthPasswordField
              label="Confirm Password"
              value={registerForm.confirmPassword}
              onChange={e=>setRegisterForm(form=>({...form,confirmPassword:e.target.value}))}
              placeholder="Repeat password"
              autoComplete="new-password"
              visible={showRegisterPasswords}
              onToggle={()=>setShowRegisterPasswords(value=>!value)}
            />
          </>}

          {activeError&&<div style={{padding:"13px 15px",borderRadius:16,background:"linear-gradient(180deg, rgba(239,68,68,0.10), rgba(239,68,68,0.06))",color:C.red,fontSize:13,lineHeight:1.6,boxShadow:"inset 0 0 0 1px rgba(239,68,68,0.12)"}}>{activeError}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{...btnBase(),height:54,width:"100%",background:"linear-gradient(180deg, #4f8cff, #2563eb)",color:"#fff",fontWeight:800,fontSize:15,boxShadow:"0 18px 30px rgba(59,130,246,0.22)",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:10}}
          >
            {loading&&<span style={{width:18,height:18,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.34)",borderTopColor:"#fff",display:"inline-block",animation:"spin 0.85s linear infinite"}}/>}
            <span>{loading?(mode==="login"?"Signing in...":"Creating account..."):(mode==="login"?"Access Dashboard":"Create Account")}</span>
          </button>
        </form>
      </div>

      <div style={{fontSize:17,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1.35,textAlign:"center",maxWidth:520,margin:"0 auto"}}>
        Track your trades. Fix your mistakes. Become a consistent and profitable trader.
      </div>
    </div>
  </div>;
}

function TimeInput12h({value,onChange}){
  const parts=parseTimeParts(value);
  const [draftHour,setDraftHour]=useState(parts?String(parts.hours%12||12):"");
  const [draftMinute,setDraftMinute]=useState(parts?String(parts.minutes).padStart(2,"0"):"");
  const [draftMeridiem,setDraftMeridiem]=useState(parts?(parts.hours>=12?"PM":"AM"):"AM");

  useEffect(()=>{
    const nextParts=parseTimeParts(value);
    setDraftHour(nextParts?String(nextParts.hours%12||12):"");
    setDraftMinute(nextParts?String(nextParts.minutes).padStart(2,"0"):"");
    setDraftMeridiem(nextParts?(nextParts.hours>=12?"PM":"AM"):"AM");
  },[value]);

  const update=(nextHour=draftHour,nextMinute=draftMinute,nextMeridiem=draftMeridiem)=>{
    setDraftHour(nextHour);
    setDraftMinute(nextMinute);
    setDraftMeridiem(nextMeridiem);
    if(!nextHour||nextMinute===""){onChange("");return;}
    const parsedHour=Math.min(12,Math.max(1,Number(nextHour)||0));
    const parsedMinute=Math.min(59,Math.max(0,Number(nextMinute)||0));
    let hours24=parsedHour%12;
    if(nextMeridiem==="PM")hours24+=12;
    onChange(`${String(hours24).padStart(2,"0")}:${String(parsedMinute).padStart(2,"0")}`);
  };

  const selectStyle=inp({padding:"0 8px",height:40});

  return<div style={{display:"grid",gridTemplateColumns:"58px 64px 68px",gap:6}}>
    <select value={draftHour} onChange={e=>update(e.target.value,draftMinute,draftMeridiem)} style={selectStyle}>
      <option value="">Hr</option>
      {Array.from({length:12},(_,i)=>String(i+1)).map(v=><option key={v} value={v}>{v}</option>)}
    </select>
    <select value={draftMinute} onChange={e=>update(draftHour,e.target.value,draftMeridiem)} style={selectStyle}>
      <option value="">Min</option>
      {Array.from({length:60},(_,i)=>String(i).padStart(2,"0")).map(v=><option key={v} value={v}>{v}</option>)}
    </select>
    <select value={draftMeridiem} onChange={e=>update(draftHour,draftMinute,e.target.value)} style={selectStyle}>
      <option value="AM">AM</option>
      <option value="PM">PM</option>
    </select>
  </div>;
}

function TradeCard({trade,pnl,onSelect,onEdit}){
  const [notesOpen,setNotesOpen]=useState(false);
  const dur=calcDur(trade);
  const entryNotional=calcEntryNotional(trade);
  const returnPct=entryNotional?pnl/entryNotional:null;
  const timeRange=getTradeTimeRangeLabel(trade);
  const contractLabel=formatContractQty(calcContractQty(trade));
  const pre=cleanTradeNoteText(trade.preTrade);
  const post=cleanTradeNoteText(trade.postTrade);
  const hasNotes=Boolean(pre||post);
  const notesRegionId=`trade-notes-${trade.id}`;
  const previewLineStyle={
    fontSize:12,
    color:C.text,
    whiteSpace:"nowrap",
    overflow:"hidden",
    textOverflow:"ellipsis",
  };
  const notePanelStyle={
    padding:"14px 15px",
    borderRadius:16,
    background:C.surface,
    boxShadow:"inset 0 0 0 1px rgba(148,163,184,0.10)",
    display:"grid",
    gap:8,
    alignContent:"start",
  };
  const openTradeNotesEditor=e=>{
    e.stopPropagation();
    onEdit(trade);
  };

  return<div
    onClick={()=>onSelect(trade)}
    style={{cursor:"pointer"}}
    onMouseEnter={e=>{e.currentTarget.firstChild.style.transform="translateY(-3px)";e.currentTarget.firstChild.style.boxShadow=C.shadowMd;}}
    onMouseLeave={e=>{e.currentTarget.firstChild.style.transform="translateY(0)";e.currentTarget.firstChild.style.boxShadow=C.shadow;}}
  >
    <Card style={{padding:"18px 20px",display:"grid",gap:16,transition:"transform 180ms ease, box-shadow 180ms ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:14,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
          <div style={{width:52,height:52,borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",background:pnl>=0?C.greenBg:C.redBg}}>
            <Icon name={pnl>=0?"arrowUp":"arrowDown"} color={pnl>=0?C.green:C.red}/>
          </div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:6}}>
              <div style={{fontSize:22,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif"}}>{trade.symbol}</div>
              <Pill label={getDirectionLabel(trade.direction)} color={getDirectionColor(trade.direction)}/>
              <Pill label={trade.strategy} color={C.purple}/>
            </div>
            <div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>
              {trade.date}{timeRange?` | ${timeRange}`:""} | {contractLabel} | {trade.market} | {trade.emotion}
            </div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"flex-end",gap:10,flexWrap:"wrap"}}>
            <div style={{fontSize:28,fontWeight:800,color:pnl>=0?C.green:C.red,fontFamily:"'Sora','Manrope',sans-serif"}}>{pnl>=0?"+$":"-$"}{Math.abs(pnl).toFixed(0)}</div>
            {returnPct!==null&&<div style={{fontSize:16,fontWeight:800,color:returnPct>=0?C.green:C.red,fontFamily:"'Sora','Manrope',sans-serif"}}>{fmtPct(returnPct)}</div>}
          </div>
          <div style={{fontSize:12,color:C.muted}}>{dur!==null?`${fmtDuration(dur)} hold`:"Duration unavailable"}</div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14}}>
        <div style={{padding:"14px 15px",borderRadius:16,background:C.surfaceSoft}}>
          <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700,marginBottom:5}}>Entry / Exit</div>
          <div style={{fontSize:15,fontWeight:700,color:C.text}}>{contractLabel}</div>
          <div style={{fontSize:12,color:C.textSoft,marginTop:4}}>${trade.entries[0]?.price} to ${trade.exits[0]?.price}</div>
        </div>
        <div style={{padding:"14px 15px",borderRadius:16,background:C.surfaceSoft}}>
          <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700,marginBottom:5}}>Execution Tags</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            <Pill label={trade.emotion} color={C.teal} sm/>
            {trade.mistakes?.map(m=> <Pill key={m} label={m} color={C.red} sm/>)}
            {trade.positiveTags?.map(tag=><Pill key={tag} label={tag} color={C.green} sm/>)}
          </div>
        </div>
        <div
          style={{padding:"14px 15px",borderRadius:16,background:C.surfaceSoft,display:"grid",gap:12,alignContent:"start"}}
          onClick={e=>e.stopPropagation()}
        >
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
            <div style={{minWidth:0,flex:"1 1 220px"}}>
              <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700,marginBottom:7}}>Journal Notes</div>
              <div style={{display:"grid",gap:6,minWidth:0}}>
                <div style={previewLineStyle}>{getTradeNotePreviewLine("Pre",pre,"Add pre-trade note")}</div>
                <div style={previewLineStyle}>{getTradeNotePreviewLine("Post",post,"Add post-trade note")}</div>
              </div>
            </div>
            <button
              type="button"
              aria-expanded={notesOpen}
              aria-controls={notesRegionId}
              onClick={e=>{
                e.stopPropagation();
                setNotesOpen(open=>!open);
              }}
              style={{
                ...btnBase(),
                padding:"8px 12px",
                minWidth:118,
                fontSize:12,
                fontWeight:700,
                color:hasNotes?C.teal:C.accentStrong,
                background:hasNotes?C.tealBg:C.accentBg,
                boxShadow:"inset 0 0 0 1px rgba(59,130,246,0.12)",
              }}
            >
              {hasNotes?"Notes":"Add Notes"}
            </button>
          </div>
        </div>
      </div>

      <div
        id={notesRegionId}
        style={{
          maxHeight:notesOpen?460:0,
          opacity:notesOpen?1:0,
          transform:notesOpen?"translateY(0)":"translateY(-8px)",
          overflow:"hidden",
          transition:"max-height 260ms ease, opacity 180ms ease, transform 220ms ease",
        }}
        onClick={e=>e.stopPropagation()}
        >
          <div style={{padding:"16px",borderRadius:18,background:"#EDF3F9",display:"grid",gap:14,maxHeight:"min(340px, 56vh)",overflowY:"auto"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
              <button
                type="button"
                onClick={openTradeNotesEditor}
                style={{...btnBase(),...notePanelStyle,textAlign:"left",cursor:"pointer"}}
              >
                <div style={{fontSize:11,color:C.accent,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800}}>Pre-Trade Plan</div>
                <div style={{fontSize:13,color:pre?C.text:C.muted,lineHeight:1.75,whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>
                  {pre||"Add Pre-Trade Note"}
                </div>
              </button>
              <button
                type="button"
                onClick={openTradeNotesEditor}
                style={{...btnBase(),...notePanelStyle,textAlign:"left",cursor:"pointer"}}
              >
                <div style={{fontSize:11,color:C.amber,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800}}>Post-Trade Reflection</div>
                <div style={{fontSize:13,color:post?C.text:C.muted,lineHeight:1.75,whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>
                  {post||"Add Post-Trade Note"}
                </div>
              </button>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end"}}>
              <button
                type="button"
                onClick={openTradeNotesEditor}
                style={{...btnBase(),padding:"10px 14px",background:C.surface,color:C.accentStrong,fontWeight:700}}
              >
                Edit Notes
            </button>
          </div>
        </div>
      </div>

      {trade.screenshots?.length>0&&<div style={{padding:"14px 15px",borderRadius:16,background:C.surfaceSoft}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",marginBottom:10,flexWrap:"wrap"}}>
          <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700}}>Screenshots</div>
          <div style={{fontSize:12,color:C.muted}}>{trade.screenshots.length} attached</div>
        </div>
        <ScreenshotStrip images={trade.screenshots} compact/>
      </div>}
    </Card>
  </div>;
}

// â”€â”€ Chart wrapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FormField({label,err,children}){
  return<div style={{marginBottom:16}}>
    <label style={{display:"block",fontSize:11,color:err?C.red:C.muted,marginBottom:7,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em"}}>
      {label}{err&&` | ${err}`}
    </label>
    {children}
  </div>;
}

function ScreenshotStrip({images,compact=false}){
  const items=Array.isArray(images)?images.filter(Boolean):[];
  const [activeIndex,setActiveIndex]=useState(null);

  useEffect(()=>{
    if(activeIndex===null)return;
    const onKeyDown=event=>{
      if(event.key==="Escape")setActiveIndex(null);
      if(event.key==="ArrowLeft")setActiveIndex(current=>current===null?current:(current-1+items.length)%items.length);
      if(event.key==="ArrowRight")setActiveIndex(current=>current===null?current:(current+1)%items.length);
    };
    window.addEventListener("keydown",onKeyDown);
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return()=>{
      window.removeEventListener("keydown",onKeyDown);
      document.body.style.overflow=previousOverflow;
    };
  },[activeIndex,items.length]);
  if(!items.length)return null;

  return<>
    <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
      {items.slice(0,compact?3:6).map((src,index)=><button
        key={`${src.slice(0,24)}-${index}`}
        type="button"
        onClick={()=>setActiveIndex(index)}
        style={{
          ...btnBase(),
          padding:0,
          borderRadius:14,
          overflow:"hidden",
          lineHeight:0,
          boxShadow:C.shadow,
          background:C.surface,
          cursor:"zoom-in",
        }}
      >
        <img
          src={src}
          alt={`Trade screenshot ${index+1}`}
          style={{
            width:compact?72:140,
            height:compact?52:92,
            objectFit:"cover",
            background:C.surface,
            display:"block",
          }}
        />
      </button>)}
      {items.length>(compact?3:6)&&<div style={{padding:"10px 12px",borderRadius:14,background:C.surfaceSoft,color:C.muted,fontSize:12,fontWeight:800}}>
        +{items.length-(compact?3:6)} more
      </div>}
    </div>
    {activeIndex!==null&&<div
      onClick={()=>setActiveIndex(null)}
      style={{
        position:"fixed",
        inset:0,
        zIndex:10000,
        background:"rgba(2,6,23,0.88)",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        padding:compact?18:28,
      }}
    >
      <button
        type="button"
        onClick={event=>{event.stopPropagation();setActiveIndex(null);}}
        style={{
          ...btnBase(),
          position:"absolute",
          top:18,
          right:18,
          width:42,
          height:42,
          borderRadius:999,
          display:"inline-flex",
          alignItems:"center",
          justifyContent:"center",
          background:"rgba(15,23,42,0.78)",
          color:"#fff",
          fontSize:28,
          lineHeight:1,
          boxShadow:"0 16px 32px rgba(2,6,23,0.32)",
        }}
        aria-label="Close screenshot preview"
      >
        X
      </button>
      {items.length>1&&<button
        type="button"
        onClick={event=>{event.stopPropagation();setActiveIndex(current=>(current-1+items.length)%items.length);}}
        style={{
          ...btnBase(),
          position:"absolute",
          left:18,
          top:"50%",
          transform:"translateY(-50%)",
          width:46,
          height:46,
          borderRadius:999,
          display:"inline-flex",
          alignItems:"center",
          justifyContent:"center",
          background:"rgba(15,23,42,0.78)",
          color:"#fff",
          fontSize:28,
          lineHeight:1,
        }}
        aria-label="Previous screenshot"
      >
        {"<"}
      </button>}
      <div
        onClick={event=>event.stopPropagation()}
        style={{maxWidth:"min(92vw, 1400px)",maxHeight:"88vh",display:"grid",gap:12,justifyItems:"center"}}
      >
        <img
          src={items[activeIndex]}
          alt={`Trade screenshot ${activeIndex+1}`}
          style={{
            maxWidth:"100%",
            maxHeight:"82vh",
            width:"auto",
            height:"auto",
            objectFit:"contain",
            borderRadius:18,
            boxShadow:"0 26px 60px rgba(2,6,23,0.42)",
            background:C.surface,
          }}
        />
        <div style={{padding:"8px 12px",borderRadius:999,background:"rgba(15,23,42,0.74)",color:"#fff",fontSize:12,fontWeight:800}}>
          Screenshot {activeIndex+1} of {items.length}
        </div>
      </div>
      {items.length>1&&<button
        type="button"
        onClick={event=>{event.stopPropagation();setActiveIndex(current=>(current+1)%items.length);}}
        style={{
          ...btnBase(),
          position:"absolute",
          right:18,
          top:"50%",
          transform:"translateY(-50%)",
          width:46,
          height:46,
          borderRadius:999,
          display:"inline-flex",
          alignItems:"center",
          justifyContent:"center",
          background:"rgba(15,23,42,0.78)",
          color:"#fff",
          fontSize:28,
          lineHeight:1,
        }}
        aria-label="Next screenshot"
      >
        {">"}
      </button>}
    </div>}
  </>;
}

function ChartBox({h=180,children}){return<div style={{height:h,position:"relative"}}>{children}</div>;}

function createVerticalGradient(ctx,top,bottom){
  const gradient=ctx.createLinearGradient(0,0,0,220);
  gradient.addColorStop(0,top);
  gradient.addColorStop(1,bottom);
  return gradient;
}

function chartScales({currency=true,hideXGrid=false,indexAxis="x"}={}){
  return{
    x:{
      grid:{display:!hideXGrid,color:C.grid,drawBorder:false},
      border:{display:false},
      ticks:{color:C.muted,font:{size:11,weight:600}},
    },
    y:{
      grid:{color:C.grid,drawBorder:false},
      border:{display:false},
      ticks:{
        color:C.muted,
        font:{size:11,weight:600},
        callback:value=>currency?`$${Number(value).toFixed(0)}`:value,
      },
    },
    ...(indexAxis==="y"?{
      x:{
        grid:{color:C.grid,drawBorder:false},
        border:{display:false},
        ticks:{
          color:C.muted,
          font:{size:11,weight:600},
          callback:value=>currency?`$${Number(value).toFixed(0)}`:value,
        },
      },
      y:{
        grid:{display:false},
        border:{display:false},
        ticks:{color:C.muted,font:{size:11,weight:700}},
      },
    }:{ }),
  };
}

// â”€â”€ DASHBOARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function LegacyDashboardView({trades}){
  const stats=calcStats(trades);
  const pnls=trades.map(calcPnl);
  const eqRef=useRef(),pnlRef=useRef(),pieRef=useRef();

  useEffect(()=>{
    if(!eqRef.current||!trades.length)return;
    const labels=["Start",...trades.map(t=>t.date.slice(5))];
    const ctx=eqRef.current.getContext("2d");
    const ch=new Chart(ctx,{type:"line",data:{labels,datasets:[{label:"Equity",data:stats.curve,borderColor:C.accentStrong,borderWidth:3,fill:true,backgroundColor:createVerticalGradient(ctx,"rgba(59,130,246,0.24)","rgba(59,130,246,0.02)"),tension:0.42,pointRadius:0,pointHoverRadius:4,pointBackgroundColor:C.accentStrong}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:C.tooltipBg,padding:12,displayColors:false,callbacks:{label:v=>`Equity $${v.parsed.y.toFixed(0)}`}}},scales:chartScales()}});
    return()=>ch.destroy();
  },[trades,ACTIVE_THEME]);

  useEffect(()=>{
    if(!pnlRef.current||!trades.length)return;
    const ch=new Chart(pnlRef.current.getContext("2d"),{type:"bar",data:{labels:trades.map(t=>t.date.slice(5)),datasets:[{data:pnls,backgroundColor:pnls.map(p=>p>0?C.green:C.red),borderRadius:10,borderSkipped:false,maxBarThickness:32}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:C.tooltipBg,displayColors:false}},scales:{x:{grid:{display:false},border:{display:false},ticks:{color:C.muted,font:{size:11,weight:700},autoSkip:false,maxRotation:0}},y:chartScales().y}}});
    return()=>ch.destroy();
  },[trades,ACTIVE_THEME]);

  useEffect(()=>{
    if(!pieRef.current||!trades.length)return;
    const ch=new Chart(pieRef.current.getContext("2d"),{type:"doughnut",data:{labels:["Wins","Losses"],datasets:[{data:[stats.wins,stats.losses],backgroundColor:[C.green,C.red],borderWidth:0,hoverOffset:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:C.tooltipBg,displayColors:false}},cutout:"72%"}});
    return()=>ch.destroy();
  },[trades,ACTIVE_THEME]);

  if(!trades.length)return<EmptyState icon="chart" title="Start your first review cycle" message="Log a trade to unlock your live dashboard, equity curve, session summaries, and coaching insights."/>;
  const pf=stats.profitFactor;

  return<div style={{display:"flex",flexDirection:"column",gap:22,animation:"riseIn .45s ease both"}}>
    <PageIntro eyebrow={BRAND.tagline} title="Performance command center" description="A clear view of profitability, execution quality, and the setups driving your edge."/>
    <div style={{display:"grid",gridTemplateColumns:"minmax(320px,1.6fr) minmax(280px,1fr)",gap:18}}>
      <Card accent={stats.totalPnl>=0?C.green:C.red} style={{padding:"28px 28px 24px",background:`linear-gradient(135deg, ${C.surface} 0%, ${stats.totalPnl>=0?"rgba(34,197,94,0.10)":"rgba(239,68,68,0.08)"} 100%)`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:18,flexWrap:"wrap"}}>
          <div>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"7px 12px",borderRadius:999,background:C.surfaceAlt,color:C.accentStrong,fontSize:12,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",boxShadow:C.shadow}}>
              <Icon name="wallet" size={14} color={C.accentStrong}/>
              Total P&L
            </div>
            <div style={{fontSize:54,fontWeight:800,lineHeight:1,letterSpacing:"-0.03em",color:stats.totalPnl>=0?C.green:C.red,fontFamily:"'Sora','Manrope',sans-serif",margin:"18px 0 10px"}}>
              {stats.totalPnl>=0?"+$":"-$"}{Math.abs(stats.totalPnl).toFixed(0)}
            </div>
            <div style={{fontSize:15,color:C.muted,lineHeight:1.8,maxWidth:460}}>
              {stats.expectancy>=0
                ?`Execution is paying. You're averaging ${fmtMoney(stats.expectancy)} expectancy per trade.`
                :`Expectancy sits at ${fmtMoney(stats.expectancy)} per trade. Tighten quality before increasing risk.`}
            </div>
          </div>
          <div style={{display:"grid",gap:10,minWidth:220}}>
            <div style={{padding:"14px 16px",borderRadius:16,background:C.glass,boxShadow:C.shadow}}>
              <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700,marginBottom:4}}>Session Quality</div>
              <div style={{fontSize:24,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif"}}>{(stats.winRate*100).toFixed(1)}%</div>
              <div style={{fontSize:12,color:C.muted}}>{stats.wins} wins / {stats.losses} losses</div>
            </div>
            <div style={{padding:"14px 16px",borderRadius:16,background:C.glass,boxShadow:C.shadow}}>
              <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700,marginBottom:4}}>Profit Factor</div>
              <div style={{fontSize:24,fontWeight:800,color:pf>=1.5?C.green:pf>=1?C.amber:C.red,fontFamily:"'Sora','Manrope',sans-serif"}}>{pf>=999?"Inf":pf.toFixed(2)}</div>
              <div style={{fontSize:12,color:C.muted}}>{trades.length} trades logged</div>
            </div>
          </div>
        </div>
      </Card>
      <div style={{display:"grid",gap:14}}>
        <Metric label="Win Rate" value={`${(stats.winRate*100).toFixed(1)}%`} icon="target" trend={{tone:stats.winRate>=0.5?"positive":"warning",label:stats.winRate>=0.5?"Above 50%":"Needs work"}} sub={`${stats.wins} winning trades`} small/>
        <Metric label="Profit Factor" value={pf>=999?"Inf":pf.toFixed(2)} color={pf>=1.5?C.green:pf>=1?C.amber:C.red} icon="pulse" trend={{tone:pf>=1.5?"positive":pf>=1?"warning":"negative",label:pf>=1.5?"Healthy edge":pf>=1?"Break-even zone":"Below target"}} small/>
        <Metric label="Expectancy" value={`${stats.expectancy>=0?"+$":"-$"}${Math.abs(stats.expectancy).toFixed(0)}`} color={stats.expectancy>=0?C.green:C.red} icon="spark" trend={{tone:stats.expectancy>=0?"positive":"negative",label:stats.expectancy>=0?"Positive expectancy":"Negative expectancy"}} small/>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:16}}>
      <Metric label="Avg Win" value={`+$${stats.avgWin.toFixed(0)}`} color={C.green} icon="arrowUp" small sub="Average winning trade"/>
      <Metric label="Avg Loss" value={`-$${stats.avgLoss.toFixed(0)}`} color={C.red} icon="arrowDown" small sub="Average losing trade"/>
      <Metric label="Max Drawdown" value={`-$${stats.maxDD.toFixed(0)}`} color={C.red} icon="chart" small sub="Largest pullback"/>
      <Metric label="Total Trades" value={trades.length} color={C.text} icon="layers" small sub="Tracked in journal"/>
    </div>
    <Card style={{padding:"24px 24px 18px"}}>
      <SLabel>Equity Curve</SLabel>
      <ChartBox h={260}><canvas ref={eqRef} role="img" aria-label="Equity curve"/></ChartBox>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"minmax(320px,1.4fr) minmax(280px,0.9fr)",gap:18}}>
      <Card>
        <SLabel>P&L Per Trade</SLabel>
        <ChartBox h={230}><canvas ref={pnlRef} role="img" aria-label="P&L per trade bar chart"/></ChartBox>
      </Card>
      <Card>
        <SLabel>Win / Loss Split</SLabel>
        <ChartBox h={190}><canvas ref={pieRef} role="img" aria-label="Win loss ratio doughnut"/></ChartBox>
        <div style={{display:"flex",justifyContent:"center",gap:18,marginTop:8,flexWrap:"wrap"}}>
          <Pill label={`${stats.wins} wins`} color={C.green}/>
          <Pill label={`${stats.losses} losses`} color={C.red}/>
        </div>
      </Card>
    </div>
  </div>;
}

function DashboardClassicView({trades}){
  const stats=calcStats(trades);
  const pnls=trades.map(calcPnl);
  const eqRef=useRef(),pnlRef=useRef();
  const[outcomeView,setOutcomeView]=useState("wins");
  const grossWins=pnls.filter(pnl=>pnl>0).reduce((sum,pnl)=>sum+pnl,0);
  const grossLosses=Math.abs(pnls.filter(pnl=>pnl<=0).reduce((sum,pnl)=>sum+pnl,0));
  const outcomeSummary={
    wins:{
      label:"Wins",
      count:stats.wins,
      money:grossWins,
      pct:stats.decisiveTrades?stats.wins/stats.decisiveTrades:0,
      tone:C.green,
      description:"Winning trades show the total upside your green sessions have produced so far.",
    },
    losses:{
      label:"Losses",
      count:stats.losses,
      money:grossLosses,
      pct:stats.decisiveTrades?stats.losses/stats.decisiveTrades:0,
      tone:C.red,
      description:"Losing trades show how often weak sessions happen and how much capital they have cost.",
    },
  };
  const selectedOutcome=outcomeSummary[outcomeView];

  useEffect(()=>{
    if(!eqRef.current||!trades.length)return;
    const labels=["Start",...trades.map(trade=>trade.date.slice(5))];
    const ctx=eqRef.current.getContext("2d");
    const ch=new Chart(ctx,{type:"line",data:{labels,datasets:[{label:"Equity",data:stats.curve,borderColor:C.accentStrong,borderWidth:3,fill:true,backgroundColor:createVerticalGradient(ctx,"rgba(59,130,246,0.24)","rgba(59,130,246,0.02)"),tension:0.42,pointRadius:0,pointHoverRadius:4,pointBackgroundColor:C.accentStrong}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:C.tooltipBg,padding:12,displayColors:false,callbacks:{label:value=>`Equity $${value.parsed.y.toFixed(0)}`}}},scales:chartScales()}});
    return()=>ch.destroy();
  },[trades,ACTIVE_THEME]);

  useEffect(()=>{
    if(!pnlRef.current||!trades.length)return;
    const ch=new Chart(pnlRef.current.getContext("2d"),{type:"bar",data:{labels:trades.map(trade=>trade.date.slice(5)),datasets:[{data:pnls,backgroundColor:pnls.map(pnl=>pnl>0?C.green:C.red),borderRadius:10,borderSkipped:false,maxBarThickness:32}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:C.tooltipBg,displayColors:false}},scales:{x:{grid:{display:false},border:{display:false},ticks:{color:C.muted,font:{size:11,weight:700},autoSkip:false,maxRotation:0}},y:chartScales().y}}});
    return()=>ch.destroy();
  },[trades,ACTIVE_THEME]);

  if(!trades.length)return<EmptyState icon="chart" title="Start your first review cycle" message="Log a trade to unlock your live dashboard, equity curve, session summaries, and coaching insights."/>;
  const pf=stats.profitFactor;

  return<div style={{display:"flex",flexDirection:"column",gap:22,animation:"riseIn .45s ease both"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:16}}>
      <Metric label="Total P&L" value={fmtMoney(stats.totalPnl)} color={stats.totalPnl>=0?C.green:C.red} icon="wallet" small emphasis sub="Net journal performance"/>
      <Metric label="Win Rate" value={`${(stats.winRate*100).toFixed(1)}%`} icon="target" trend={{tone:stats.winRate>=0.5?"positive":"warning",label:stats.winRate>=0.5?"Above 50%":"Needs work"}} sub={`${stats.wins} winning trades`} small/>
      <Metric label="Profit Factor" value={pf>=999?"Inf":pf.toFixed(2)} color={pf>=1.5?C.green:pf>=1?C.amber:C.red} icon="pulse" trend={{tone:pf>=1.5?"positive":pf>=1?"warning":"negative",label:pf>=1.5?"Healthy edge":pf>=1?"Break-even zone":"Below target"}} small/>
      <Metric label="Avg Win" value={`+$${stats.avgWin.toFixed(0)}`} color={C.green} icon="arrowUp" small sub="Average winning trade"/>
      <Metric label="Avg Loss" value={`-$${stats.avgLoss.toFixed(0)}`} color={C.red} icon="arrowDown" small sub="Average losing trade"/>
      <Metric label="Max Drawdown" value={`-$${stats.maxDD.toFixed(0)}`} color={C.red} icon="chart" small sub="Largest pullback"/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"minmax(320px,1.25fr) minmax(280px,0.9fr)",gap:18}}>
      <Card style={{padding:"24px 24px 18px"}}>
        <SLabel>Equity Curve</SLabel>
        <ChartBox h={260}><canvas ref={eqRef} role="img" aria-label="Equity curve"/></ChartBox>
      </Card>
      <Card>
        <SLabel>Trade Outcomes</SLabel>
        <div style={{display:"grid",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}}>
            {["wins","losses"].map(key=>{
              const item=outcomeSummary[key];
              const active=outcomeView===key;
              return<button key={key} onClick={()=>setOutcomeView(key)} style={{
                ...btnBase(),
                padding:"16px 18px",
                background:active?`${item.tone}12`:C.surfaceAlt,
                color:item.tone,
                textAlign:"left",
                boxShadow:active?`inset 0 0 0 1px ${item.tone}22`:C.shadow,
              }}>
                <div style={{fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:6}}>{item.label}</div>
                <div style={{fontSize:28,fontWeight:800,fontFamily:"'Sora','Manrope',sans-serif"}}>{item.count}</div>
              </button>;
            })}
          </div>

          <div style={{padding:"18px 18px 16px",borderRadius:18,background:`linear-gradient(180deg, ${C.surface}, ${selectedOutcome.tone}08)`}}>
            <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:10}}>{selectedOutcome.label} Detail</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:12,marginBottom:12}}>
              <div>
                <div style={{fontSize:12,color:C.muted,marginBottom:4}}>Trades</div>
                <div style={{fontSize:28,fontWeight:800,color:selectedOutcome.tone,fontFamily:"'Sora','Manrope',sans-serif"}}>{selectedOutcome.count}</div>
              </div>
              <div>
                <div style={{fontSize:12,color:C.muted,marginBottom:4}}>Money</div>
                <div style={{fontSize:28,fontWeight:800,color:selectedOutcome.tone,fontFamily:"'Sora','Manrope',sans-serif"}}>
                  {selectedOutcome.label==="Losses"?`-$${selectedOutcome.money.toFixed(0)}`:`+$${selectedOutcome.money.toFixed(0)}`}
                </div>
              </div>
              <div>
                <div style={{fontSize:12,color:C.muted,marginBottom:4}}>Percent</div>
                <div style={{fontSize:28,fontWeight:800,color:selectedOutcome.tone,fontFamily:"'Sora','Manrope',sans-serif"}}>{fmtPct(selectedOutcome.pct)}</div>
              </div>
            </div>
            <div style={{fontSize:13,color:C.muted,lineHeight:1.75}}>{selectedOutcome.description}</div>
          </div>
        </div>
      </Card>
    </div>

    <Card>
      <SLabel>P&L Per Trade</SLabel>
      <ChartBox h={230}><canvas ref={pnlRef} role="img" aria-label="P&L per trade bar chart"/></ChartBox>
    </Card>
  </div>;
}

const DASHBOARD_RANGE_OPTIONS=[
  {key:"LAST_7",label:"Last 7 Days"},
  {key:"LAST_30",label:"Last 30 Days"},
  {key:"THIS_MONTH",label:"This Month"},
  {key:"ALL",label:"All Time"},
];

const BEHAVIOR_RANGE_OPTIONS=[
  {key:"TODAY",label:"Today"},
  {key:"THIS_WEEK",label:"This week"},
  {key:"THIS_MONTH",label:"This month"},
  {key:"ALL",label:"All time"},
];

const BEHAVIOR_MIN_SAMPLE_SIZE=3;

function getLatestTradeAnchorDate(trades){
  const dates=trades.map(trade=>parseDateOnly(trade?.date)).filter(Boolean).sort((a,b)=>a-b);
  return dates.length?dates[dates.length-1]:startOfDay(new Date());
}

function filterDashboardTrades(trades,range){
  if(range==="ALL")return[...trades];
  const anchor=startOfDay(getLatestTradeAnchorDate(trades));
  let start=null;
  let end=addDays(anchor,1);

  if(range==="LAST_7")start=addDays(anchor,-6);
  if(range==="LAST_30")start=addDays(anchor,-29);
  if(range==="THIS_MONTH"){
    start=startOfMonth(anchor);
    end=new Date(anchor.getFullYear(),anchor.getMonth()+1,1);
  }

  return trades.filter(trade=>{
    const tradeDate=parseDateOnly(trade?.date);
    if(!tradeDate||!start)return false;
    const tradeDay=startOfDay(tradeDate);
    return tradeDay>=start&&tradeDay<end;
  });
}

function getTopBehaviorContextValue(values){
  return Object.entries(values||{})
    .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]?.[0]||"";
}

function buildBehaviorRows(trades,tagKey,{minTrades=BEHAVIOR_MIN_SAMPLE_SIZE}={}){
  const rows={};
  trades.forEach(trade=>{
    const pnl=calcPnl(trade);
    const labels=Array.isArray(trade?.[tagKey])?trade[tagKey].filter(Boolean):[];
    [...new Set(labels)].forEach(label=>{
      if(!rows[label])rows[label]={label,count:0,pnl:0,emotions:{},strategies:{},notes:[]};
      rows[label].count+=1;
      rows[label].pnl+=pnl;
      const emotion=String(trade.emotion||"").trim();
      const strategy=String(trade.strategy||"").trim();
      if(emotion)rows[label].emotions[emotion]=(rows[label].emotions[emotion]||0)+1;
      if(strategy)rows[label].strategies[strategy]=(rows[label].strategies[strategy]||0)+1;
      const note=cleanTradeNoteText(trade.postTrade||trade.preTrade);
      if(note)rows[label].notes.push(clipText(note,92));
    });
  });
  return Object.values(rows)
    .filter(row=>row.count>=minTrades)
    .map(row=>{
      const topEmotion=getTopBehaviorContextValue(row.emotions);
      const topStrategy=getTopBehaviorContextValue(row.strategies);
      const contextParts=[];
      if(topStrategy)contextParts.push(`Common on ${topStrategy} setups`);
      if(topEmotion)contextParts.push(`Usually tagged with ${topEmotion.toLowerCase()} emotion`);
      return{
        ...row,
        avgPnl:row.count?row.pnl/row.count:0,
        topEmotion,
        topStrategy,
        context:contextParts.join(" | "),
        exampleNote:row.notes[0]||"",
      };
    });
}

function capitalizeInsightLabel(label){
  const text=String(label||"").trim();
  return text?`${text.charAt(0).toUpperCase()}${text.slice(1)}`:"N/A";
}

function formatTradeCountLabel(count){
  return`${count} trade${count!==1?"s":""}`;
}

function formatReflectionDate(dateValue){
  const parsed=parseDateOnly(dateValue);
  return parsed?parsed.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"}):String(dateValue||"");
}

function extractSignalsFromText(text){
  const cleaned=cleanTradeNoteText(text);
  if(!cleaned)return[];
  return NOTE_SIGNALS.filter(signal=>signal.patterns.some(pattern=>pattern.test(cleaned)));
}

function getDailyAiReviewTradeRows(trades){
  return [...(Array.isArray(trades)?trades:[])]
    .sort((a,b)=>getTradeDateTime(a)-getTradeDateTime(b))
    .map(trade=>{
      const pnl=calcPnl(trade);
      const outcome=getTradeOutcome(trade);
      const hour=trade.entries?.[0]?.time?.slice(0,2)||"";
      return{
        trade,
        pnl,
        outcome,
        hour,
        notes:getTradeNotesText(trade),
      };
    });
}

function formatLabelList(labels){
  const unique=[...new Set(labels.filter(Boolean))];
  if(!unique.length)return"";
  if(unique.length===1)return unique[0];
  if(unique.length===2)return`${unique[0]} and ${unique[1]}`;
  return`${unique.slice(0,-1).join(", ")}, and ${unique[unique.length-1]}`;
}

function joinInsightLines(lines,fallback){
  const unique=[...new Set(lines.map(line=>String(line||"").trim()).filter(Boolean))];
  return unique.length?unique.join("\n"):fallback;
}

function buildDailyAiReview({date,reflection,trades}){
  const dayTrades=[...(Array.isArray(trades)?trades:[])].filter(trade=>trade.date===date);
  const rows=getDailyAiReviewTradeRows(dayTrades);
  const stats=calcStats(rows.map(row=>row.trade));
  const dataset=buildCoachDataset(rows.map(row=>row.trade));
  const reflectionText=[
    reflection?.overall_summary,
    reflection?.did_right,
    reflection?.did_wrong,
    reflection?.improve_tomorrow,
  ].map(cleanTradeNoteText).filter(Boolean).join(" ");
  const reflectionSignals=extractSignalsFromText(reflectionText);
  const positiveTagRows=buildBehaviorRows(rows.map(row=>row.trade),"positiveTags",{minTrades:1})
    .sort((a,b)=>b.pnl-a.pnl||b.count-a.count||a.label.localeCompare(b.label));
  const mistakeTagRows=buildBehaviorRows(rows.map(row=>row.trade),"mistakes",{minTrades:1})
    .sort((a,b)=>a.pnl-b.pnl||b.count-a.count||a.label.localeCompare(b.label));
  const wins=rows.filter(row=>row.outcome==="WIN");
  const losses=rows.filter(row=>row.outcome==="LOSS");
  const afterNoonLosses=losses.filter(row=>row.hour&&Number(row.hour)>=12);
  const beforeNoonWins=wins.filter(row=>row.hour&&Number(row.hour)<12);
  const bestStrategy=dataset.bestStrategy;
  const bestHour=dataset.bestHour;
  const worstHour=dataset.worstHour;
  const topMistakeTag=mistakeTagRows[0]||null;
  const topPositiveTag=positiveTagRows[0]||null;
  const reflectionMismatch=reflection?.did_right&&topMistakeTag&&topMistakeTag.count>=2&&stats.totalPnl<0;

  const overallRead=joinInsightLines([
    rows.length
      ?`You logged ${rows.length} trade${rows.length!==1?"s":""} on ${formatReflectionDate(date)} and finished ${fmtMoney(stats.totalPnl)} with a ${fmtPct(stats.winRate)} win rate.`
      :"No trades were logged for this day, so the review is based on your written reflection only.",
    reflection?.overall_summary?`Your own summary was: "${clipText(reflection.overall_summary,160)}"`:"",
    bestStrategy&&bestStrategy[1].pnl>0?`${bestStrategy[0]} was your strongest setup on the day at ${fmtMoney(bestStrategy[1].pnl)}.`:"",
    topMistakeTag&&topMistakeTag.pnl<0?`${topMistakeTag.label} was the clearest drag on the session.`:"",
  ],"Not enough same-day data yet to build a full read.");

  const strengths=joinInsightLines([
    reflection?.did_right?`From your reflection: ${reflection.did_right}`:"",
    topPositiveTag?`${topPositiveTag.label} showed up on ${formatTradeCountLabel(topPositiveTag.count)} and contributed ${fmtMoney(topPositiveTag.pnl)}.`:"",
    bestStrategy&&bestStrategy[1].pnl>0?`${bestStrategy[0]} produced the best edge with ${fmtPct(bestStrategy[1].winRate)} wins.`:"",
    bestHour&&bestHour[1].pnl>0?`Your best timing window was ${formatHourLabel(bestHour[0])}, averaging ${fmtMoney(bestHour[1].avgPnl)} per trade.`:"",
    beforeNoonWins.length>=2?`Your cleaner executions came earlier in the session, with ${beforeNoonWins.length} winning trade${beforeNoonWins.length!==1?"s":""} before noon.`:"",
  ],"No clear strength pattern stood out beyond the basic trade log yet.");

  const weaknesses=joinInsightLines([
    reflection?.did_wrong?`From your reflection: ${reflection.did_wrong}`:"",
    topMistakeTag?`${topMistakeTag.label} appeared on ${formatTradeCountLabel(topMistakeTag.count)} and cost ${fmtMoney(topMistakeTag.pnl)}.`:"",
    afterNoonLosses.length>=2?`${afterNoonLosses.length} of your losses came after noon, which suggests discipline weakened later in the session.`:"",
    worstHour&&worstHour[1].pnl<0?`Your weakest window was ${formatHourLabel(worstHour[0])}, where trades averaged ${fmtMoney(worstHour[1].avgPnl)}.`:"",
    reflectionSignals.some(signal=>signal.key==="fomo")&&topMistakeTag?.label==="Chasing"?"Your notes mention FOMO and the tags confirm chasing behavior in the losses.":"",
    reflectionMismatch?"Your reflection emphasizes what went right, but the actual trade outcomes were still dominated by repeated mistake tags.":"",
  ],"No major weakness cluster was obvious beyond the individual losing trades.");

  const tagPatterns=joinInsightLines([
    topPositiveTag?`Positive tags that helped most: ${formatLabelList(positiveTagRows.slice(0,3).map(row=>row.label))}.`:"",
    topMistakeTag?`Mistake tags that hurt most: ${formatLabelList(mistakeTagRows.slice(0,3).map(row=>row.label))}.`:"",
    topPositiveTag&&topMistakeTag?`The gap between ${topPositiveTag.label} on the good trades and ${topMistakeTag.label} on the bad trades is the clearest tag-based contrast from the day.`:"",
  ],"There were not enough tags on the day to identify a reliable tag-based pattern.");

  const behaviorPatterns=joinInsightLines([
    rows.some(row=>row.trade.mistakes?.includes("Chasing"))?"Several losing trades were tied to chasing or impulsive entries.":"",
    rows.some(row=>row.trade.mistakes?.includes("Early Exit")||row.trade.mistakes?.includes("Didn't sell in time")||row.trade.mistakes?.includes("Panic Sold"))?"Exit management showed up as a behavior pattern, either by cutting too fast or not selling decisively enough.":"",
    rows.some(row=>row.trade.positiveTags?.includes("Waited for Retest"))?"Your best executions were linked to waiting for the retest instead of forcing the first move.":"",
    rows.some(row=>row.trade.mistakes?.includes("Broke Time Rule (After Noon)"))?"You broke your time rule on at least one trade, which matters because later-session trades were less controlled.":"",
    rows.some(row=>row.trade.positiveTags?.includes("Position Sized Correctly"))?"Position sizing discipline appeared on the better trades and helped keep execution cleaner.":"",
    rows.some(row=>row.trade.mistakes?.includes("No Confirmation"))?"A lack of confirmation showed up in the weak trades, which points to entering before the setup had fully proved itself.":"",
  ],"Trade behavior patterns are still forming for this specific day.");

  const tomorrowFocus=joinInsightLines([
    reflection?.improve_tomorrow?`Your own plan for tomorrow: ${reflection.improve_tomorrow}`:"",
    topMistakeTag?`Main focus: eliminate ${topMistakeTag.label.toLowerCase()} first before trying to improve secondary issues.`:"",
    topPositiveTag?`Keep repeating ${topPositiveTag.label.toLowerCase()} because it showed up on your better executions.`:"",
    afterNoonLosses.length>=2?"If discipline fades later in the day, tighten your cutoff time and protect capital once momentum slips.":"",
  ],"Focus on one rule tomorrow: repeat the cleanest setup and cut out the most expensive mistake tag.");

  return{
    date,
    ai_summary:overallRead,
    strengths,
    weaknesses,
    tag_patterns:tagPatterns,
    behavior_patterns:behaviorPatterns,
    tomorrow_focus:tomorrowFocus,
  };
}

function buildDashboardLeakItem(trades,dataset=buildCoachDataset(trades)){
  if(!trades.length)return null;

  const noteLeak=dataset.worstNoteSignal&&dataset.worstNoteSignal.n&&dataset.worstNoteSignal.pnl<0
    ?{
      source:"notes",
      label:capitalizeInsightLabel(dataset.worstNoteSignal.label),
      count:dataset.worstNoteSignal.n,
      pnl:dataset.worstNoteSignal.pnl,
      avgPnl:dataset.worstNoteSignal.n?dataset.worstNoteSignal.pnl/dataset.worstNoteSignal.n:0,
      tone:C.red,
    }
    :null;

  const negativeTag=[...dataset.mistakeTagRows]
    .filter(row=>row.n&&row.pnl<0)
    .sort((a,b)=>a.pnl-b.pnl||b.n-a.n||a.label.localeCompare(b.label))[0]||null;

  const tagLeak=negativeTag
    ?{
      source:"tags",
      label:capitalizeInsightLabel(negativeTag.label),
      count:negativeTag.n,
      pnl:negativeTag.pnl,
      avgPnl:negativeTag.avgPnl,
      tone:C.red,
    }
    :null;

  return[noteLeak,tagLeak]
    .filter(Boolean)
    .sort((a,b)=>a.pnl-b.pnl||b.count-a.count||a.label.localeCompare(b.label))[0]||null;
}

function buildDashboardFocusInsight(trades,dataset=buildCoachDataset(trades)){
  const makeInsight=(title,support,tone,metrics)=>({eyebrow:"FOCUS",title,support,tone,metrics});

  if(!trades.length){
    return makeInsight(
      "Add more trades to expose your edge",
      "Need a larger sample",
      C.accent,
      [
        {label:"P&L",value:fmtMoney(0),tone:C.accent},
        {label:"Trades",value:"0",tone:C.text},
        {label:"Win Rate",value:fmtPct(0),tone:C.text},
      ],
    );
  }

  const leakItem=buildDashboardLeakItem(trades,dataset);
  const positiveCandidates=[];

  if(dataset.bestStrategy&&dataset.bestStrategy[1].n>=2&&dataset.bestStrategy[1].pnl>0){
    const [name,row]=dataset.bestStrategy;
    positiveCandidates.push({
      title:`${name} is paying you`,
      support:`Keep pressing it | ${fmtMoney(row.pnl)} across ${formatTradeCountLabel(row.n)}`,
      tone:C.green,
      score:row.pnl,
      metrics:[
        {label:"P&L",value:fmtMoney(row.pnl),tone:C.green},
        {label:"Win Rate",value:fmtPct(row.winRate),tone:row.winRate>=0.5?C.green:C.amber},
        {label:"Trades",value:String(row.n),tone:C.text},
      ],
    });
  }

  if(dataset.bestHour&&dataset.bestHour[1].n>=2&&dataset.bestHour[1].pnl>0){
    const [hour,row]=dataset.bestHour;
    positiveCandidates.push({
      title:`${formatHourLabel(hour)} is your sweet spot`,
      support:`Stay selective there | ${fmtMoney(row.pnl)} across ${formatTradeCountLabel(row.n)}`,
      tone:C.accent,
      score:row.pnl,
      metrics:[
        {label:"P&L",value:fmtMoney(row.pnl),tone:C.green},
        {label:"Avg/Trade",value:fmtMoney(row.avgPnl),tone:row.avgPnl>=0?C.green:C.red},
        {label:"Trades",value:String(row.n),tone:C.text},
      ],
    });
  }

  if(dataset.bestDisciplineSignal&&dataset.bestDisciplineSignal.n>=2&&dataset.bestDisciplineSignal.pnl>0){
    const row=dataset.bestDisciplineSignal;
    positiveCandidates.push({
      title:`${capitalizeInsightLabel(row.label)} is working`,
      support:`Keep that discipline | ${fmtMoney(row.pnl)} across ${formatTradeCountLabel(row.n)}`,
      tone:C.teal,
      score:row.pnl,
      metrics:[
        {label:"P&L",value:fmtMoney(row.pnl),tone:C.green},
        {label:"Avg/Trade",value:fmtMoney(row.avgPnl),tone:row.avgPnl>=0?C.green:C.red},
        {label:"Trades",value:String(row.n),tone:C.text},
      ],
    });
  }

  const bestPositiveSignal=[...positiveCandidates].sort((a,b)=>b.score-a.score)[0]||null;
  const strongPerformance=dataset.stats.totalPnl>0&&(dataset.stats.profitFactor>=1||dataset.stats.winRate>=0.5);
  const weakPerformance=dataset.stats.totalPnl<0&&dataset.stats.profitFactor<1;

  if(strongPerformance&&bestPositiveSignal){
    return makeInsight(bestPositiveSignal.title,bestPositiveSignal.support,bestPositiveSignal.tone,bestPositiveSignal.metrics);
  }

  if(strongPerformance){
    return makeInsight(
      "You are trading well right now",
      `Keep the same pace | ${fmtMoney(dataset.stats.totalPnl)} on ${formatTradeCountLabel(dataset.stats.loggedTrades)}`,
      C.green,
      [
        {label:"P&L",value:fmtMoney(dataset.stats.totalPnl),tone:C.green},
        {label:"Win Rate",value:fmtPct(dataset.stats.winRate),tone:dataset.stats.winRate>=0.5?C.green:C.amber},
        {label:"Trades",value:String(dataset.stats.loggedTrades),tone:C.text},
      ],
    );
  }

  if(weakPerformance&&leakItem){
    return makeInsight(
      `${leakItem.label} needs tightening`,
      `Fix this first | ${fmtMoney(leakItem.pnl)} across ${formatTradeCountLabel(leakItem.count)}`,
      C.red,
      [
        {label:"P&L",value:fmtMoney(leakItem.pnl),tone:C.red},
        {label:"Avg/Trade",value:fmtMoney(leakItem.avgPnl),tone:leakItem.avgPnl>=0?C.green:C.red},
        {label:"Trades",value:String(leakItem.count),tone:C.text},
      ],
    );
  }

  if(bestPositiveSignal&&leakItem){
    const positiveImpact=Math.abs(bestPositiveSignal.score);
    const leakImpact=Math.abs(leakItem.pnl);
    if(positiveImpact>=leakImpact){
      return makeInsight(
        bestPositiveSignal.title,
        `Best current pattern | ${bestPositiveSignal.support.split(" | ").pop()}`,
        bestPositiveSignal.tone,
        bestPositiveSignal.metrics,
      );
    }
    return makeInsight(
      `${leakItem.label} is capping the upside`,
      `Main drag right now | ${fmtMoney(leakItem.pnl)} across ${formatTradeCountLabel(leakItem.count)}`,
      C.amber,
      [
        {label:"P&L",value:fmtMoney(leakItem.pnl),tone:C.red},
        {label:"Avg/Trade",value:fmtMoney(leakItem.avgPnl),tone:leakItem.avgPnl>=0?C.green:C.red},
        {label:"Trades",value:String(leakItem.count),tone:C.text},
      ],
    );
  }

  if(bestPositiveSignal){
    return makeInsight(bestPositiveSignal.title,bestPositiveSignal.support,bestPositiveSignal.tone,bestPositiveSignal.metrics);
  }

  if(leakItem){
    return makeInsight(
      `${leakItem.label} is the main drag`,
      `Tighten this next | ${fmtMoney(leakItem.pnl)} across ${formatTradeCountLabel(leakItem.count)}`,
      C.amber,
      [
        {label:"P&L",value:fmtMoney(leakItem.pnl),tone:C.red},
        {label:"Avg/Trade",value:fmtMoney(leakItem.avgPnl),tone:leakItem.avgPnl>=0?C.green:C.red},
        {label:"Trades",value:String(leakItem.count),tone:C.text},
      ],
    );
  }

  return makeInsight(
    "No clear focus signal yet",
    `Stay selective | ${fmtMoney(dataset.stats.totalPnl)} on ${formatTradeCountLabel(dataset.stats.loggedTrades)}`,
    C.teal,
    [
      {label:"P&L",value:fmtMoney(dataset.stats.totalPnl),tone:dataset.stats.totalPnl>=0?C.green:C.red},
      {label:"Win Rate",value:fmtPct(dataset.stats.winRate),tone:dataset.stats.winRate>=0.5?C.green:C.amber},
      {label:"Trades",value:String(dataset.stats.loggedTrades),tone:C.text},
    ],
  );
}

function getDashboardToneStyles(tone){
  if(tone==="positive")return{color:C.green,background:`linear-gradient(180deg, rgba(34,197,94,0.14), ${C.surface})`,border:"rgba(34,197,94,0.18)"};
  if(tone==="negative")return{color:C.red,background:`linear-gradient(180deg, rgba(239,68,68,0.13), ${C.surface})`,border:"rgba(239,68,68,0.16)"};
  if(tone==="warning")return{color:C.amber,background:`linear-gradient(180deg, rgba(245,158,11,0.14), ${C.surface})`,border:"rgba(245,158,11,0.18)"};
  return{color:C.accentStrong,background:`linear-gradient(180deg, rgba(59,130,246,0.12), ${C.surface})`,border:"rgba(59,130,246,0.14)"};
}

function DashboardStatCard({label,value,sub,detail,icon="spark",tone="neutral",featured=false}){
  const palette=getDashboardToneStyles(tone);
  return<Card style={{
    padding:featured?"20px 20px 18px":"16px 16px 14px",
    minHeight:featured?170:144,
    background:palette.background,
    boxShadow:`${C.shadow}, inset 0 0 0 1px ${palette.border}`,
    display:"grid",
    gap:featured?16:12,
    alignContent:"space-between",
  }}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
      <div style={{display:"grid",gap:featured?8:6}}>
        <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800}}>{label}</div>
        <div style={{fontSize:featured?40:30,fontWeight:800,color:palette.color,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1.02}}>{value}</div>
      </div>
      <div style={{width:featured?46:40,height:featured?46:40,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",background:C.glass,boxShadow:`inset 0 0 0 1px ${palette.border}`}}>
        <Icon name={icon} size={featured?20:18} color={palette.color}/>
      </div>
    </div>
    <div style={{display:"grid",gap:6}}>
      {sub&&<div style={{fontSize:12,color:C.textSoft,fontWeight:700,lineHeight:1.5}}>{sub}</div>}
      {detail&&<div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>{detail}</div>}
    </div>
  </Card>;
}

function DailyReflectionCard({trades,reflections,aiReviews,onSave,onGenerateAiReview,saving=false,aiSaving=false}){
  const todayKey=dateToKey(new Date());
  const todayReflection=useMemo(()=>reflections.find(reflection=>reflection.date===todayKey)||null,[reflections,todayKey]);
  const [activeDate,setActiveDate]=useState(todayKey);
  const [expandedDate,setExpandedDate]=useState("");
  const emptyDraft={
    overall_summary:"",
    did_right:"",
    did_wrong:"",
    improve_tomorrow:"",
  };
  const [draft,setDraft]=useState({
    overall_summary:"",
    did_right:"",
    did_wrong:"",
    improve_tomorrow:"",
  });
  const skipHydrateRef=useRef(false);
  const [preserveEmptyTodayDraft,setPreserveEmptyTodayDraft]=useState(true);
  const history=useMemo(()=>sortReflectionsDescending(reflections),[reflections]);
  const activeReflection=useMemo(()=>reflections.find(reflection=>reflection.date===activeDate)||null,[reflections,activeDate]);
  const activeAiReview=useMemo(()=>aiReviews.find(review=>review.date===activeDate)||null,[aiReviews,activeDate]);
  const sameDayTrades=useMemo(()=>[...trades].filter(trade=>trade.date===activeDate).sort((a,b)=>getTradeDateTime(a)-getTradeDateTime(b)),[trades,activeDate]);
  const isEditingHistoryEntry=activeDate!==todayKey;

  useEffect(()=>{
    if(skipHydrateRef.current){
      skipHydrateRef.current=false;
      return;
    }
    if(activeDate===todayKey&&preserveEmptyTodayDraft){
      setDraft(emptyDraft);
      return;
    }
    setDraft(activeReflection?{
      overall_summary:activeReflection.overall_summary||"",
      did_right:activeReflection.did_right||"",
      did_wrong:activeReflection.did_wrong||"",
      improve_tomorrow:activeReflection.improve_tomorrow||"",
    }:emptyDraft);
  },[activeReflection,activeDate,todayKey,preserveEmptyTodayDraft]);

  const updateField=(key,value)=>{
    if(preserveEmptyTodayDraft)setPreserveEmptyTodayDraft(false);
    setDraft(current=>({...current,[key]:value}));
  };
  const hasTodayEntry=Boolean(todayReflection);
  const handleSave=async()=>{
    const saved=await onSave?.({date:activeDate,...draft});
    if(saved){
      skipHydrateRef.current=true;
      setPreserveEmptyTodayDraft(true);
      setDraft(emptyDraft);
      setActiveDate(todayKey);
    }
  };
  const savedTimestamp=activeReflection?.updated_at
    ?new Date(activeReflection.updated_at).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})
    :"";
  const fields=[
    {key:"overall_summary",label:"How was your trading day overall?",placeholder:"Summarize the session, emotional tone, and how well you followed your plan."},
    {key:"did_right",label:"What did you do right?",placeholder:"Capture the behaviors, decisions, or routines that helped you today."},
    {key:"did_wrong",label:"What did you do wrong?",placeholder:"Be specific about the mistakes, missed rules, or weak execution."},
    {key:"improve_tomorrow",label:"What will you do better tomorrow?",placeholder:"Write the one or two adjustments you want to carry into the next session."},
  ];
  const startEditingReflection=reflection=>{
    skipHydrateRef.current=true;
    setPreserveEmptyTodayDraft(false);
    setActiveDate(reflection.date);
    setDraft({
      overall_summary:reflection.overall_summary||"",
      did_right:reflection.did_right||"",
      did_wrong:reflection.did_wrong||"",
      improve_tomorrow:reflection.improve_tomorrow||"",
    });
  };
  const cancelEditing=()=>{
    skipHydrateRef.current=true;
    setPreserveEmptyTodayDraft(true);
    setActiveDate(todayKey);
    setDraft(emptyDraft);
  };
  const generateAiReview=()=>onGenerateAiReview?.({
    date:activeDate,
    reflection:{
      date:activeDate,
      ...draft,
    },
  });
  const aiSections=[
    {key:"ai_summary",label:"Overall Read on the Day"},
    {key:"strengths",label:"What Went Well"},
    {key:"weaknesses",label:"What Hurt My Performance"},
    {key:"tag_patterns",label:"Tag-Based Patterns"},
    {key:"behavior_patterns",label:"Trade Behavior Patterns"},
    {key:"tomorrow_focus",label:"Best Lesson for Tomorrow"},
  ];

  return<div style={{display:"grid",gap:14}}>
  <Card style={{padding:"20px",display:"grid",gap:18,background:`linear-gradient(180deg, ${C.surface}, ${C.surfaceAlt})`,boxShadow:`${C.shadow}, inset 0 0 0 1px rgba(148,163,184,0.10)`}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,flexWrap:"wrap"}}>
      <div style={{display:"grid",gap:8}}>
        <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800}}>Daily Trading Reflection</div>
        <div style={{fontSize:24,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1.15,letterSpacing:"-0.03em"}}>{isEditingHistoryEntry?"Edit Saved Reflection":"Today's Execution Review"}</div>
      </div>
      <div style={{display:"grid",gap:8,justifyItems:"end"}}>
        <Pill label={formatReflectionDate(activeDate)} color={isEditingHistoryEntry?C.amber:C.accent}/>
        {activeReflection&&<div style={{fontSize:12,color:C.muted}}>{activeDate===todayKey?"Saved for today":"Editing saved entry"}{savedTimestamp?` | Updated ${savedTimestamp}`:""}</div>}
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
      {fields.map(field=><div key={field.key} style={{display:"grid",gap:8}}>
        <div style={{fontSize:12,color:C.textSoft,fontWeight:800,lineHeight:1.5}}>{field.label}</div>
        <textarea
          value={draft[field.key]}
          onChange={event=>updateField(field.key,event.target.value)}
          placeholder={field.placeholder}
          style={inp({minHeight:116,padding:"14px 16px",resize:"vertical",lineHeight:1.7,background:C.surfaceSoft,fontFamily:"inherit"})}
        />
      </div>)}
    </div>

    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
      <div style={{fontSize:12,color:C.muted,lineHeight:1.65}}>{isEditingHistoryEntry?"You are editing a saved reflection from history. Saving will update that day's entry.":hasTodayEntry?"Today's saved reflection is stored below in history. The form clears after each save so you can start fresh.":"No reflection saved for today yet. Save one to start your daily execution record."}</div>
      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        {isEditingHistoryEntry&&<button
          type="button"
          onClick={cancelEditing}
          disabled={saving}
          style={{...btnBase(),padding:"11px 16px",borderRadius:999,background:C.surface}}
        >
          Cancel Edit
        </button>}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{...btnBase(),padding:"11px 16px",borderRadius:999,background:`linear-gradient(180deg, ${C.accent}, ${C.accentStrong})`,color:"#fff",boxShadow:"0 18px 30px rgba(59,130,246,0.22)",opacity:saving?0.7:1}}
        >
          {saving?"Saving...":isEditingHistoryEntry?"Update Reflection":"Save Reflection"}
        </button>
      </div>
    </div>

    <div style={{height:1,background:C.border,opacity:0.75}}/>

    <div style={{display:"grid",gap:12}}>
      <div>
        <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:6}}>Previous Reflections</div>
        <div style={{fontSize:13,color:C.muted,lineHeight:1.65}}>Saved in reverse chronological order. Open any day to review the exact notes you wrote.</div>
      </div>

      {history.length===0
        ?<div style={{padding:"16px 18px",borderRadius:18,background:C.surfaceSoft,boxShadow:"inset 0 0 0 1px rgba(148,163,184,0.10)",fontSize:13,color:C.muted,lineHeight:1.7}}>
          No daily reflections saved yet.
        </div>
        :<div style={{display:"grid",gap:10}}>
          {history.map(reflection=>{
            const expanded=expandedDate===reflection.date;
            return<div key={reflection.id} style={{borderRadius:18,background:C.surfaceSoft,boxShadow:"inset 0 0 0 1px rgba(148,163,184,0.10)",overflow:"hidden"}}>
              <button
                type="button"
                onClick={()=>setExpandedDate(current=>current===reflection.date?"":reflection.date)}
                style={{...btnBase(),width:"100%",padding:"15px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,textAlign:"left",background:"transparent",borderRadius:0}}
              >
                <div style={{display:"grid",gap:5}}>
                  <div style={{fontSize:14,fontWeight:800,color:C.text}}>{formatReflectionDate(reflection.date)}</div>
                  <div style={{fontSize:12,color:C.muted,lineHeight:1.55}}>{clipText(reflection.overall_summary||reflection.did_wrong||reflection.did_right||reflection.improve_tomorrow||"No text saved for this day yet.",96)}</div>
                </div>
                <div style={{fontSize:12,color:expanded?C.accent:C.muted,fontWeight:800,whiteSpace:"nowrap"}}>{expanded?"Hide":"Open"}</div>
              </button>
              {expanded&&<div style={{padding:"0 16px 16px",display:"grid",gap:10}}>
                <div style={{display:"flex",justifyContent:"flex-end"}}>
                  <button
                    type="button"
                    onClick={()=>startEditingReflection(reflection)}
                    style={{...btnBase(),padding:"9px 14px",borderRadius:999,background:C.surface,color:C.accent,fontWeight:800}}
                  >
                    Edit
                  </button>
                </div>
                {fields.map(field=><div key={`${reflection.id}-${field.key}`} style={{padding:"12px 13px",borderRadius:14,background:C.surface,boxShadow:"inset 0 0 0 1px rgba(148,163,184,0.08)"}}>
                  <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:800,marginBottom:6}}>{field.label}</div>
                  <div style={{fontSize:13,color:C.textSoft,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{reflection[field.key]||"No entry."}</div>
                </div>)}
              </div>}
            </div>;
          })}
        </div>}
    </div>
  </Card>

  <Card style={{padding:"20px",display:"grid",gap:18,background:`linear-gradient(180deg, ${C.surface}, ${C.surfaceAlt})`,boxShadow:`${C.shadow}, inset 0 0 0 1px rgba(148,163,184,0.10)`}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,flexWrap:"wrap"}}>
      <div style={{display:"grid",gap:8}}>
        <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800}}>AI Daily Review</div>
        <div style={{fontSize:24,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1.15,letterSpacing:"-0.03em"}}>AI Execution Insight</div>
        <div style={{fontSize:13,color:C.muted,lineHeight:1.7,maxWidth:780}}>This review combines your written reflection with the same day&apos;s trades, tags, notes, and results to surface what actually helped and hurt your execution.</div>
      </div>
      <div style={{display:"grid",gap:8,justifyItems:"end"}}>
        <Pill label={formatReflectionDate(activeDate)} color={C.teal}/>
        <div style={{fontSize:12,color:C.muted}}>{sameDayTrades.length} trade{sameDayTrades.length!==1?"s":""} on this day{activeAiReview?.updated_at?` | Updated ${new Date(activeAiReview.updated_at).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}`:""}</div>
      </div>
    </div>

    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
      <div style={{fontSize:12,color:C.muted,lineHeight:1.7}}>
        {activeAiReview
          ?"The saved AI review below is tied to this date and can be regenerated after you update the reflection or the trade log."
          :"Generate an AI review to compare your written reflection against the actual trade behavior from the same day."}
      </div>
      <button
        type="button"
        onClick={generateAiReview}
        disabled={aiSaving||(!sameDayTrades.length&&!Object.values(draft).some(Boolean))}
        style={{...btnBase(),padding:"11px 16px",borderRadius:999,background:`linear-gradient(180deg, ${C.teal}, #0f9f95)`,color:"#fff",boxShadow:"0 18px 30px rgba(20,184,166,0.20)",opacity:aiSaving||(!sameDayTrades.length&&!Object.values(draft).some(Boolean))?0.7:1}}
      >
        {aiSaving?"Generating...":activeAiReview?"Regenerate Review":"Generate AI Review"}
      </button>
    </div>

    {!activeAiReview
      ?<div style={{padding:"16px 18px",borderRadius:18,background:C.surfaceSoft,boxShadow:"inset 0 0 0 1px rgba(148,163,184,0.10)",fontSize:13,color:C.muted,lineHeight:1.7}}>
        No AI review saved for this day yet.
      </div>
      :<div style={{display:"grid",gap:10}}>
        {aiSections.map(section=><div key={`${activeAiReview.id}-${section.key}`} style={{padding:"14px 15px",borderRadius:16,background:C.surfaceSoft,boxShadow:"inset 0 0 0 1px rgba(148,163,184,0.10)"}}>
          <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:800,marginBottom:7}}>{section.label}</div>
          <div style={{fontSize:13,color:C.textSoft,lineHeight:1.75,whiteSpace:"pre-wrap"}}>{activeAiReview[section.key]||"No summary yet."}</div>
        </div>)}
      </div>}
  </Card>
  </div>;
}

function DashboardWorkbenchView({trades,reflections,aiReviews,onSaveReflection,onGenerateAiReview,reflectionSaving,aiReviewSaving}){
  const[range,setRange]=useState("ALL");
  const {
    chronologicalTrades,
    recentTrades,
    stats,
    focusInsight,
    leakItem,
    latestSessionStats,
    latestSessionLabel,
    leakLabel,
    compactInsight,
    metricCards,
  }=useMemo(()=>{
    const scopedTrades=filterDashboardTrades(trades,range);
    const chronological=[...scopedTrades].sort((a,b)=>getTradeDateTime(a)-getTradeDateTime(b));
    const recent=[...scopedTrades].sort((a,b)=>getTradeDateTime(b)-getTradeDateTime(a)).slice(0,6);
    const nextStats=calcStats(chronological);
    const coachDataset=buildCoachDataset(chronological);
    const nextFocusInsight=buildDashboardFocusInsight(chronological,coachDataset);
    const nextLeakItem=buildDashboardLeakItem(chronological,coachDataset);
    const pf=nextStats.profitFactor;
    const latestSessionDate=recent[0]?.date||"";
    const latestSessionTrades=latestSessionDate?chronological.filter(trade=>trade.date===latestSessionDate):[];
    const nextLatestSessionStats=calcStats(latestSessionTrades);
    const nextLatestSessionLabel=latestSessionDate
      ?parseDateOnly(latestSessionDate)?.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})||latestSessionDate
      :"No session";
    const avgLossSeverity=nextStats.avgLoss&&nextStats.avgWin?nextStats.avgLoss/nextStats.avgWin:0;
    const drawdownPressure=Math.abs(nextStats.totalPnl)>0?nextStats.maxDD/Math.max(Math.abs(nextStats.totalPnl),1):nextStats.maxDD;
    return{
      chronologicalTrades:chronological,
      recentTrades:recent,
      stats:nextStats,
      focusInsight:nextFocusInsight,
      leakItem:nextLeakItem,
      latestSessionStats:nextLatestSessionStats,
      latestSessionLabel:nextLatestSessionLabel,
      leakLabel:nextLeakItem?.label||"None",
      compactInsight:clipText(nextFocusInsight.title,84),
      metricCards:[
        {label:"P&L",value:fmtMoney(nextStats.totalPnl),tone:nextStats.totalPnl>=0?"positive":"negative",sub:`${nextStats.loggedTrades} trades`},
        {label:"Win Rate",value:fmtPct(nextStats.winRate),tone:nextStats.winRate>=0.52?"positive":nextStats.winRate>=0.45?"warning":"negative",sub:`${nextStats.wins}W / ${nextStats.losses}L`},
        {label:"Profit Factor",value:pf>=999?"INF":pf.toFixed(2),tone:pf>=1.5?"positive":pf>=1?"warning":"negative",sub:pf>=1.5?"Strong edge":pf>=1?"Flat edge":"Weak edge"},
        {label:"Avg Win",value:`+$${nextStats.avgWin.toFixed(0)}`,tone:nextStats.avgWin>nextStats.avgLoss?"positive":"warning",sub:"Winning trade"},
        {label:"Avg Loss",value:`-$${nextStats.avgLoss.toFixed(0)}`,tone:avgLossSeverity>1?"negative":"warning",sub:"Losing trade"},
        {label:"Max DD",value:`-$${nextStats.maxDD.toFixed(0)}`,tone:drawdownPressure>1.15?"negative":drawdownPressure>0.65?"warning":"positive",sub:"Peak pullback"},
      ],
    };
  },[trades,range,ACTIVE_THEME]);

  if(!trades.length)return<div style={{display:"grid",gap:14,animation:"riseIn .45s ease both"}}>
    <DailyReflectionCard trades={trades} reflections={reflections} aiReviews={aiReviews} onSave={onSaveReflection} onGenerateAiReview={onGenerateAiReview} saving={reflectionSaving} aiSaving={aiReviewSaving}/>
    <EmptyState icon="chart" title="Start your first review cycle" message="Log a trade to unlock your command center, core metrics, and recent execution context."/>
  </div>;

  return<div style={{display:"grid",gap:14,animation:"riseIn .45s ease both"}}>
    <Card accent={C.accent} style={{padding:"14px 12px",background:C.heroPanel,boxShadow:C.shadowMd}}>
      <div style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
          {DASHBOARD_RANGE_OPTIONS.map(option=>{
            const active=range===option.key;
            return<button
              key={option.key}
              type="button"
              onClick={()=>startTransition(()=>setRange(option.key))}
              style={{
                ...btnBase(),
                padding:"9px 12px",
                borderRadius:999,
                background:active?`linear-gradient(180deg, ${C.accent}, ${C.accentStrong})`:C.surfaceAlt,
                color:active?"#fff":C.textSoft,
                boxShadow:active?"0 14px 28px rgba(59,130,246,0.16)":"inset 0 0 0 1px rgba(148,163,184,0.10)",
                fontSize:12,
                fontWeight:800,
              }}
            >
              {option.label}
            </button>;
          })}
        </div>
      </div>
    </Card>

    {chronologicalTrades.length===0&&<EmptyState icon="filter" title="No trades in this date range" message="Change the dashboard filter to load a wider review window and restore your command center metrics and recent trades."/>}

    {chronologicalTrades.length>0&&<>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:12}}>
        {metricCards.map(card=>{
          const palette=getDashboardToneStyles(card.tone);
          return<div key={card.label} style={{
            padding:"16px 16px 14px",
            borderRadius:18,
            background:palette.background,
            boxShadow:`${C.shadow}, inset 0 0 0 1px ${palette.border}`,
            display:"grid",
            gap:10,
            minHeight:128,
            alignContent:"space-between",
          }}>
            <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800}}>{card.label}</div>
            <div style={{fontSize:34,fontWeight:800,color:palette.color,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1.02,letterSpacing:"-0.03em"}}>{card.value}</div>
            <div style={{fontSize:12,color:C.textSoft,fontWeight:700}}>{card.sub}</div>
          </div>;
        })}
      </div>

      <Card style={{
        padding:"18px",
        display:"grid",
        gap:14,
        background:`linear-gradient(180deg, ${focusInsight.tone}08, ${C.surface})`,
        boxShadow:`${C.shadow}, inset 0 0 0 1px rgba(148,163,184,0.10)`,
      }}>
        <div>
          <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:8}}>{focusInsight.eyebrow}</div>
          <div style={{fontSize:26,fontWeight:800,color:focusInsight.tone,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1.08,letterSpacing:"-0.03em",marginBottom:8}}>{compactInsight}</div>
          <div style={{fontSize:13,color:C.textSoft,lineHeight:1.65,maxWidth:760}}>{focusInsight.support}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10}}>
          {focusInsight.metrics.map(metric=><div key={metric.label} style={{padding:"12px 13px",borderRadius:14,background:C.surfaceSoft,boxShadow:"inset 0 0 0 1px rgba(148,163,184,0.10)"}}>
            <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:800,marginBottom:5}}>{metric.label}</div>
            <div style={{fontSize:22,fontWeight:800,color:metric.tone||C.text,fontFamily:"'Sora','Manrope',sans-serif",letterSpacing:"-0.02em"}}>{metric.value}</div>
          </div>)}
        </div>
      </Card>

      <DailyReflectionCard trades={trades} reflections={reflections} aiReviews={aiReviews} onSave={onSaveReflection} onGenerateAiReview={onGenerateAiReview} saving={reflectionSaving} aiSaving={aiReviewSaving}/>

      <Card style={{padding:"18px",display:"grid",gap:14}}>
          <div>
            <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:6}}>Recent Trades</div>
            <div style={{fontSize:22,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",marginBottom:4}}>Execution Preview</div>
            <div style={{fontSize:13,color:C.muted,lineHeight:1.65}}>Ticker, P&amp;L and ROI in one scan.</div>
          </div>

          <div style={{display:"grid",gap:10}}>
            {recentTrades.map(trade=>{
              const pnl=calcPnl(trade);
              const entryNotional=calcEntryNotional(trade);
              const roi=entryNotional?pnl/entryNotional:null;
              const entryTime=trade.entries?.[0]?.time?formatTime12h(trade.entries[0].time):"Time N/A";
              return<div key={trade.id} style={{padding:"13px 14px",borderRadius:16,background:C.surfaceSoft,display:"grid",gap:10}}>
                <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.35fr) minmax(100px,auto) minmax(96px,auto) minmax(110px,auto)",gap:14,alignItems:"center"}}>
                  <div style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{trade.symbol} {getDirectionLabel(trade.direction)}</div>
                  <div style={{fontSize:15,fontWeight:800,color:pnl>=0?C.green:C.red,fontFamily:"'Sora','Manrope',sans-serif",textAlign:"right"}}>{fmtMoney(pnl)}</div>
                  <div style={{fontSize:12,fontWeight:800,color:roi!==null&&roi>=0?C.green:C.red,textAlign:"right"}}>{roi===null?"ROI N/A":fmtPct(roi)}</div>
                  <div style={{fontSize:12,fontWeight:800,color:C.textSoft,textAlign:"right",whiteSpace:"nowrap"}}>{entryTime}</div>
                </div>
                <div style={{fontSize:11,color:C.muted}}>{trade.date}</div>
              </div>;
            })}
          </div>
        </Card>

      <Card style={{padding:"22px 22px 24px"}}>
        <AnalyticsCalendar trades={trades}/>
      </Card>
    </>}
  </div>;
}
function dateToKey(date){
  return`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function calcEntryNotional(trade){
  return trade.entries.reduce((sum,entry)=>sum+((+entry.price||0)*(+entry.qty||0)),0);
}

function calcExitNotional(trade){
  return trade.exits.reduce((sum,exit)=>sum+((+exit.price||0)*(+exit.qty||0)),0);
}

function buildDirectionalRows(trades){
  const pnls=trades.map(calcPnl);
  const byDirection={LONG:{pnl:0,w:0,n:0},SHORT:{pnl:0,w:0,n:0}};

  trades.forEach((trade,index)=>{
    const pnl=pnls[index];
    const outcome=getTradeOutcome(trade);
    byDirection[trade.direction].pnl+=pnl;
    if(outcome==="WIN"||outcome==="LOSS")byDirection[trade.direction].n++;
    if(outcome==="WIN")byDirection[trade.direction].w++;
  });

  return["LONG","SHORT"].map(direction=>({
    direction,
    ...byDirection[direction],
    rate:byDirection[direction].n?byDirection[direction].w/byDirection[direction].n:0,
  }));
}

const WEEKDAY_PERFORMANCE_CONFIG=[
  {key:1,day:"Monday",short:"Mon"},
  {key:2,day:"Tuesday",short:"Tue"},
  {key:3,day:"Wednesday",short:"Wed"},
  {key:4,day:"Thursday",short:"Thu"},
  {key:5,day:"Friday",short:"Fri"},
];

function buildWeekdayAnalysis(trades){
  const rows=WEEKDAY_PERFORMANCE_CONFIG.map(item=>({...item,totalPnl:0,trades:0,wins:0,winRate:0}));

  trades.forEach(trade=>{
    const date=parseDateOnly(trade.date);
    if(!date)return;
    const row=rows.find(item=>item.key===date.getDay());
    if(!row)return;

    const pnl=calcPnl(trade);
    const outcome=getTradeOutcome(trade);
    row.totalPnl+=pnl;
    if(outcome==="WIN"||outcome==="LOSS"){
      row.trades++;
      if(outcome==="WIN")row.wins++;
    }
  });

  rows.forEach(row=>{
    row.winRate=row.trades?row.wins/row.trades:0;
  });

  const ranked=[...rows].sort((a,b)=>b.totalPnl-a.totalPnl||a.key-b.key);
  const best=ranked[0];
  const worst=ranked[ranked.length-1];
  const breakdown=rows.map(row=>`${row.short}: ${fmtMoney(row.totalPnl)} (${fmtPct(row.winRate)}, ${row.trades} trades)`).join("\n");
  const insight=worst.totalPnl<0
    ?`You consistently lose money on ${worst.day}s.`
    :`Your strongest consistency shows up on ${best.day}s.`;

  return{
    rows,
    best,
    worst,
    text:`Best Day: ${best.day} (${fmtMoney(best.totalPnl)}, ${fmtPct(best.winRate)})\nWorst Day: ${worst.day} (${fmtMoney(worst.totalPnl)}, ${fmtPct(worst.winRate)})\n\nBreakdown:\n${breakdown}\n\nInsight:\n${insight}`,
  };
}

function buildCalendarSummary(trades){
  const byDate={};
  trades.forEach(trade=>{
    const calendarDate=getTradeExitDateKey(trade);
    if(!calendarDate)return;
    const pnl=calcPnl(trade);
    const outcome=getTradeOutcome(trade);
    const basis=calcEntryNotional(trade);
    if(!byDate[calendarDate])byDate[calendarDate]={pnl:0,basis:0,trades:0,wins:0,losses:0};
    byDate[calendarDate].pnl+=pnl;
    byDate[calendarDate].basis+=basis;
    byDate[calendarDate].trades++;
    if(outcome==="WIN")byDate[calendarDate].wins++;
    if(outcome==="LOSS")byDate[calendarDate].losses++;
  });
  return byDate;
}

function formatTradingDayLabel(dateKey){
  const date=parseDateOnly(dateKey);
  if(!date)return dateKey;
  return date.toLocaleDateString("en-US",{month:"short",day:"numeric"});
}

function buildBestWorstTradingDays(trades,limitPerSide=4){
  const dailySummary=Object.entries(buildCalendarSummary(trades)).map(([date,summary])=>({
    date,
    pnl:summary.pnl,
    trades:summary.trades,
  }));

  if(!dailySummary.length)return[];

  const best=[...dailySummary]
    .filter(day=>day.pnl>0)
    .sort((a,b)=>b.pnl-a.pnl||a.date.localeCompare(b.date))
    .slice(0,limitPerSide);

  const usedDates=new Set(best.map(day=>day.date));
  const worst=[...dailySummary]
    .filter(day=>day.pnl<0&&!usedDates.has(day.date))
    .sort((a,b)=>a.pnl-b.pnl||a.date.localeCompare(b.date))
    .slice(0,limitPerSide);

  return[...worst,...best];
}

function AnalyticsCalendar({trades}){
  const tradeDates=trades.map(trade=>parseDateOnly(getTradeExitDateKey(trade))).filter(Boolean).sort((a,b)=>a-b);
  const latestDate=tradeDates.length?tradeDates[tradeDates.length-1]:startOfDay(new Date());
  const [selectedMonth,setSelectedMonth]=useState(latestDate.getMonth());
  const [selectedYear,setSelectedYear]=useState(latestDate.getFullYear());
  const [selectedDayKey,setSelectedDayKey]=useState("");
  const calendarRef=useRef(null);
  const dailySummary=buildCalendarSummary(trades);
  const tradesByDate=trades.reduce((groups,trade)=>{
    const calendarDate=getTradeExitDateKey(trade);
    if(!calendarDate)return groups;
    if(!groups[calendarDate])groups[calendarDate]=[];
    groups[calendarDate].push(trade);
    return groups;
  },{});
  const displayMoney=value=>`${value<0?"-":""}$${Math.abs(value).toFixed(2)}`;
  const averagePrice=rows=>{
    const totalQty=rows.reduce((sum,row)=>sum+(+row.qty||0),0);
    if(!totalQty)return null;
    return rows.reduce((sum,row)=>sum+((+row.price||0)*(+row.qty||0)),0)/totalQty;
  };
  const monthStart=new Date(selectedYear,selectedMonth,1);
  const monthEnd=new Date(selectedYear,selectedMonth+1,0);
  const gridStart=addDays(startOfDay(monthStart),-monthStart.getDay());
  const gridEnd=addDays(startOfDay(monthEnd),6-monthEnd.getDay());
  const years=Array.from({length:Math.max(1,(tradeDates.length?tradeDates[tradeDates.length-1].getFullYear():selectedYear)-(tradeDates.length?tradeDates[0].getFullYear():selectedYear)+1)},(_,index)=>{
    const maxYear=tradeDates.length?tradeDates[tradeDates.length-1].getFullYear():selectedYear;
    return maxYear-index;
  });
  const weekdayLabels=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const monthOptions=Array.from({length:12},(_,index)=>new Date(2026,index,1).toLocaleString("en-US",{month:"long"}));
  const weeks=[];
  const selectedDayTrades=selectedDayKey
    ?[...(tradesByDate[selectedDayKey]||[])].sort((a,b)=>getTradeExitDateTime(b)-getTradeExitDateTime(a))
    :[];
  const selectedDayDate=selectedDayKey?parseDateOnly(selectedDayKey):null;
  const selectedDaySummary=selectedDayKey?dailySummary[selectedDayKey]||null:null;
  const selectedDayWins=selectedDayTrades.filter(trade=>getTradeOutcome(trade)==="WIN").length;
  const selectedDayLosses=selectedDayTrades.filter(trade=>getTradeOutcome(trade)==="LOSS").length;
  const selectedDayWashes=selectedDayTrades.filter(trade=>getTradeOutcome(trade)==="WASH").length;
  const selectedDayHoldValues=selectedDayTrades.map(calcDur).filter(value=>value!==null);
  const selectedDayAvgHold=selectedDayHoldValues.length?avg(selectedDayHoldValues):null;
  const selectedDayEntryTotals=selectedDayTrades.map(calcEntryNotional);
  const selectedDayExitTotals=selectedDayTrades.map(calcExitNotional);
  const selectedDayCapitalRotated=selectedDayEntryTotals.reduce((sum,value)=>sum+value,0);
  const selectedDayAvgEntrySpend=selectedDayEntryTotals.length?avg(selectedDayEntryTotals):0;
  const selectedDayAvgExitValue=selectedDayExitTotals.length?avg(selectedDayExitTotals):0;
  const closeSelectedDayReview=()=>{
    setSelectedDayKey("");
    if(typeof window!=="undefined"){
      requestAnimationFrame(()=>{
        calendarRef.current?.scrollIntoView({behavior:"auto",block:"start"});
      });
    }
  };

  useEffect(()=>{
    if(!selectedDayKey)return;
    const selectedDate=parseDateOnly(selectedDayKey);
    const stillVisible=selectedDate
      && selectedDate.getMonth()===selectedMonth
      && selectedDate.getFullYear()===selectedYear
      && (tradesByDate[selectedDayKey]?.length||0)>0;
    if(!stillVisible)setSelectedDayKey("");
  },[selectedDayKey,selectedMonth,selectedYear,trades]);

  useEffect(()=>{
    if(!selectedDayKey||typeof document==="undefined")return;
    const prevBodyOverflow=document.body.style.overflow;
    const prevHtmlOverflow=document.documentElement.style.overflow;
    document.body.style.overflow="hidden";
    document.documentElement.style.overflow="hidden";
    return()=>{
      document.body.style.overflow=prevBodyOverflow;
      document.documentElement.style.overflow=prevHtmlOverflow;
    };
  },[selectedDayKey]);

  useEffect(()=>{
    if(!selectedDayKey||typeof window==="undefined")return;
    const handleKeyDown=event=>{
      if(event.key==="Escape")closeSelectedDayReview();
    };
    window.addEventListener("keydown",handleKeyDown);
    return()=>window.removeEventListener("keydown",handleKeyDown);
  },[selectedDayKey,closeSelectedDayReview]);

  useEffect(()=>{
    if(!selectedDayKey||typeof window==="undefined")return;
    window.scrollTo({top:0,left:0,behavior:"auto"});
  },[selectedDayKey]);

  for(let cursor=new Date(gridStart);cursor<=gridEnd;cursor=addDays(cursor,7)){
    const days=Array.from({length:7},(_,index)=>{
      const date=addDays(cursor,index);
      const key=dateToKey(date);
      const summary=dailySummary[key]||{pnl:0,basis:0,trades:0,wins:0,losses:0};
      return{date,key,summary,inMonth:date.getMonth()===selectedMonth};
    });
    const monthDays=days.filter(day=>day.inMonth);
    const pnl=monthDays.reduce((sum,day)=>sum+day.summary.pnl,0);
    const basis=monthDays.reduce((sum,day)=>sum+day.summary.basis,0);
    const tradesTaken=monthDays.reduce((sum,day)=>sum+day.summary.trades,0);
    const wins=monthDays.reduce((sum,day)=>sum+day.summary.wins,0);
    const losses=monthDays.reduce((sum,day)=>sum+day.summary.losses,0);
    weeks.push({
      start:days[0].key,
      days,
      pnl,
      pct:basis?pnl/basis:null,
      tradesTaken,
      wins,
      losses,
    });
  }
  const monthSummary=weeks.reduce((summary,week)=>({
    pnl:summary.pnl+week.pnl,
    basis:summary.basis+week.days.filter(day=>day.inMonth).reduce((sum,day)=>sum+day.summary.basis,0),
    trades:summary.trades+week.tradesTaken,
    wins:summary.wins+week.wins,
    losses:summary.losses+week.losses,
  }),{pnl:0,basis:0,trades:0,wins:0,losses:0});
  const monthReturn=monthSummary.basis?monthSummary.pnl/monthSummary.basis:null;
  const monthPnlColor=monthSummary.pnl>0?C.green:monthSummary.pnl<0?C.red:C.text;

  return<div ref={calendarRef} style={{display:"grid",gap:16}}>
    <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}>
      <div>
        <SLabel>Monthly P&amp;L Calendar</SLabel>
        <div style={{fontSize:14,color:C.muted,lineHeight:1.7}}>Review daily outcomes across the selected month and monitor how each trading week closed.</div>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <select value={selectedMonth} onChange={e=>setSelectedMonth(Number(e.target.value))} style={{...inp(),width:"auto",minWidth:160,height:44,padding:"0 14px"}}>
          {monthOptions.map((label,index)=><option key={label} value={index}>{label}</option>)}
        </select>
        <select value={selectedYear} onChange={e=>setSelectedYear(Number(e.target.value))} style={{...inp(),width:"auto",minWidth:120,height:44,padding:"0 14px"}}>
          {years.map(year=><option key={year} value={year}>{year}</option>)}
        </select>
        <div style={{minWidth:190,padding:"9px 14px",borderRadius:16,background:C.surfaceAlt,boxShadow:C.shadow,display:"grid",gap:3}}>
          <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800}}>Monthly P&amp;L</div>
          <div style={{fontSize:24,fontWeight:900,color:monthPnlColor,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1}}>{displayMoney(monthSummary.pnl)}</div>
          <div style={{fontSize:12,color:C.muted}}>
            {monthSummary.trades} trade{monthSummary.trades!==1?"s":""}{monthReturn!==null?` / ${fmtPct(monthReturn)}`:""}
          </div>
        </div>
      </div>
    </div>

    <div style={{overflowX:"auto"}}>
      <div style={{minWidth:1100,display:"grid",gap:10}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(120px,1fr)) 170px",gap:10,alignItems:"center"}}>
          {weekdayLabels.map(label=><div key={label} style={{padding:"0 10px",fontSize:13,color:C.muted,fontWeight:700,textAlign:"center"}}>{label}</div>)}
          <div style={{padding:"0 10px",fontSize:13,color:C.muted,fontWeight:700,textAlign:"center"}}>Weekly Summary</div>
        </div>

        {weeks.map(week=><div key={week.start} style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(120px,1fr)) 170px",gap:10,alignItems:"stretch"}}>
          {week.days.map(day=>{
            if(!day.inMonth)return<div key={day.key} style={{minHeight:120}}/>;
            const hasTrades=day.summary.trades>0;
            const tone=day.summary.pnl>0?C.green:day.summary.pnl<0?C.red:C.text;
            const background=hasTrades
              ?day.summary.pnl>0?"linear-gradient(180deg, rgba(34,197,94,0.16), rgba(34,197,94,0.08))"
              :day.summary.pnl<0?"linear-gradient(180deg, rgba(239,68,68,0.14), rgba(239,68,68,0.07))"
              :C.surface
              :C.surface;
            const dayBody=<>
              <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:700,color:C.text}}>{day.date.getDate()}</span>
                {hasTrades&&<span style={{fontSize:11,color:C.muted}}>{day.summary.trades} trade{day.summary.trades!==1?"s":""}</span>}
              </div>
              {hasTrades?<div>
                <div style={{fontSize:22,fontWeight:800,color:tone,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1.05,marginBottom:6}}>{displayMoney(day.summary.pnl)}</div>
                <div style={{fontSize:12,color:C.muted}}>
                  {day.summary.basis?fmtPct(day.summary.pnl/day.summary.basis):"No return %"}
                </div>
                <div style={{fontSize:11,color:C.muted,marginTop:7,fontWeight:700}}>Click to review</div>
              </div>:<div style={{fontSize:12,color:C.dim}}>No trades</div>}
            </>;

            if(hasTrades)return<button
              key={day.key}
              type="button"
              onClick={()=>{
                if(typeof window!=="undefined")window.scrollTo({top:0,left:0,behavior:"auto"});
                setSelectedDayKey(day.key);
              }}
              style={{
                ...btnBase(),
                minHeight:120,
                borderRadius:18,
                padding:"14px 14px 12px",
                background,
                boxShadow:selectedDayKey===day.key?`${C.shadowMd}, inset 0 0 0 1px rgba(59,130,246,0.16)` : C.shadow,
                display:"flex",
                flexDirection:"column",
                justifyContent:"space-between",
                textAlign:"left",
                transform:selectedDayKey===day.key?"translateY(-2px)":"translateY(0)",
              }}
            >
              {dayBody}
            </button>;

            return<div key={day.key} style={{minHeight:120,borderRadius:18,padding:"14px 14px 12px",background,boxShadow:C.shadow,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
              {dayBody}
            </div>;
          })}

          <div style={{borderRadius:18,padding:"16px 14px",background:`linear-gradient(180deg, ${C.surface}, ${C.surfaceAlt})`,boxShadow:C.shadow,display:"flex",flexDirection:"column",justifyContent:"center",gap:8}}>
            <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800}}>Weekly Summary</div>
            <div style={{fontSize:24,fontWeight:800,color:week.pnl>=0?C.green:C.red,fontFamily:"'Sora','Manrope',sans-serif"}}>{displayMoney(week.pnl)}</div>
            <div style={{fontSize:13,color:week.pct===null?C.dim:week.pct>=0?C.green:C.red,fontWeight:700}}>
              {week.pct===null?"No return %":fmtPct(week.pct)}
            </div>
            <div style={{fontSize:12,color:C.muted}}>{week.tradesTaken} trade{week.tradesTaken!==1?"s":""} in this week</div>
            <div style={{fontSize:12,color:C.muted}}>
              <span style={{color:C.green,fontWeight:800}}>{week.wins}</span> wins / <span style={{color:C.red,fontWeight:800}}>{week.losses}</span> losses
            </div>
          </div>
        </div>)}
      </div>
    </div>

    {selectedDayTrades.length>0&&selectedDayDate&&selectedDaySummary&&typeof document!=="undefined"&&createPortal(<div
      onClick={closeSelectedDayReview}
      style={{position:"fixed",inset:0,zIndex:120,background:"rgba(15,23,42,0.24)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}
    >
      <div
        onClick={event=>event.stopPropagation()}
        style={{width:"min(980px, 100%)",height:"min(86vh, 920px)",background:C.surface,borderRadius:24,boxShadow:C.shadowLg,display:"grid",gridTemplateRows:"auto auto minmax(0,1fr)",overflow:"hidden"}}
      >
        <div style={{padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:18,flexWrap:"wrap",borderBottom:`1px solid ${C.border}`,background:`linear-gradient(180deg, ${C.surface}, ${C.surfaceAlt})`}}>
          <div>
            <div style={{fontSize:12,color:C.accent,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:6}}>Trading Day Review</div>
            <div style={{fontSize:26,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif"}}>
              {selectedDayDate.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
            </div>
          </div>
          <button type="button" onClick={closeSelectedDayReview} style={{...btnBase(),padding:"10px 14px",fontWeight:800}}>Close</button>
        </div>

        <div style={{padding:"18px 22px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,borderBottom:`1px solid ${C.border}`,background:C.surfaceAlt}}>
          <div style={{padding:"14px 16px",borderRadius:18,background:C.surface,boxShadow:C.shadow}}>
            <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:6}}>Net P&amp;L</div>
            <div style={{fontSize:28,fontWeight:800,color:selectedDaySummary.pnl>=0?C.green:C.red,fontFamily:"'Sora','Manrope',sans-serif"}}>{displayMoney(selectedDaySummary.pnl)}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:5}}>{selectedDaySummary.basis?fmtPct(selectedDaySummary.pnl/selectedDaySummary.basis):"No return %"}</div>
          </div>
          <div style={{padding:"14px 16px",borderRadius:18,background:C.surface,boxShadow:C.shadow}}>
            <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:6}}>Trades Logged</div>
            <div style={{fontSize:28,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif"}}>{selectedDayTrades.length}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:5}}>{selectedDayWins} wins / {selectedDayLosses} losses{selectedDayWashes?` / ${selectedDayWashes} wash`:``}</div>
          </div>
          <div style={{padding:"14px 16px",borderRadius:18,background:C.surface,boxShadow:C.shadow}}>
            <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:6}}>Average Hold</div>
            <div style={{fontSize:28,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif"}}>{selectedDayAvgHold===null?"N/A":fmtDuration(selectedDayAvgHold)}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:5}}>Measured from first entry to final exit.</div>
          </div>
          <div style={{padding:"14px 16px",borderRadius:18,background:C.surface,boxShadow:C.shadow}}>
            <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:6}}>Amount Risked Today</div>
            <div style={{fontSize:28,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif"}}>{displayMoney(selectedDayAvgEntrySpend)}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:5}}>
              Amount risked {displayMoney(selectedDayAvgEntrySpend)} per trade / Avg exit {displayMoney(selectedDayAvgExitValue)} per trade.
            </div>
          </div>
        </div>

        <div style={{padding:"18px 22px 22px",overflowY:"auto",minHeight:0,display:"grid",alignContent:"start",gap:14}}>
          {selectedDayTrades.map(trade=>{
            const pnl=calcPnl(trade);
            const entryNotional=calcEntryNotional(trade);
            const returnPct=entryNotional?pnl/entryNotional:null;
            const qty=trade.entries.reduce((sum,row)=>sum+(+row.qty||0),0)||trade.exits.reduce((sum,row)=>sum+(+row.qty||0),0)||0;
            const hold=calcDur(trade);
            const entryAvg=averagePrice(trade.entries);
            const exitAvg=averagePrice(trade.exits);
            const lifecycleLabel=getTradeLifecycleLabel(trade);
            const notes=clipText((trade.postTrade||trade.preTrade||"").trim(),180);
            return<div key={trade.id} style={{padding:"18px 18px 16px",borderRadius:20,background:C.surfaceAlt,boxShadow:C.shadow,display:"grid",gap:14}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
                <div style={{display:"grid",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                    <div style={{fontSize:24,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif"}}>{trade.symbol}</div>
                    <Pill label={getDirectionLabel(trade.direction)} color={getDirectionColor(trade.direction)}/>
                    <Pill label={trade.strategy} color={C.purple}/>
                    <Pill label={trade.market} color={C.teal}/>
                  </div>
                  <div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>
                    {lifecycleLabel} / {qty} contract{qty!==1?"s":""} / {hold===null?"Hold N/A":`${fmtDuration(hold)} hold`}
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:28,fontWeight:800,color:pnl>=0?C.green:C.red,fontFamily:"'Sora','Manrope',sans-serif"}}>{displayMoney(pnl)}</div>
                  <div style={{fontSize:12,color:returnPct===null?C.dim:returnPct>=0?C.green:C.red,fontWeight:700,marginTop:5}}>
                    {returnPct===null?"No return %":fmtPct(returnPct)}
                  </div>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
                <div style={{padding:"12px 13px",borderRadius:16,background:C.surface}}>
                  <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:5}}>Entry / Exit</div>
                  <div style={{fontSize:15,fontWeight:800,color:C.text}}>{entryAvg===null?"N/A":`$${entryAvg.toFixed(2)}`}</div>
                  <div style={{fontSize:12,color:C.muted}}>{exitAvg===null?"N/A":`to $${exitAvg.toFixed(2)}`}</div>
                </div>
                <div style={{padding:"12px 13px",borderRadius:16,background:C.surface}}>
                  <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:5}}>Target / Stop</div>
                  <div style={{fontSize:15,fontWeight:800,color:C.text}}>{trade.targetPrice||"N/A"}</div>
                  <div style={{fontSize:12,color:C.muted}}>Stop {trade.stopLoss||"N/A"}</div>
                </div>
                <div style={{padding:"12px 13px",borderRadius:16,background:C.surface}}>
                  <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:5}}>Execution Context</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <Pill label={trade.emotion} color={C.teal} sm/>
                    {trade.mistakes?.map(mistake=><Pill key={mistake} label={mistake} color={C.red} sm/>)}
                    {trade.positiveTags?.map(tag=><Pill key={tag} label={tag} color={C.green} sm/>)}
                    {!trade.mistakes?.length&&!trade.positiveTags?.length&&<span style={{fontSize:12,color:C.muted}}>No tags assigned</span>}
                  </div>
                </div>
              </div>

              {notes&&<div style={{padding:"12px 13px",borderRadius:16,background:C.surface}}>
                <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:6}}>Journal Note</div>
                <div style={{fontSize:13,color:C.text,lineHeight:1.75}}>{notes}</div>
              </div>}
            </div>;
          })}
        </div>
      </div>
    </div>,document.body)}
  </div>;
}

// â”€â”€ TRADE LOG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TradeLogView({trades,onSelect,onNew,onEdit,onImportCSV,onExportCSV,onResetJournal}){
  const [filter,setFilter]=useState("ALL");
  const [datePreset,setDatePreset]=useState("ALL");
  const [sortK,setSortK]=useState("date-desc");
  const [search,setSearch]=useState("");
  const DATE_PRESETS=[
    {key:"TODAY",label:"Today"},
    {key:"THIS_WEEK",label:"This Week"},
    {key:"THIS_MONTH",label:"This Month"},
  ];
  const RESULT_FILTERS=["ALL","WIN","LOSS","LONG","SHORT"];
  const searchNeedle=search.trim().toLowerCase();
  const {pm,filterPnls,datePnls,rows}=useMemo(()=>{
    const pnlMap=Object.fromEntries(trades.map(trade=>[trade.id,calcPnl(trade)]));
    const matchesResultFilter=(trade,nextFilter)=>{
      const outcome=getTradeOutcome(trade);
      if(nextFilter==="WIN")return outcome==="WIN";
      if(nextFilter==="LOSS")return outcome==="LOSS";
      if(nextFilter==="SHORT")return trade.direction==="SHORT";
      if(nextFilter==="LONG")return trade.direction==="LONG";
      return true;
    };
    const matchesSearch=trade=>!searchNeedle||trade.symbol.toLowerCase().includes(searchNeedle)||trade.strategy.toLowerCase().includes(searchNeedle);
    const searchedTrades=trades.filter(matchesSearch);
    const currentDateScope=searchedTrades.filter(trade=>matchesDatePreset(trade,datePreset));
    const currentResultScope=searchedTrades.filter(trade=>matchesResultFilter(trade,filter));
    const nextFilterPnls=Object.fromEntries(RESULT_FILTERS.map(nextFilter=>[
      nextFilter,
      currentDateScope
        .filter(trade=>matchesResultFilter(trade,nextFilter))
        .reduce((sum,trade)=>sum+pnlMap[trade.id],0),
    ]));
    const nextDatePnls=Object.fromEntries(DATE_PRESETS.map(preset=>[
      preset.key,
      currentResultScope
        .filter(trade=>matchesDatePreset(trade,preset.key))
        .reduce((sum,trade)=>sum+pnlMap[trade.id],0),
    ]));
    const nextRows=[...searchedTrades
      .filter(trade=>matchesResultFilter(trade,filter)&&matchesDatePreset(trade,datePreset))]
      .sort((a,b)=>{
        const timeDelta=getTradeDateTime(b)-getTradeDateTime(a);
        if(sortK==="date-desc")return timeDelta;
        if(sortK==="date-asc")return -timeDelta;
        if(sortK==="pnl-desc")return pnlMap[b.id]-pnlMap[a.id]||timeDelta;
        if(sortK==="pnl-asc")return pnlMap[a.id]-pnlMap[b.id]||timeDelta;
        return 0;
      });
    return{pm:pnlMap,filterPnls:nextFilterPnls,datePnls:nextDatePnls,rows:nextRows};
  },[trades,searchNeedle,datePreset,filter,sortK]);
  const toggleResultFilter=option=>startTransition(()=>setFilter(current=>current===option?"ALL":option));
  const toggleDatePreset=key=>startTransition(()=>setDatePreset(current=>current===key?"ALL":key));
  const statSectionStyle={width:"100%",maxWidth:1120,margin:"0 auto",display:"grid",gap:10};
  const resultGridWrapStyle={width:"100%",overflowX:"auto"};
  const resultGridStyle={display:"grid",gridTemplateColumns:"repeat(5,minmax(0,1fr))",gap:8,minWidth:900};
  const dateGridStyle={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8,alignItems:"stretch"};
  const tradeLogActionBtnStyle={
    ...btnBase(),
    padding:"10px 12px",
    background:"transparent",
    boxShadow:"none",
    color:C.textSoft,
    display:"inline-flex",
    alignItems:"center",
    gap:8,
    fontWeight:700,
  };
  return<div style={{display:"flex",flexDirection:"column",gap:20,animation:"riseIn .45s ease both"}}>
    <PageIntro
      eyebrow="Journal"
      title="Trade log"
      description="Review every position with cleaner context around setup, timing, execution, and outcome."
      actions={<div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",justifyContent:"flex-end"}}>
        <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap",padding:6,borderRadius:999,background:C.surface,boxShadow:`${C.shadow}, inset 0 0 0 1px rgba(148,163,184,0.08)`}}>
          <label style={{...tradeLogActionBtnStyle,cursor:"pointer"}}>
            <Icon name="upload" size={14} color={C.textSoft}/>
            Import CSV
            <input type="file" accept=".csv" onChange={onImportCSV} style={{display:"none"}}/>
          </label>
          <div style={{width:1,height:22,background:C.border,opacity:0.7}}/>
          <button onClick={onExportCSV} style={tradeLogActionBtnStyle}>
            <Icon name="download" size={14} color={C.textSoft}/>
            Export CSV
          </button>
          <div style={{width:1,height:22,background:C.border,opacity:0.7}}/>
          <button onClick={onResetJournal} style={{...tradeLogActionBtnStyle,color:C.red}}>
            <Icon name="trash" size={14} color={C.red}/>
            Reset Journal
          </button>
        </div>
        <button onClick={onNew} style={{...btnBase(),background:"linear-gradient(180deg, #4f8cff, #2563eb)",color:"#fff",padding:"12px 18px",boxShadow:"0 14px 26px rgba(59,130,246,0.18)"}}><span style={{display:"inline-flex",alignItems:"center",gap:8}}><Icon name="plus" size={16} color="#fff"/>New Trade</span></button>
      </div>}
    />
    <Card style={{padding:"14px 14px"}}>
      <div style={statSectionStyle}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{flex:"1 1 220px",minWidth:220,position:"relative"}}>
            <span style={{position:"absolute",left:14,top:13}}><Icon name="filter" size={16} color={C.dim}/></span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search symbol or setup..." style={{...inp(),paddingLeft:40,height:44,fontSize:15}}/>
          </div>
          <select value={sortK} onChange={e=>setSortK(e.target.value)} style={{...inp(),width:"auto",minWidth:160,height:44,padding:"0 14px",fontSize:15}}>
            <option value="date-desc">Newest</option><option value="date-asc">Oldest</option>
            <option value="pnl-desc">Best P&L</option><option value="pnl-asc">Worst P&L</option>
          </select>
          <Pill label={`${rows.length} visible`} color={C.teal}/>
        </div>
        <div style={resultGridWrapStyle}>
          <div style={resultGridStyle}>
            {RESULT_FILTERS.map(option=>{
              const pnl=filterPnls[option];
              const active=filter===option;
              const optionLabel=option==="LONG"||option==="SHORT"?getDirectionLabel(option):option;
              const pnlColor=pnl>0?"#4ef2a3":pnl<0?"#ff7b7b":C.dim;
              return<button key={option} onClick={()=>toggleResultFilter(option)} style={{
                ...btnBase(),
                padding:"7px 12px 8px",
                background:active?"linear-gradient(180deg, rgba(59,130,246,0.24), rgba(37,99,235,0.18))":C.surfaceAlt,
                color:active?C.accentStrong:C.muted,
                display:"grid",
                gap:2,
                textAlign:"left",
                minWidth:0,
                width:"100%",
                borderRadius:14,
                boxShadow:active?"inset 0 0 0 1px rgba(96,165,250,0.42), 0 8px 18px rgba(37,99,235,0.10)":"inset 0 0 0 1px rgba(148,163,184,0.06)",
              }}>
                <span style={{fontSize:11,color:active?C.accentStrong:C.muted,fontWeight:800,letterSpacing:"0.08em"}}>{optionLabel}</span>
                <span style={{fontSize:14,fontWeight:900,color:pnlColor,fontFamily:"'Sora','Manrope',sans-serif",letterSpacing:"-0.02em"}}>{fmtMoney(pnl)}</span>
              </button>;
            })}
          </div>
        </div>
        <div style={dateGridStyle}>
          {DATE_PRESETS.map(preset=>{
            const pnl=datePnls[preset.key];
            const active=datePreset===preset.key;
            const pnlColor=pnl>0?"#4ef2a3":pnl<0?"#ff7b7b":C.dim;
            return<button key={preset.key} onClick={()=>toggleDatePreset(preset.key)} style={{
              ...btnBase(),
              padding:"7px 12px 8px",
              background:active?"linear-gradient(180deg, rgba(59,130,246,0.24), rgba(37,99,235,0.18))":C.surfaceAlt,
              color:active?C.accentStrong:C.muted,
              display:"grid",
              gap:2,
              textAlign:"left",
              minWidth:0,
              width:"100%",
              borderRadius:14,
              boxShadow:active?"inset 0 0 0 1px rgba(96,165,250,0.42), 0 8px 18px rgba(37,99,235,0.10)":"inset 0 0 0 1px rgba(148,163,184,0.06)",
            }}>
              <span style={{fontSize:11,color:active?C.accentStrong:C.muted,fontWeight:800,letterSpacing:"0.05em"}}>{preset.label}</span>
              <span style={{fontSize:14,fontWeight:900,color:pnlColor,fontFamily:"'Sora','Manrope',sans-serif",letterSpacing:"-0.02em"}}>{fmtMoney(pnl)}</span>
            </button>;
          })}
        </div>
      </div>
    </Card>

    {!rows.length&&<EmptyState icon="layers" title="No trades match these filters" message="Adjust the symbol search, time range, or direction filter to surface the trades you want to review." action={!trades.length?<button onClick={onNew} style={{...btnBase(),background:"linear-gradient(180deg, #4f8cff, #2563eb)",color:"#fff"}}>Log first trade</button>:null}/>}

    <div style={{display:"grid",gap:14}}>
      {rows.map(t=><TradeCard key={t.id} trade={t} pnl={pm[t.id]} onSelect={onSelect} onEdit={onEdit}/>)}
    </div>
  </div>;
}

// â”€â”€ TRADE DETAIL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TradeDetail({trade,onBack,onEdit,onDelete}){
  const pnl=calcPnl(trade),rr=calcRR(trade),dur=calcDur(trade);
  const lifecycleLabel=getTradeLifecycleLabel(trade);
  const exitRoiBreakdown=buildExitRoiBreakdown(trade);
  const exitHoldBreakdown=buildExitHoldBreakdown(trade);
  const [delConfirm,setDelConfirm]=useState(false);
  return<div style={{display:"flex",flexDirection:"column",gap:20,animation:"riseIn .45s ease both"}}>
    <PageIntro
      eyebrow="Trade Review"
      title={`${trade.symbol} trade detail`}
      description={`A complete breakdown of your ${getDirectionLabel(trade.direction).toLowerCase()} execution on ${trade.date}.`}
      actions={<>
        <button onClick={onBack} style={{...btnBase(),display:"inline-flex",alignItems:"center",gap:8}}><Icon name="back" size={15}/>Back</button>
        <button onClick={()=>onEdit(trade)} style={{...btnBase(),background:C.accentBg,color:C.accentStrong,display:"inline-flex",alignItems:"center",gap:8}}><Icon name="pencil" size={15} color={C.accentStrong}/>Edit</button>
        {!delConfirm
          ?<button onClick={()=>setDelConfirm(true)} style={{...btnBase(),background:C.redBg,color:C.red,display:"inline-flex",alignItems:"center",gap:8}}><Icon name="trash" size={15} color={C.red}/>Delete</button>
          :<>
            <button onClick={()=>onDelete(trade.id)} style={{...btnBase(),background:C.red,color:"#fff",display:"inline-flex",alignItems:"center",gap:8}}><Icon name="trash" size={15} color="#fff"/>Confirm Delete</button>
            <button onClick={()=>setDelConfirm(false)} style={btnBase()}>Cancel</button>
          </>}
      </>}
    />

    <Card accent={pnl>=0?C.green:C.red} style={{padding:"28px 28px 24px",background:`linear-gradient(135deg, ${C.surface} 0%, ${pnl>=0?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.08)"} 100%)`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:20,flexWrap:"wrap"}}>
        <div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
            <Pill label={getDirectionLabel(trade.direction)} color={getDirectionColor(trade.direction)}/>
            <Pill label={trade.strategy} color={C.purple}/>
            <Pill label={trade.market} color={C.teal}/>
            <Pill label={trade.emotion} color="transparent"/>
          </div>
          <div style={{fontSize:40,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1,marginBottom:8}}>{trade.symbol}</div>
          <div style={{fontSize:14,color:C.muted,lineHeight:1.8}}>{lifecycleLabel}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:42,fontWeight:800,color:pnl>=0?C.green:C.red,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1}}>{pnl>=0?"+$":"-$"}{Math.abs(pnl).toFixed(2)}</div>
          <div style={{fontSize:13,color:C.muted,marginTop:8}}>{rr?`Planned RR ${rr}x`:"Risk/reward not set"}</div>
        </div>
      </div>
    </Card>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:16}}>
      <Metric label="Net P&L" value={`${pnl>=0?"+$":"-$"}${Math.abs(pnl).toFixed(2)}`} color={pnl>=0?C.green:C.red} icon="wallet" small/>
      <Metric label="Planned RR" value={rr?`${rr}x`:"Not set"} icon="target" small/>
      <Metric label="Duration" value={dur!==null?fmtDuration(dur):"N/A"} icon="calendar" small/>
      <Metric label="Fees" value={`$${trade.fees}`} color={trade.fees?C.red:C.text} icon="pulse" small/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:18}}>
      <Card>
        <SLabel>Entries</SLabel>
        <div style={{display:"grid",gap:10}}>
          {trade.entries.map((e,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:"1px solid rgba(148,163,184,0.18)"}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:C.text}}>Entry {i+1}</div>
              <div style={{fontSize:12,color:C.muted}}>{[getRowDate(e,trade.date)?formatShortDate(getRowDate(e,trade.date)):"",e.time?formatTime12h(e.time):""].filter(Boolean).join(" | ")||"Date/time not set"}</div>
            </div>
            <div style={{fontSize:15,fontWeight:700,color:C.text,fontFamily:"'Sora','Manrope',sans-serif"}}>${(+e.price).toFixed(2)} x {e.qty}</div>
          </div>)}
        </div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:16}}>
          <Pill label={`Target ${trade.targetPrice||"N/A"}`} color={C.green}/>
          <Pill label={`Stop ${trade.stopLoss||"N/A"}`} color={C.red}/>
        </div>
      </Card>
      <Card>
        <SLabel>Exits</SLabel>
        <div style={{display:"grid",gap:10}}>
          {trade.exits.map((e,i)=>{
            const breakdown=exitRoiBreakdown[i];
            const hold=exitHoldBreakdown[i];
            const roi=breakdown?.roi??null;
            const avgCost=breakdown?.avgCost;
            const price=parseMaybeNumber(e.price);
            const qty=parseMaybeNumber(e.qty)??0;
            const exitDate=getRowDate(e,trade.date);
            const exitSchedule=[exitDate?formatShortDate(exitDate):"",e.time?formatTime12h(e.time):""].filter(Boolean).join(" | ")||"Date/time not set";
            const roiColor=roi===null?C.dim:roi>=0?C.green:C.red;
            return <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,padding:"14px 0",borderBottom:"1px solid rgba(148,163,184,0.18)"}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:C.text}}>Exit {i+1}</div>
                <div style={{fontSize:12,color:C.muted}}>{exitSchedule}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:4}}>
                  {Number.isFinite(hold)?`${fmtDuration(hold)} hold`:"Hold N/A"}
                </div>
                <div style={{fontSize:12,color:C.muted,marginTop:3}}>
                  {Number.isFinite(avgCost)?`Avg cost $${avgCost.toFixed(2)}`:"Avg cost N/A"}
                </div>
              </div>
              <div style={{textAlign:"right",display:"grid",gap:5,justifyItems:"end"}}>
                <div style={{fontSize:15,fontWeight:700,color:C.text,fontFamily:"'Sora','Manrope',sans-serif"}}>
                  {price===null?"Price N/A":`$${price.toFixed(2)}`} x {qty}
                </div>
                <div style={{fontSize:13,fontWeight:800,color:roiColor,fontFamily:"'Sora','Manrope',sans-serif"}}>
                  {roi===null?"ROI N/A":`${fmtSignedPct(roi)} ROI`}
                </div>
              </div>
            </div>;
          })}
        </div>
      </Card>
    </div>

    {trade.mistakes?.length>0&&<Card>
      <SLabel>Mistakes Tagged</SLabel>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{trade.mistakes.map(m=><Pill key={m} label={m} color={C.red}/>)}</div>
    </Card>}

    {trade.positiveTags?.length>0&&<Card>
      <SLabel>Positive Tags</SLabel>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{trade.positiveTags.map(tag=><Pill key={tag} label={tag} color={C.green}/>)}</div>
    </Card>}

    {trade.screenshots?.length>0&&<Card>
      <SLabel>Screenshots</SLabel>
      <ScreenshotStrip images={trade.screenshots}/>
    </Card>}

    {(trade.preTrade||trade.postTrade)&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:18}}>
      {trade.preTrade&&<Card>
        <SLabel>Pre-Trade Plan</SLabel>
        <div style={{fontSize:14,color:C.textSoft,lineHeight:1.85,background:C.surfaceSoft,borderRadius:16,padding:"18px 18px"}}>{trade.preTrade}</div>
      </Card>}
      {trade.postTrade&&<Card>
        <SLabel>Post-Trade Review</SLabel>
        <div style={{fontSize:14,color:C.textSoft,lineHeight:1.85,background:C.surfaceSoft,borderRadius:16,padding:"18px 18px"}}>{trade.postTrade}</div>
      </Card>}
    </div>}
  </div>;
}

// â”€â”€ TRADE FORM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TradeForm({initial,onSave,onCancel}){
  const today=new Date().toISOString().slice(0,10);
  const blank={date:today,symbol:"SPY",market:"Stocks",direction:"LONG",entries:[{price:"",qty:"",date:today,time:""}],exits:[{price:"",qty:"",date:today,time:""}],targetPrice:"",stopLoss:"",fees:"",strategy:"ORB",mistakes:[],positiveTags:[],emotion:"Calm",preTrade:"",postTrade:"",screenshots:[]};
  const baseEntryDate=initial?getRowDate(initial.entries?.[0],initial.date)||today:today;
  const baseEntryMinutes=initial?timeToMinutes(initial.entries?.[0]?.time):null;
  const initialForm=initial?{
    ...blank,
    ...initial,
    date:baseEntryDate,
    entries:(Array.isArray(initial.entries)?initial.entries:blank.entries).map(entry=>({...entry,date:getRowDate(entry,baseEntryDate)||baseEntryDate})),
    exits:(Array.isArray(initial.exits)?initial.exits:blank.exits).map(exit=>({...exit,date:getEffectiveExitDateKey(exit,baseEntryDate,baseEntryMinutes)||baseEntryDate})),
    screenshots:Array.isArray(initial.screenshots)?initial.screenshots:[],
  }:blank;
  const[f,setF]=useState(initialForm);
  const[errs,setErrs]=useState({});
  const[imageBusy,setImageBusy]=useState(false);
  const[imageError,setImageError]=useState("");
  const u=(k,v)=>setF(p=>({...p,[k]:v}));
  const ue=(arr,k,i,v)=>{const a=[...f[arr]];a[i]={...a[i],[k]:v};u(arr,a);};
  const updateEntryDate=(index,value)=>setF(current=>{
    const entries=[...current.entries];
    const previousDate=entries[index]?.date||current.date;
    entries[index]={...entries[index],date:value};
    const isPrimary=index===0;
    return{
      ...current,
      date:isPrimary?value:current.date,
      entries,
      exits:isPrimary?current.exits.map(exit=>({...exit,date:!exit.date||exit.date===previousDate?value:exit.date})):current.exits,
    };
  });
  const addRow=arr=>u(arr,[...f[arr],{price:"",qty:"",time:"",date:f.date}]);
  const rmRow=(arr,i)=>setF(current=>({
    ...current,
    [arr]:current[arr].filter((_,j)=>j!==i),
  }));
  const toggleM=m=>u("mistakes",f.mistakes.includes(m)?f.mistakes.filter(x=>x!==m):[...f.mistakes,m]);
  const togglePositiveTag=tag=>u("positiveTags",f.positiveTags.includes(tag)?f.positiveTags.filter(x=>x!==tag):[...f.positiveTags,tag]);
  const removeScreenshot=index=>u("screenshots",f.screenshots.filter((_,currentIndex)=>currentIndex!==index));
  const addScreenshots=async files=>{
    const nextFiles=Array.from(files||[]).filter(file=>String(file.type||"").startsWith("image/"));
    if(!nextFiles.length)return;
    const remaining=Math.max(0,4-f.screenshots.length);
    if(!remaining){
      setImageError("You can attach up to 4 screenshots per trade.");
      return;
    }

    setImageBusy(true);
    setImageError("");

    try{
      const processed=(await Promise.all(nextFiles.slice(0,remaining).map(file=>optimizeScreenshot(file)))).filter(Boolean);
      if(processed.length)u("screenshots",[...f.screenshots,...processed]);
      if(nextFiles.length>remaining)setImageError("Only the first 4 screenshots are kept for each trade.");
    }catch(error){
      setImageError(error.message||"Unable to add these screenshots.");
    }finally{
      setImageBusy(false);
    }
  };
  const handleScreenshotPaste=async event=>{
    const items=Array.from(event.clipboardData?.items||[]);
    const imageFiles=items
      .filter(item=>item.kind==="file"&&String(item.type||"").startsWith("image/"))
      .map(item=>item.getAsFile())
      .filter(Boolean);
    const pastedText=String(event.clipboardData?.getData("text/plain")||"").trim();

    if(imageFiles.length){
      event.preventDefault();
      await addScreenshots(imageFiles);
      return;
    }

    if(/^data:image\//i.test(pastedText)){
      event.preventDefault();
      const remaining=Math.max(0,4-f.screenshots.length);
      if(!remaining){
        setImageError("You can attach up to 4 screenshots per trade.");
        return;
      }
      setImageError("");
      u("screenshots",[...f.screenshots,pastedText]);
    }
  };
  const validate=()=>{
    const e={};
    if(!f.symbol)e.symbol="Required";
    if(!getRowDate(f.entries[0],f.date))e.date="Required";
    if(!f.entries[0]?.price)e.ep="Entry price required";
    if(!f.exits[0]?.price)e.xp="Exit price required";
    if(!f.entries[0]?.qty)e.eq="Quantity required";
    setErrs(e);return Object.keys(e).length===0;
  };
  const save=()=>{
    if(!validate())return;
    const entryDate=getRowDate(f.entries[0],f.date);
    onSave({
      ...f,
      date:entryDate,
      entries:f.entries.map(entry=>({...entry,date:getRowDate(entry,entryDate)})),
      exits:f.exits.map(exit=>({...exit,date:getRowDate(exit,entryDate)})),
      id:f.id||"t"+Date.now(),
    });
  };
  return<div style={{display:"flex",flexDirection:"column",gap:20,animation:"riseIn .45s ease both"}}>
    <PageIntro
      eyebrow="Trade Entry"
      title={initial?"Edit logged trade":"Log a new trade"}
      description="Capture the setup, structure, execution, and review notes that explain the outcome."
      actions={<button onClick={onCancel} style={btnBase()}>Cancel</button>}
    />

    <Card style={{padding:"24px 24px 18px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16}}>
        <FormField label="Symbol" err={errs.symbol}><input value={f.symbol} onChange={e=>u("symbol",e.target.value.toUpperCase())} placeholder="SPY" style={inp()}/></FormField>
        <FormField label="Market"><select value={f.market} onChange={e=>u("market",e.target.value)} style={inp()}>{MARKETS.map(m=><option key={m}>{m}</option>)}</select></FormField>
        <FormField label="Direction">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {["LONG","SHORT"].map(d=><button key={d} onClick={()=>u("direction",d)} style={{...btnBase(),padding:"12px 10px",background:f.direction===d?getDirectionActiveBackground(d):C.surfaceSoft,color:f.direction===d?getDirectionColor(d):C.muted,boxShadow:f.direction===d?`inset 0 0 0 1px ${getDirectionColor(d)}33`:undefined}}>{getDirectionLabel(d)}</button>)}
          </div>
        </FormField>
      </div>
    </Card>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:18}}>
      <Card style={{padding:"22px 22px 18px"}}>
        <SLabel>Entries</SLabel>
        {f.entries.map((e,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"minmax(110px,1fr) 80px minmax(145px,1fr) minmax(170px,1fr) auto",gap:10,marginBottom:10,alignItems:"center"}}>
          <input type="number" value={e.price} onChange={v=>ue("entries","price",i,v.target.value)} placeholder="Price" style={inp({boxShadow:errs.ep&&i===0?`inset 0 0 0 1px ${C.red}`:undefined})}/>
          <input type="number" value={e.qty} onChange={v=>ue("entries","qty",i,v.target.value)} placeholder="Qty" style={inp({boxShadow:errs.eq&&i===0?`inset 0 0 0 1px ${C.red}`:undefined})}/>
          <input type="date" aria-label={`Entry ${i+1} date`} value={e.date||f.date} onChange={v=>updateEntryDate(i,v.target.value)} style={inp({boxShadow:errs.date&&i===0?`inset 0 0 0 1px ${C.red}`:undefined})}/>
          <TimeInput12h value={e.time} onChange={v=>ue("entries","time",i,v)}/>
          {i>0&&<button onClick={()=>rmRow("entries",i)} style={{...btnBase(),padding:"10px 12px",background:C.redBg,color:C.red}}>Remove</button>}
        </div>)}
        <button onClick={()=>addRow("entries")} style={{...btnBase(),marginBottom:16,background:C.accentBg,color:C.accentStrong,display:"inline-flex",alignItems:"center",gap:8}}><Icon name="plus" size={14} color={C.accentStrong}/>Add entry</button>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
          <div><label style={{fontSize:11,color:C.green,display:"block",marginBottom:7,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700}}>Target Price</label><input type="number" value={f.targetPrice} onChange={e=>u("targetPrice",e.target.value)} placeholder="Target" style={inp()}/></div>
          <div><label style={{fontSize:11,color:C.red,display:"block",marginBottom:7,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700}}>Stop Loss</label><input type="number" value={f.stopLoss} onChange={e=>u("stopLoss",e.target.value)} placeholder="Stop" style={inp()}/></div>
        </div>
      </Card>

      <Card style={{padding:"22px 22px 18px"}}>
        <SLabel>Exits</SLabel>
        {f.exits.map((e,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"minmax(110px,1fr) 80px minmax(145px,1fr) minmax(170px,1fr) auto",gap:10,marginBottom:10,alignItems:"center"}}>
          <input type="number" value={e.price} onChange={v=>ue("exits","price",i,v.target.value)} placeholder="Price" style={inp({boxShadow:errs.xp&&i===0?`inset 0 0 0 1px ${C.red}`:undefined})}/>
          <input type="number" value={e.qty} onChange={v=>ue("exits","qty",i,v.target.value)} placeholder="Qty" style={inp()}/>
          <input type="date" aria-label={`Exit ${i+1} date`} value={e.date||f.date} onChange={v=>ue("exits","date",i,v.target.value)} style={inp()}/>
          <TimeInput12h value={e.time} onChange={v=>ue("exits","time",i,v)}/>
          {i>0&&<button onClick={()=>rmRow("exits",i)} style={{...btnBase(),padding:"10px 12px",background:C.redBg,color:C.red}}>Remove</button>}
        </div>)}
        <button onClick={()=>addRow("exits")} style={{...btnBase(),marginBottom:16,background:C.accentBg,color:C.accentStrong,display:"inline-flex",alignItems:"center",gap:8}}><Icon name="plus" size={14} color={C.accentStrong}/>Add exit</button>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:7,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700}}>Fees / Commission</label><input type="number" value={f.fees} onChange={e=>u("fees",e.target.value)} placeholder="e.g. 2.50" style={inp()}/></div>
      </Card>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:18}}>
      <Card>
        <FormField label="Strategy"><select value={f.strategy} onChange={e=>u("strategy",e.target.value)} style={inp()}>{STRATEGIES.map(s=><option key={s}>{s}</option>)}</select></FormField>
        <FormField label="Emotion at Entry"><select value={f.emotion} onChange={e=>u("emotion",e.target.value)} style={inp()}>{EMOTIONS.map(em=><option key={em}>{em}</option>)}</select></FormField>
        <FormField label="Mistake Tags (select all that apply)">
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {MISTAKE_TAGS.map(tag=><button key={tag} onClick={()=>toggleM(tag)} style={{...btnBase(),padding:"8px 12px",background:f.mistakes.includes(tag)?C.redBg:C.surfaceSoft,color:f.mistakes.includes(tag)?C.red:C.muted}}>{tag}</button>)}
          </div>
        </FormField>
        <FormField label="Positive Tags (select all that apply)">
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {POSITIVE_TAGS.map(tag=><button key={tag} onClick={()=>togglePositiveTag(tag)} style={{...btnBase(),padding:"8px 12px",background:f.positiveTags.includes(tag)?C.greenBg:C.surfaceSoft,color:f.positiveTags.includes(tag)?C.green:C.muted}}>{tag}</button>)}
          </div>
        </FormField>
      </Card>
      <Card>
        <FormField label="Pre-Trade Plan"><textarea value={f.preTrade} onChange={e=>u("preTrade",e.target.value)} rows={6} placeholder="Why am I taking this trade? Key levels, bias, setup confirmation, planned entry and exit." style={{...inp(),resize:"vertical",lineHeight:1.8}}/></FormField>
        <FormField label="Post-Trade Review"><textarea value={f.postTrade} onChange={e=>u("postTrade",e.target.value)} rows={6} placeholder="What went right? What went wrong? What should change next time?" style={{...inp(),resize:"vertical",lineHeight:1.8}}/></FormField>
        <FormField label="Screenshots / Photos">
          <div style={{display:"grid",gap:12}}>
            <label style={{...btnBase(),padding:"12px 14px",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,cursor:imageBusy?"progress":"pointer",background:C.surfaceSoft,color:C.textSoft}}>
              <Icon name="upload" size={14} color={C.textSoft}/>
              {imageBusy?"Processing screenshots...":"Add screenshots"}
              <input type="file" accept="image/*" multiple disabled={imageBusy} onChange={async e=>{await addScreenshots(e.target.files);e.target.value="";}} style={{display:"none"}}/>
            </label>
            <textarea
              rows={3}
              onPaste={handleScreenshotPaste}
              onChange={e=>{if(e.target.value)e.target.value="";}}
              placeholder="Or click here and paste a screenshot from your clipboard (Ctrl/Cmd+V)."
              style={{...inp(),resize:"vertical",lineHeight:1.7,background:C.surfaceSoft}}
            />
            {imageError&&<div style={{fontSize:12,color:C.red}}>{imageError}</div>}
            {f.screenshots.length>0&&<div style={{display:"grid",gap:10}}>
              <ScreenshotStrip images={f.screenshots}/>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {f.screenshots.map((_,index)=><button key={index} type="button" onClick={()=>removeScreenshot(index)} style={{...btnBase(),padding:"8px 12px",background:C.redBg,color:C.red}}>
                  Remove screenshot {index+1}
                </button>)}
              </div>
            </div>}
          </div>
        </FormField>
      </Card>
    </div>

    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
      <button onClick={save} style={{...btnBase(),background:"linear-gradient(180deg, #4f8cff, #2563eb)",color:"#fff",padding:"12px 26px",display:"inline-flex",alignItems:"center",gap:8}}><Icon name="spark" size={15} color="#fff"/>{initial?"Update Trade":"Save Trade"}</button>
      <button onClick={onCancel} style={btnBase()}>Cancel</button>
    </div>
  </div>;
}

// â”€â”€ ANALYTICS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function LegacyAnalyticsView({trades}){
  const pnls=trades.map(calcPnl);
  const stats=calcStats(trades);
  const dataset=buildCoachDataset(trades);
  const hourRef=useRef(),weekRef=useRef(),emotionRef=useRef(),mistakeRef=useRef();

  const bDir={LONG:{pnl:0,w:0,n:0},SHORT:{pnl:0,w:0,n:0}};
  const bStrat={},bEm={},bHour={},bWeek={0:0,1:0,2:0,3:0,4:0,5:0,6:0};
  const mistakeC={},mistakePnl={};
  trades.forEach((t,i)=>{
    const p=pnls[i];
    bDir[t.direction].pnl+=p;bDir[t.direction].n++;if(p>0)bDir[t.direction].w++;
    if(!bStrat[t.strategy])bStrat[t.strategy]={pnl:0,w:0,n:0};bStrat[t.strategy].pnl+=p;bStrat[t.strategy].n++;if(p>0)bStrat[t.strategy].w++;
    if(!bEm[t.emotion])bEm[t.emotion]={pnl:0,n:0};bEm[t.emotion].pnl+=p;bEm[t.emotion].n++;
    if(t.entries[0]?.time){const h=t.entries[0].time.split(":")[0];if(!bHour[h])bHour[h]={pnl:0,n:0};bHour[h].pnl+=p;bHour[h].n++;}
    const dow=new Date(t.date+"T12:00:00").getDay();bWeek[dow]=(bWeek[dow]||0)+p;
    t.mistakes?.forEach(m=>{mistakeC[m]=(mistakeC[m]||0)+1;mistakePnl[m]=(mistakePnl[m]||0)+p;});
  });
  const hours=Object.keys(bHour).sort();

  useEffect(()=>{
    if(!hourRef.current||!hours.length)return;
    const values=hours.map(hour=>bHour[hour].pnl);
    const ch=new Chart(hourRef.current.getContext("2d"),{
      type:"bar",
      data:{labels:hours.map(formatHourLabel),datasets:[{data:values,backgroundColor:values.map(value=>value>0?"rgba(34,197,94,0.76)":"rgba(239,68,68,0.72)"),borderRadius:10,borderSkipped:false,maxBarThickness:34}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:C.tooltipBg,displayColors:false}},scales:chartScales()},
    });
    return()=>ch.destroy();
  },[trades,ACTIVE_THEME]);

  useEffect(()=>{
    if(!weekRef.current)return;
    const wVals=[1,2,3,4,5].map(d=>bWeek[d]||0);
    const ch=new Chart(weekRef.current.getContext("2d"),{
      type:"bar",
      data:{labels:["Mon","Tue","Wed","Thu","Fri"],datasets:[{data:wVals,backgroundColor:wVals.map(value=>value>0?"rgba(59,130,246,0.80)":"rgba(239,68,68,0.72)"),borderRadius:10,borderSkipped:false,maxBarThickness:36}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:C.tooltipBg,displayColors:false}},scales:chartScales({hideXGrid:true})},
    });
    return()=>ch.destroy();
  },[trades,ACTIVE_THEME]);

  useEffect(()=>{
    if(!emotionRef.current||!Object.keys(bEm).length)return;
    const labels=Object.keys(bEm),vals=labels.map(l=>bEm[l].pnl);
    const ch=new Chart(emotionRef.current.getContext("2d"),{
      type:"bar",
      data:{labels,datasets:[{data:vals,backgroundColor:vals.map(value=>value>0?"rgba(20,184,166,0.76)":"rgba(239,68,68,0.70)"),borderRadius:10,maxBarThickness:22}]},
      options:{responsive:true,maintainAspectRatio:false,indexAxis:"y",plugins:{legend:{display:false},tooltip:{backgroundColor:C.tooltipBg,displayColors:false}},scales:chartScales({indexAxis:"y"})},
    });
    return()=>ch.destroy();
  },[trades,ACTIVE_THEME]);

  useEffect(()=>{
    if(!mistakeRef.current||!Object.keys(mistakePnl).length)return;
    const labels=Object.keys(mistakePnl),vals=labels.map(l=>mistakePnl[l]);
    const ch=new Chart(mistakeRef.current.getContext("2d"),{
      type:"bar",
      data:{labels,datasets:[{data:vals,backgroundColor:vals.map(value=>value>0?"rgba(34,197,94,0.68)":"rgba(239,68,68,0.74)"),borderRadius:10,maxBarThickness:22}]},
      options:{responsive:true,maintainAspectRatio:false,indexAxis:"y",plugins:{legend:{display:false},tooltip:{backgroundColor:C.tooltipBg,displayColors:false}},scales:chartScales({indexAxis:"y"})},
    });
    return()=>ch.destroy();
  },[trades,ACTIVE_THEME]);

  if(!trades.length)return<div style={{textAlign:"center",padding:"80px 0",color:C.muted}}>No trades to analyze yet.</div>;
  const pf=stats.profitFactor;

  return<div style={{display:"flex",flexDirection:"column",gap:12}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:9}}>
      <Metric label="Win Rate" value={(stats.winRate*100).toFixed(1)+"%"} small/>
      <Metric label="Profit Factor" value={pf>=999?"Inf":pf.toFixed(2)} color={pf>=1.5?C.green:pf>=1?C.amber:C.red} small/>
      <Metric label="Expectancy" value={(stats.expectancy>=0?"+$":"-$")+Math.abs(stats.expectancy).toFixed(0)} color={stats.expectancy>=0?C.green:C.red} small/>
      <Metric label="Max Drawdown" value={"-$"+stats.maxDD.toFixed(0)} color={C.red} small/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card><SLabel>Long vs Short</SLabel>
        {["LONG","SHORT"].map(d=><div key={d} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",gap:8,alignItems:"center"}}><Pill label={d} color={d==="SHORT"?C.amber:C.accent}/><span style={{fontSize:11,color:C.muted}}>{bDir[d].w}W / {bDir[d].n-bDir[d].w}L / {bDir[d].n?((bDir[d].w/bDir[d].n)*100).toFixed(0):0}%</span></div>
          <span style={{fontFamily:"monospace",fontWeight:700,color:bDir[d].pnl>=0?C.green:C.red}}>{bDir[d].pnl>=0?"+$":"-$"}{Math.abs(bDir[d].pnl).toFixed(0)}</span>
        </div>)}
      </Card>
      <Card><SLabel>By Strategy</SLabel>
        {Object.entries(bStrat).map(([s,v])=><div key={s} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",gap:8,alignItems:"center"}}><Pill label={s} color={C.purple} sm/><span style={{fontSize:10,color:C.muted}}>{v.w}/{v.n} / {v.n?((v.w/v.n)*100).toFixed(0):0}%</span></div>
          <span style={{fontFamily:"monospace",fontWeight:700,color:v.pnl>=0?C.green:C.red,fontSize:13}}>{v.pnl>=0?"+$":"-$"}{Math.abs(v.pnl).toFixed(0)}</span>
        </div>)}
      </Card>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card><SLabel>P&L by Time of Day</SLabel><ChartBox h={150}><canvas ref={hourRef} role="img" aria-label="P&L by hour of day"/></ChartBox></Card>
      <Card><SLabel>P&L by Day of Week</SLabel><ChartBox h={150}><canvas ref={weekRef} role="img" aria-label="P&L by weekday"/></ChartBox></Card>
    </div>
    <Card><SLabel>P&L by Emotion at Entry</SLabel><ChartBox h={Math.max(100,Object.keys(bEm).length*42)}><canvas ref={emotionRef} role="img" aria-label="P&L grouped by trader emotion"/></ChartBox></Card>
    {Object.keys(mistakePnl).length>0&&<Card><SLabel>Mistake P&L Impact</SLabel><ChartBox h={Math.max(100,Object.keys(mistakePnl).length*42)}><canvas ref={mistakeRef} role="img" aria-label="P&L impact of each mistake type"/></ChartBox></Card>}
    <Card><SLabel>Win / Loss Metrics</SLabel>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:9}}>
        <Metric label="Avg Win" value={"+$"+stats.avgWin.toFixed(0)} color={C.green} small/>
        <Metric label="Avg Loss" value={"-$"+stats.avgLoss.toFixed(0)} color={C.red} small/>
        <Metric label="Win/Loss Ratio" value={(stats.avgWin/Math.max(1,stats.avgLoss)).toFixed(2)} color={(stats.avgWin/Math.max(1,stats.avgLoss))>=1.5?C.green:C.amber} small/>
      </div>
    </Card>
    <Card><SLabel>Streak Tracker</SLabel><StreakView pnls={pnls}/></Card>
  </div>;
}

function LegacyStreakView({pnls}){
  let cur=0,curType=null,maxW=0,maxL=0,w=0,l=0;
  pnls.forEach(p=>{
    const t=p>0?"W":"L";
    if(t===curType)cur++;else{cur=1;curType=t;}
    if(t==="W"){w++;maxW=Math.max(maxW,cur);}else{l++;maxL=Math.max(maxL,cur);}
  });
  const streakColor=curType==="W"?C.green:C.red;
  return<div style={{display:"flex",gap:9}}>
    <Metric label="Current Streak" value={(curType==="W"?"+":"-")+cur} color={streakColor} small/>
    <Metric label="Max Win Streak" value={maxW+"W"} color={C.green} small/>
    <Metric label="Max Loss Streak" value={maxL+"L"} color={C.red} small/>
    <Metric label="Total Wins" value={w} color={C.green} small/>
    <Metric label="Total Losses" value={l} color={C.red} small/>
  </div>;
}

// â”€â”€ AI COACH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function LegacyAICoach({trades}){
  const[msgs,setMsgs]=useState([{role:"ai",text:"I've analyzed your journal notes locally. Ask about your best setup, the patterns in your post-trade reviews, your best trading hour, or request a full performance breakdown."}]);
  const[input,setInput]=useState("");
  const[loading,setLoading]=useState(false);
  const scrollRef=useRef();
  const insights=buildCoachInsights(trades);
  useEffect(()=>{if(scrollRef.current)scrollRef.current.scrollTop=scrollRef.current.scrollHeight;},[msgs]);

  const send=async(text)=>{
    const q=text||input;if(!q.trim()||loading)return;
    setInput("");
    const newMsgs=[...msgs,{role:"user",text:q}];setMsgs(newMsgs);setLoading(true);
    await new Promise(resolve=>setTimeout(resolve,450));
    setMsgs(m=>[...m,{role:"ai",text:generateCoachReply(q,trades)}]);
    setLoading(false);
  };

  const QUICK=["Give me a full performance analysis","What patterns are hurting my P&L?","What is my most profitable setup?","Why do I keep exiting winners early?","When should I be trading for best results?","What rule would have the biggest impact on my results?"];

  return<div style={{display:"flex",flexDirection:"column",gap:12}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
      {insights.map((ins,i)=><Card key={i} accent={ins.color} style={{padding:"11px 14px"}}>
        <div style={{display:"flex",gap:7,alignItems:"flex-start"}}>
          <span style={{fontSize:14,color:ins.color,marginTop:1}}>{ins.icon}</span>
          <div><div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:4}}>{ins.title}</div><div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>{ins.text}</div></div>
        </div>
      </Card>)}
    </div>
    <Card style={{padding:0,overflow:"hidden"}}>
      <div style={{padding:"11px 15px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:9}}>
        <div style={{width:30,height:30,borderRadius:"50%",background:C.accentBg,border:`1px solid ${C.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.accent}}>AI</div>
        <div><div style={{fontSize:13,fontWeight:600,color:C.text}}>Trading Coach</div><div style={{fontSize:10,color:C.green}}>Live on-device analysis of {trades.length} trades</div></div>
      </div>
      <div ref={scrollRef} style={{height:300,overflowY:"auto",padding:"14px 15px",display:"flex",flexDirection:"column",gap:9}}>
        {msgs.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
          <div style={{maxWidth:"82%",background:m.role==="user"?C.accentBg:C.chatAiBubble,border:`1px solid ${m.role==="user"?C.accent+"44":C.border}`,borderRadius:m.role==="user"?"11px 11px 4px 11px":"11px 11px 11px 4px",padding:"9px 13px",fontSize:12,color:m.role==="user"?C.accent:C.text,lineHeight:1.75,whiteSpace:"pre-wrap"}}>{m.text}</div>
        </div>)}
        {loading&&<div style={{display:"flex",gap:5,padding:"6px 0",alignItems:"center"}}>
          {[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:"50%",background:C.accent,display:"inline-block",animation:`pulse 1.2s ${i*0.25}s infinite`}}/>)}
          <span style={{fontSize:11,color:C.muted,marginLeft:4}}>Analyzing...</span>
        </div>}
      </div>
      <div style={{padding:"11px 14px",borderTop:`1px solid ${C.border}`}}>
        <div style={{display:"flex",gap:7}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Ask your trading coach anything..." style={{...inp({height:36}),flex:1}}/>
          <button onClick={()=>send()} disabled={loading||!input.trim()} style={{...btnBase(),padding:"0 16px",background:C.accentBg,borderColor:C.accent,color:C.accent,fontWeight:700,height:36}}>Send</button>
        </div>
      </div>
    </Card>
    <div>
      <div style={{fontSize:10,color:C.dim,marginBottom:7,textTransform:"uppercase",letterSpacing:"0.07em"}}>Quick questions</div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {QUICK.map(q=><button key={q} onClick={()=>send(q)} style={{...btnBase(),fontSize:10,padding:"4px 11px",color:C.dim}}>{q}</button>)}
      </div>
    </div>
    <style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}`}</style>
  </div>;
}

// â”€â”€ CSV UTILS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AnalyticsView({trades}){
  const [behaviorRange,setBehaviorRange]=useState("ALL");
  const hourRef=useRef(),weekRef=useRef(),equityRef=useRef(),tradePnlRef=useRef();
  const {
    orderedTrades,
    pnls,
    stats,
    byHour,
    byWeek,
    hours,
    weekdayAnalysis,
    grossWins,
    grossLosses,
    mistakeRows,
    strengthRows,
    mistakePeak,
    strengthPeak,
    biggestWins,
    biggestLosses,
  }=useMemo(()=>{
    const ordered=[...trades].sort((a,b)=>getTradeDateTime(a)-getTradeDateTime(b));
    const nextPnls=ordered.map(calcPnl);
    const nextByHour={};
    const nextByWeek={0:0,1:0,2:0,3:0,4:0,5:0,6:0};

    ordered.forEach((trade,index)=>{
      const pnl=nextPnls[index];
      if(trade.entries[0]?.time){
        const hour=trade.entries[0].time.split(":")[0];
        if(!nextByHour[hour])nextByHour[hour]={pnl:0,n:0};
        nextByHour[hour].pnl+=pnl;
        nextByHour[hour].n++;
      }
      const dow=new Date(trade.date+"T12:00:00").getDay();
      nextByWeek[dow]=(nextByWeek[dow]||0)+pnl;
    });

    const behaviorTrades=behaviorRange==="ALL"
      ?ordered
      :ordered.filter(trade=>matchesDatePreset(trade,behaviorRange,getLatestTradeAnchorDate(ordered)));
    const nextMistakeRows=buildBehaviorRows(behaviorTrades,"mistakes")
      .sort((a,b)=>a.pnl-b.pnl||b.count-a.count||a.label.localeCompare(b.label));
    const nextStrengthRows=buildBehaviorRows(behaviorTrades,"positiveTags")
      .sort((a,b)=>b.pnl-a.pnl||b.count-a.count||a.label.localeCompare(b.label));
    const extremeTradeRows=ordered.map((trade,index)=>{
      const entryNotional=calcEntryNotional(trade);
      return{
        trade,
        pnl:nextPnls[index],
        entryNotional,
        roi:entryNotional?nextPnls[index]/entryNotional:null,
        hold:calcDur(trade),
      };
    });

    return{
      orderedTrades:ordered,
      pnls:nextPnls,
      stats:calcStats(ordered),
      byHour:nextByHour,
      byWeek:nextByWeek,
      hours:Object.keys(nextByHour).sort(),
      weekdayAnalysis:buildWeekdayAnalysis(ordered),
      grossWins:nextPnls.filter(pnl=>pnl>0).reduce((sum,pnl)=>sum+pnl,0),
      grossLosses:Math.abs(nextPnls.filter(pnl=>pnl<0).reduce((sum,pnl)=>sum+pnl,0)),
      mistakeRows:nextMistakeRows,
      strengthRows:nextStrengthRows,
      mistakePeak:Math.max(1,...nextMistakeRows.map(row=>Math.max(1,Math.abs(row.pnl)))),
      strengthPeak:Math.max(1,...nextStrengthRows.map(row=>Math.max(1,Math.abs(row.pnl)))),
      biggestWins:extremeTradeRows
        .filter(row=>row.pnl>0)
        .sort((a,b)=>b.pnl-a.pnl||((b.roi??-Infinity)-(a.roi??-Infinity)))
        .slice(0,5),
      biggestLosses:extremeTradeRows
        .filter(row=>row.pnl<0)
        .sort((a,b)=>a.pnl-b.pnl||((a.roi??Infinity)-(b.roi??Infinity)))
        .slice(0,5),
    };
  },[trades,behaviorRange,ACTIVE_THEME]);

  useEffect(()=>{
    if(!hourRef.current||!hours.length)return;
    const values=hours.map(hour=>byHour[hour].pnl);
    const ch=new Chart(hourRef.current.getContext("2d"),{
      type:"bar",
      data:{labels:hours.map(formatHourLabel),datasets:[{data:values,backgroundColor:values.map(value=>value>0?"rgba(34,197,94,0.76)":"rgba(239,68,68,0.72)"),borderRadius:10,borderSkipped:false,maxBarThickness:34}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:C.tooltipBg,displayColors:false}},scales:chartScales()},
    });
    return()=>ch.destroy();
  },[trades,ACTIVE_THEME]);

  useEffect(()=>{
    if(!weekRef.current)return;
    const values=[1,2,3,4,5].map(day=>byWeek[day]||0);
    const ch=new Chart(weekRef.current.getContext("2d"),{
      type:"bar",
      data:{labels:["Mon","Tue","Wed","Thu","Fri"],datasets:[{data:values,backgroundColor:values.map(value=>value>0?"rgba(59,130,246,0.80)":"rgba(239,68,68,0.72)"),borderRadius:10,borderSkipped:false,maxBarThickness:36}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:C.tooltipBg,displayColors:false}},scales:chartScales({hideXGrid:true})},
    });
    return()=>ch.destroy();
  },[trades,ACTIVE_THEME]);

  useEffect(()=>{
    if(!equityRef.current||!orderedTrades.length)return;
    const labels=["Start",...orderedTrades.map((trade,index)=>`${trade.date.slice(5)} #${index+1}`)];
    const ctx=equityRef.current.getContext("2d");
    const scales=chartScales();
    const ch=new Chart(ctx,{
      type:"line",
      data:{
        labels,
        datasets:[{
          label:"Equity",
          data:stats.curve,
          borderColor:C.accentStrong,
          borderWidth:3,
          fill:true,
          backgroundColor:createVerticalGradient(ctx,"rgba(59,130,246,0.24)","rgba(59,130,246,0.03)"),
          tension:0.38,
          pointRadius:0,
          pointHoverRadius:4,
          pointBackgroundColor:C.accentStrong,
        }],
      },
      options:{
        responsive:true,
        maintainAspectRatio:false,
        plugins:{
          legend:{display:false},
          tooltip:{
            backgroundColor:C.tooltipBg,
            padding:12,
            displayColors:false,
            callbacks:{label:value=>`Equity $${value.parsed.y.toFixed(0)}`},
          },
        },
        scales:{
          ...scales,
          x:{
            ...scales.x,
            ticks:{...scales.x.ticks,autoSkip:true,maxRotation:50,minRotation:50},
          },
        },
      },
    });
    return()=>ch.destroy();
  },[trades,ACTIVE_THEME]);

  useEffect(()=>{
    if(!tradePnlRef.current||!orderedTrades.length)return;
    const labels=orderedTrades.map((trade,index)=>`${trade.date.slice(5)} #${index+1}`);
    const scales=chartScales({hideXGrid:true});
    const ch=new Chart(tradePnlRef.current.getContext("2d"),{
      type:"bar",
      data:{
        labels,
        datasets:[{
          data:pnls,
          backgroundColor:pnls.map(pnl=>pnl>0?"rgba(74,222,128,0.92)":"rgba(248,113,113,0.92)"),
          borderRadius:8,
          borderSkipped:false,
          maxBarThickness:18,
        }],
      },
      options:{
        responsive:true,
        maintainAspectRatio:false,
        plugins:{
          legend:{display:false},
          tooltip:{backgroundColor:C.tooltipBg,displayColors:false},
        },
        scales:{
          ...scales,
          x:{
            ...scales.x,
            ticks:{...scales.x.ticks,autoSkip:true,maxRotation:0,minRotation:0},
          },
        },
      },
    });
    return()=>ch.destroy();
  },[trades,ACTIVE_THEME]);

  if(!trades.length)return<div style={{display:"flex",flexDirection:"column",gap:22,animation:"riseIn .45s ease both"}}>
    <EmptyState
      icon="pulse"
      title="No performance data yet"
      message="Log a few trades or import a CSV to unlock the monthly calendar, weekly summaries, and your streak analysis."
    />
  </div>;
  const winLossRatio=stats.avgWin/Math.max(1,stats.avgLoss);
  const [weekdaySummaryText,weekdayInsightText=""]=weekdayAnalysis.text.split("\n\nInsight:\n");
  const weekdaySummaryLines=weekdaySummaryText.split("\n").filter(Boolean);
  const [bestDayLine="",worstDayLine="",breakdownLabel="",...breakdownRows]=weekdaySummaryLines;
  const weekdayBest=weekdayAnalysis.best||{day:"N/A",totalPnl:0,trades:0,winRate:0};
  const weekdayWorst=weekdayAnalysis.worst||{day:"N/A",totalPnl:0,trades:0,winRate:0};
  const weekdayBreakdownLabel=breakdownLabel||"Breakdown";
  const weekdayEdge=Math.abs((weekdayBest.totalPnl||0)-(weekdayWorst.totalPnl||0));

  return<div style={{display:"flex",flexDirection:"column",gap:22,animation:"riseIn .45s ease both"}}>
    <Card accent={stats.totalPnl>=0?C.green:C.red} style={{padding:"24px 26px",background:`linear-gradient(135deg, ${C.surface} 0%, ${stats.totalPnl>=0?"rgba(34,197,94,0.10)":"rgba(239,68,68,0.08)"} 100%)`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:18,flexWrap:"wrap"}}>
        <div>
          <SLabel>Portfolio view</SLabel>
          <div style={{fontSize:40,fontWeight:800,color:stats.totalPnl>=0?C.green:C.red,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1,marginBottom:10}}>
            {fmtMoney(stats.totalPnl)}
          </div>
          <div style={{fontSize:14,color:C.muted,lineHeight:1.8,maxWidth:520}}>
            Net journal performance with a {fmtPct(stats.winRate)} win rate and {winLossRatio.toFixed(2)} average win/loss ratio.
          </div>
        </div>
        <div style={{padding:"16px 18px",borderRadius:18,background:C.surface,boxShadow:C.shadow,minWidth:240}}>
          <div style={{fontSize:11,fontWeight:800,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8}}>Amount of trades taken</div>
          <div style={{fontSize:30,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif"}}>{stats.decisiveTrades}</div>
          <div style={{fontSize:12,color:C.muted,marginTop:6}}>
            {stats.washes?`${stats.washes} wash trade${stats.washes!==1?"s":""} excluded from win/loss totals.`:"Tracked in this account journal."}
          </div>
        </div>
      </div>
    </Card>

    <Card style={{padding:"24px 24px 22px"}}>
      <SLabel>Streak profile</SLabel>
      <div style={{fontSize:14,color:C.muted,lineHeight:1.75,marginBottom:16}}>Current momentum and recent result durability across your journal.</div>
      <StreakView trades={trades}/>
    </Card>

    <Card>
      <div style={{display:"grid",gap:8}}>
        <SLabel>Weekday Performance</SLabel>
        <div style={{fontSize:14,color:C.muted,lineHeight:1.75,maxWidth:760}}>Overall Monday through Friday performance using the full journal, ranked by total P&amp;L and summarized for consistency.</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:16,marginTop:16,alignItems:"stretch"}}>
        <div style={{padding:"18px 20px",borderRadius:18,background:`linear-gradient(180deg, ${C.surfaceAlt}, ${C.surfaceSoft})`,boxShadow:`${C.shadow}, inset 0 0 0 1px rgba(148,163,184,0.10)`,display:"grid",gap:16,alignContent:"start"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12}}>
            <div style={{padding:"18px 18px",borderRadius:16,background:`linear-gradient(180deg, ${C.surface}, ${C.surfaceAlt})`,boxShadow:"inset 0 0 0 1px rgba(59,130,246,0.12)",display:"grid",gap:10,alignContent:"center",justifyItems:"center",textAlign:"center",minHeight:124}}>
              <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:800}}>Best Day</div>
              <div style={{fontSize:22,fontWeight:900,color:C.text,lineHeight:1.35,fontFamily:"'Sora','Manrope',sans-serif",letterSpacing:"-0.02em"}}>{bestDayLine}</div>
            </div>
            <div style={{padding:"18px 18px",borderRadius:16,background:`linear-gradient(180deg, ${C.surface}, ${C.surfaceAlt})`,boxShadow:"inset 0 0 0 1px rgba(239,68,68,0.12)",display:"grid",gap:10,alignContent:"center",justifyItems:"center",textAlign:"center",minHeight:124}}>
              <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:800}}>Worst Day</div>
              <div style={{fontSize:22,fontWeight:900,color:C.text,lineHeight:1.35,fontFamily:"'Sora','Manrope',sans-serif",letterSpacing:"-0.02em"}}>{worstDayLine}</div>
            </div>
          </div>

          <div style={{display:"grid",gap:10}}>
            <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800}}>{weekdayBreakdownLabel.replace(":","")}</div>
            <div style={{display:"grid",gap:8}}>
              {breakdownRows.map(line=><div key={line} style={{padding:"12px 14px",borderRadius:14,background:C.surface,boxShadow:"inset 0 0 0 1px rgba(148,163,184,0.10)"}}>
                <div style={{fontSize:18,fontWeight:900,color:C.text,lineHeight:1.4,fontFamily:"'Sora','Manrope',sans-serif",letterSpacing:"-0.015em"}}>{line}</div>
              </div>)}
            </div>
          </div>
        </div>
        <Card style={{padding:"18px 20px",background:`linear-gradient(180deg, ${C.surface}, ${C.surfaceAlt})`,boxShadow:`${C.shadow}, inset 0 0 0 1px rgba(148,163,184,0.10)`,alignSelf:"stretch",display:"grid",gap:16,alignContent:"start"}}>
          <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:12}}>Insight</div>
          <div style={{fontSize:26,fontWeight:900,color:C.text,lineHeight:1.32,fontFamily:"'Sora','Manrope',sans-serif",letterSpacing:"-0.025em"}}>{weekdayInsightText}</div>
          <div style={{display:"grid",gap:10,marginTop:2}}>
            <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800}}>Evidence</div>
            <div style={{display:"grid",gap:8}}>
              <div style={{padding:"12px 14px",borderRadius:14,background:C.surfaceSoft,boxShadow:"inset 0 0 0 1px rgba(148,163,184,0.10)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
                <span style={{fontSize:12,color:C.muted,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.08em"}}>{weekdayWorst.day}</span>
                <span style={{fontSize:18,fontWeight:900,color:C.red,fontFamily:"'Sora','Manrope',sans-serif",letterSpacing:"-0.02em"}}>{fmtMoney(weekdayWorst.totalPnl)}</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8}}>
                <div style={{padding:"12px 14px",borderRadius:14,background:C.surfaceSoft,boxShadow:"inset 0 0 0 1px rgba(148,163,184,0.10)"}}>
                  <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:800,marginBottom:6}}>Win Rate</div>
                  <div style={{fontSize:20,fontWeight:900,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",letterSpacing:"-0.02em"}}>{fmtPct(weekdayWorst.winRate)}</div>
                </div>
                <div style={{padding:"12px 14px",borderRadius:14,background:C.surfaceSoft,boxShadow:"inset 0 0 0 1px rgba(148,163,184,0.10)"}}>
                  <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:800,marginBottom:6}}>Trades</div>
                  <div style={{fontSize:20,fontWeight:900,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",letterSpacing:"-0.02em"}}>{weekdayWorst.trades}</div>
                </div>
              </div>
              <div style={{padding:"12px 14px",borderRadius:14,background:C.surfaceSoft,boxShadow:"inset 0 0 0 1px rgba(148,163,184,0.10)"}}>
                <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:800,marginBottom:6}}>Gap To Best Day</div>
                <div style={{fontSize:20,fontWeight:900,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",letterSpacing:"-0.02em"}}>{fmtMoney(weekdayEdge)}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:5,lineHeight:1.55}}>Best day is {weekdayBest.day} at {fmtMoney(weekdayBest.totalPnl)} across {weekdayBest.trades} trades.</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Card>

    {false&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
      <Metric label="Win Rate" value={fmtPct(stats.winRate)} icon="target" small sub={`${stats.wins} wins / ${stats.losses} losses`}/>
      <Metric label="Avg Win" value={fmtMoney(stats.avgWin)} color={C.green} icon="arrowUp" small sub="Average upside when right"/>
      <Metric label="Avg Loss" value={`-${fmtMoney(stats.avgLoss).replace(/^[-+]/,"")}`} color={C.red} icon="arrowDown" small sub="Average downside when wrong"/>
      <Metric label="Win/Loss Ratio" value={winLossRatio.toFixed(2)} color={winLossRatio>=1.5?C.green:winLossRatio>=1?C.amber:C.red} icon="layers" small sub="Size of winners vs losers"/>
    </div>}

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:18}}>
      <Card>
        <SLabel>P&amp;L by time of day</SLabel>
        <ChartBox h={220}><canvas ref={hourRef} role="img" aria-label="P&L by hour of day"/></ChartBox>
      </Card>
      <Card>
        <SLabel>P&amp;L by day of week</SLabel>
        <ChartBox h={220}><canvas ref={weekRef} role="img" aria-label="P&L by weekday"/></ChartBox>
      </Card>
    </div>

    <div style={{display:"flex",gap:18,flexWrap:"wrap",alignItems:"stretch"}}>
      <Card style={{flex:"1.35 1 640px",padding:"20px 20px 18px",display:"grid",gap:16}}>
        <div style={{display:"grid",gap:8}}>
          <SLabel>Performance Analysis</SLabel>
          <div style={{fontSize:24,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1.18,letterSpacing:"-0.03em"}}>Equity and per-trade performance</div>
          <div style={{fontSize:14,color:C.muted,lineHeight:1.75,maxWidth:720}}>A tighter read on how your equity curve and individual trades are interacting across the full journal.</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Pill label={`${stats.loggedTrades} trades`} color={C.accent}/>
          <Pill label={`Expectancy ${fmtMoney(stats.expectancy)}`} color={stats.expectancy>=0?C.green:C.red}/>
          <Pill label={`Gross wins ${fmtMoney(grossWins)}`} color={C.green}/>
          <Pill label={`Gross losses -$${grossLosses.toFixed(0)}`} color={C.red}/>
        </div>
        <div style={{display:"grid",gap:16}}>
          <div>
            <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:10}}>Equity Curve</div>
            <ChartBox h={280}><canvas ref={equityRef} role="img" aria-label="Analytics equity curve"/></ChartBox>
          </div>
          <div style={{height:1,background:C.border,opacity:0.7}}/>
          <div>
            <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:10}}>P&amp;L Per Trade</div>
            <ChartBox h={220}><canvas ref={tradePnlRef} role="img" aria-label="Analytics P&L per trade"/></ChartBox>
          </div>
        </div>
      </Card>

      <Card style={{flex:"0.92 1 360px",padding:"20px",display:"grid",gap:16}}>
        <div style={{display:"grid",gap:8}}>
          <SLabel>Trade Outcomes</SLabel>
          <div style={{fontSize:24,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1.18,letterSpacing:"-0.03em"}}>Outcome mix and capital impact</div>
          <div style={{fontSize:14,color:C.muted,lineHeight:1.75}}>A clean split between what is adding capital, what is taking it away, and how often the journal resolves decisively.</div>
        </div>
        <div style={{display:"grid",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}}>
            <div style={{padding:"16px 16px 14px",borderRadius:18,background:`linear-gradient(180deg, rgba(34,197,94,0.14), ${C.surface})`,boxShadow:`${C.shadow}, inset 0 0 0 1px rgba(34,197,94,0.18)`,display:"grid",gap:10}}>
              <div style={{fontSize:11,color:C.green,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800}}>Wins</div>
              <div style={{fontSize:34,fontWeight:900,color:C.green,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1}}>{stats.wins}</div>
              <div style={{fontSize:13,color:C.textSoft}}>Gross {fmtMoney(grossWins)}</div>
            </div>
            <div style={{padding:"16px 16px 14px",borderRadius:18,background:`linear-gradient(180deg, rgba(239,68,68,0.14), ${C.surface})`,boxShadow:`${C.shadow}, inset 0 0 0 1px rgba(239,68,68,0.18)`,display:"grid",gap:10}}>
              <div style={{fontSize:11,color:C.red,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800}}>Losses</div>
              <div style={{fontSize:34,fontWeight:900,color:C.red,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1}}>{stats.losses}</div>
              <div style={{fontSize:13,color:C.textSoft}}>Gross -${grossLosses.toFixed(0)}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10}}>
            <div style={{padding:"14px 14px 12px",borderRadius:16,background:C.surfaceAlt,boxShadow:"inset 0 0 0 1px rgba(148,163,184,0.10)",display:"grid",gap:8}}>
              <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800}}>Decisive</div>
              <div style={{fontSize:30,fontWeight:900,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1}}>{stats.decisiveTrades}</div>
            </div>
            <div style={{padding:"14px 14px 12px",borderRadius:16,background:C.surfaceAlt,boxShadow:"inset 0 0 0 1px rgba(148,163,184,0.10)",display:"grid",gap:8}}>
              <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800}}>Wash</div>
              <div style={{fontSize:30,fontWeight:900,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1}}>{stats.washes}</div>
            </div>
            <div style={{padding:"14px 14px 12px",borderRadius:16,background:C.surfaceAlt,boxShadow:"inset 0 0 0 1px rgba(148,163,184,0.10)",display:"grid",gap:8}}>
              <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800}}>Win %</div>
              <div style={{fontSize:30,fontWeight:900,color:C.amber,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1}}>{fmtPct(stats.winRate)}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <Card style={{padding:"20px",display:"grid",gap:16}}>
      <div style={{display:"grid",gap:8,justifyItems:"center",textAlign:"center"}}>
        <div style={{fontSize:24,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1.18,letterSpacing:"-0.03em"}}>Biggest Wins and Losses</div>
        <div style={{fontSize:14,color:C.muted,lineHeight:1.75,maxWidth:780}}>Largest winning trades are sorted from biggest win to smallest win. Largest losing trades are sorted from biggest loss to smallest loss, with both dollar impact and ROI shown for fast comparison.</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:16}}>
        <ExtremeTradesPanel
          title="Biggest Wins"
          description="Highest profit trades across the journal, ranked by total dollars made."
          rows={biggestWins}
          tone="win"
        />
        <ExtremeTradesPanel
          title="Biggest Losses"
          description="Largest drawdowns across the journal, ranked by total dollars lost."
          rows={biggestLosses}
          tone="loss"
        />
      </div>
    </Card>

    <Card style={{padding:"20px",display:"grid",gap:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:14,flexWrap:"wrap"}}>
        <div style={{display:"grid",gap:8}}>
          <SLabel>Behavior Panel</SLabel>
          <div style={{fontSize:24,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",lineHeight:1.18,letterSpacing:"-0.03em"}}>Behaviour Insights</div>
          <div style={{fontSize:14,color:C.muted,lineHeight:1.75,maxWidth:760}}>Uses only the tags you assign on trades. Mistake tags and positive tags are tracked separately, and notes only add context.</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {BEHAVIOR_RANGE_OPTIONS.map(option=>{
            const active=behaviorRange===option.key;
            return<button
              key={option.key}
              type="button"
              onClick={()=>startTransition(()=>setBehaviorRange(option.key))}
              style={{
                ...btnBase(),
                padding:"9px 12px",
                borderRadius:999,
                background:active?`linear-gradient(180deg, ${C.accent}, ${C.accentStrong})`:C.surfaceAlt,
                color:active?"#fff":C.textSoft,
                boxShadow:active?"0 14px 28px rgba(59,130,246,0.16)":"inset 0 0 0 1px rgba(148,163,184,0.10)",
                fontSize:12,
                fontWeight:800,
              }}
            >
              {option.label}
            </button>;
          })}
        </div>
      </div>
      <div style={{fontSize:12,color:C.muted,lineHeight:1.7}}>Only tags with at least {BEHAVIOR_MIN_SAMPLE_SIZE} trades appear here. Mistake tags stay in mistakes, positive tags stay in strengths, and both sections are ranked by total P&amp;L impact in the selected timeframe.</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:16}}>
        <div style={{display:"grid",gap:12,alignContent:"start"}}>
          <div style={{padding:"14px 16px",borderRadius:16,background:`linear-gradient(180deg, rgba(239,68,68,0.14), ${C.surface})`,boxShadow:`${C.shadow}, inset 0 0 0 1px rgba(239,68,68,0.16)`}}>
            <div style={{fontSize:11,color:C.red,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:6}}>Top Mistakes</div>
            <div style={{fontSize:20,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",marginBottom:4}}>Costing you money</div>
            <div style={{fontSize:13,color:C.muted,lineHeight:1.65}}>Ranked by biggest total loss, with frequent tagged behaviour pushed higher when totals tie.</div>
          </div>
          {mistakeRows.length
            ?mistakeRows.map((row,index)=>{
              const width=Math.max(14,(Math.abs(row.pnl)/mistakePeak)*100);
              return<div key={`mistake-${row.label}`} style={{padding:"16px 16px 14px",borderRadius:18,background:C.surfaceAlt,boxShadow:`${C.shadow}, inset 0 0 0 1px rgba(239,68,68,0.12)`,display:"grid",gap:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                  <div style={{display:"grid",gap:4}}>
                    <div style={{fontSize:18,fontWeight:800,color:C.text,lineHeight:1.35}}>{index+1}. {row.label}</div>
                    <div style={{fontSize:12,color:C.muted}}>{formatTradeCountLabel(row.count)} | Avg {fmtMoney(row.avgPnl)}</div>
                  </div>
                  <div style={{fontSize:14,fontWeight:900,color:C.red,whiteSpace:"nowrap"}}>{fmtMoney(row.pnl)}</div>
                </div>
                <div style={{height:8,borderRadius:999,background:C.surfaceSoft,overflow:"hidden",boxShadow:"inset 0 0 0 1px rgba(148,163,184,0.08)"}}>
                  <div style={{width:`${width}%`,height:"100%",borderRadius:999,background:"linear-gradient(90deg, #ff6f7d, #ff8b96)"}}/>
                </div>
                {(row.context||row.exampleNote)&&<div style={{fontSize:12,color:C.textSoft,lineHeight:1.7}}>
                  {row.context||"Tagged context available."}
                  {row.exampleNote?` Example note: "${row.exampleNote}"`:""}
                </div>}
              </div>;
            })
            :<div style={{padding:"18px 20px",borderRadius:18,background:C.surfaceAlt,boxShadow:"inset 0 0 0 1px rgba(239,68,68,0.10)",fontSize:14,color:C.muted,lineHeight:1.75}}>
              No mistake tags meet the {BEHAVIOR_MIN_SAMPLE_SIZE}-trade threshold in this timeframe.
            </div>}
        </div>

        <div style={{display:"grid",gap:12,alignContent:"start"}}>
          <div style={{padding:"14px 16px",borderRadius:16,background:`linear-gradient(180deg, rgba(34,197,94,0.14), ${C.surface})`,boxShadow:`${C.shadow}, inset 0 0 0 1px rgba(34,197,94,0.16)`}}>
            <div style={{fontSize:11,color:C.green,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:6}}>Top Strengths</div>
            <div style={{fontSize:20,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",marginBottom:4}}>Making you money</div>
            <div style={{fontSize:13,color:C.muted,lineHeight:1.65}}>Ranked by biggest total gain so you can see which tagged behaviours are actually paying.</div>
          </div>
          {strengthRows.length
            ?strengthRows.map((row,index)=>{
              const width=Math.max(14,(Math.abs(row.pnl)/strengthPeak)*100);
              return<div key={`strength-${row.label}`} style={{padding:"16px 16px 14px",borderRadius:18,background:C.surfaceAlt,boxShadow:`${C.shadow}, inset 0 0 0 1px rgba(34,197,94,0.12)`,display:"grid",gap:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                  <div style={{display:"grid",gap:4}}>
                    <div style={{fontSize:18,fontWeight:800,color:C.text,lineHeight:1.35}}>{index+1}. {row.label}</div>
                    <div style={{fontSize:12,color:C.muted}}>{formatTradeCountLabel(row.count)} | Avg {fmtMoney(row.avgPnl)}</div>
                  </div>
                  <div style={{fontSize:14,fontWeight:900,color:C.green,whiteSpace:"nowrap"}}>{fmtMoney(row.pnl)}</div>
                </div>
                <div style={{height:8,borderRadius:999,background:C.surfaceSoft,overflow:"hidden",boxShadow:"inset 0 0 0 1px rgba(148,163,184,0.08)"}}>
                  <div style={{width:`${width}%`,height:"100%",borderRadius:999,background:"linear-gradient(90deg, #33d17a, #60f0a4)"}}/>
                </div>
                {(row.context||row.exampleNote)&&<div style={{fontSize:12,color:C.textSoft,lineHeight:1.7}}>
                  {row.context||"Tagged context available."}
                  {row.exampleNote?` Example note: "${row.exampleNote}"`:""}
                </div>}
              </div>;
            })
            :<div style={{padding:"18px 20px",borderRadius:18,background:C.surfaceAlt,boxShadow:"inset 0 0 0 1px rgba(34,197,94,0.10)",fontSize:14,color:C.muted,lineHeight:1.75}}>
              No positive tags meet the {BEHAVIOR_MIN_SAMPLE_SIZE}-trade threshold in this timeframe.
            </div>}
        </div>
      </div>
    </Card>

    {false&&<Card>
      <SLabel>Directional edge</SLabel>
      <div style={{display:"grid",gap:12}}>
        {directionalRows.map(row=><div key={row.direction} style={{padding:"16px 18px",borderRadius:18,background:C.surfaceAlt,display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,flexWrap:"wrap"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <Pill label={row.direction} color={row.direction==="LONG"?C.accent:C.amber}/>
              <span style={{fontSize:12,color:C.muted}}>{row.n} trades</span>
            </div>
            <div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>
              {row.w} wins / {row.n-row.w} losses / {fmtPct(row.rate)} win rate
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:24,fontWeight:800,color:row.pnl>=0?C.green:C.red,fontFamily:"'Sora','Manrope',sans-serif"}}>{fmtMoney(row.pnl)}</div>
            <div style={{fontSize:12,color:C.muted}}>Net directional P&amp;L</div>
          </div>
        </div>)}
      </div>
    </Card>}

  </div>;
}

function StreakView({pnls,trades}){
  const sequence=Array.isArray(trades)&&trades.length
    ?[...trades]
      .sort((a,b)=>getTradeDateTime(a)-getTradeDateTime(b))
      .map(getTradeOutcome)
      .filter(outcome=>outcome!=="WASH")
      .map(outcome=>outcome==="WIN"?"W":"L")
    :(Array.isArray(pnls)?pnls:[]).map(pnl=>pnl>0?"W":"L");
  let cur=0,curType=null,maxW=0,maxL=0,w=0,l=0;
  sequence.forEach(type=>{
    if(type===curType)cur++;
    else{cur=1;curType=type;}
    if(type==="W"){w++;maxW=Math.max(maxW,cur);}
    else{l++;maxL=Math.max(maxL,cur);}
  });
  const streakColor=curType==="W"?C.green:curType==="L"?C.red:C.dim;
  return<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>
    <Metric label="Current Streak" value={curType?`${curType==="W"?"+":"-"}${cur}`:"0"} color={streakColor} icon={curType==="W"?"arrowUp":curType==="L"?"arrowDown":"layers"} small/>
    <Metric label="Max Win Streak" value={`${maxW}W`} color={C.green} icon="target" small/>
    <Metric label="Max Loss Streak" value={`${maxL}L`} color={C.red} icon="arrowDown" small/>
    <Metric label="Total Wins" value={w} color={C.green} icon="arrowUp" small/>
    <Metric label="Total Losses" value={l} color={C.red} icon="arrowDown" small/>
  </div>;
}

function ExtremeTradeRow({row,tone,index}){
  const accent=tone==="win"?C.green:C.red;
  const timeRange=formatTimeRange(row.trade.entries[0]?.time,row.trade.exits[0]?.time);
  return<div style={{padding:"16px 16px 14px",borderRadius:18,background:C.surfaceAlt,boxShadow:`${C.shadow}, inset 0 0 0 1px ${tone==="win"?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)"}`,display:"grid",gap:12}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:14}}>
      <div style={{display:"grid",gap:6,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <div style={{width:30,height:30,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:`${accent}15`,color:accent,fontSize:13,fontWeight:900,flex:"0 0 auto"}}>
            {index+1}
          </div>
          <div style={{fontSize:18,fontWeight:800,color:C.text,lineHeight:1.2,fontFamily:"'Sora','Manrope',sans-serif"}}>{row.trade.symbol}</div>
          <Pill label={getDirectionLabel(row.trade.direction)} color={getDirectionColor(row.trade.direction)} sm/>
          <Pill label={row.trade.strategy} color={C.purple} sm/>
        </div>
        <div style={{fontSize:12,color:C.muted,lineHeight:1.7}}>
          {row.trade.date}{timeRange?` | ${timeRange}`:""} | {row.trade.market}
        </div>
      </div>
      <div style={{textAlign:"right",display:"grid",gap:4,justifyItems:"end",flex:"0 0 auto"}}>
        <div style={{fontSize:20,fontWeight:900,color:accent,lineHeight:1,fontFamily:"'Sora','Manrope',sans-serif",letterSpacing:"-0.02em"}}>{fmtMoney(row.pnl)}</div>
        <div style={{fontSize:13,fontWeight:800,color:row.roi===null?C.dim:accent}}>
          {row.roi===null?"No ROI":fmtPct(row.roi)}
        </div>
      </div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <Pill label={row.entryNotional>0?`Entry $${row.entryNotional.toFixed(0)}`:"Entry N/A"} color={C.teal} sm/>
        {row.hold!==null&&<Pill label={`${fmtDuration(row.hold)} hold`} color="transparent" sm/>}
      </div>
    </div>
  </div>;
}

function ExtremeTradesPanel({title,description,rows,tone}){
  return<div style={{display:"grid",gap:12,alignContent:"start"}}>
    <div style={{padding:"14px 16px",borderRadius:16,background:`linear-gradient(180deg, ${tone==="win"?"rgba(34,197,94,0.14)":"rgba(239,68,68,0.14)"}, ${C.surface})`,boxShadow:`${C.shadow}, inset 0 0 0 1px ${tone==="win"?"rgba(34,197,94,0.16)":"rgba(239,68,68,0.16)"}`,display:"grid",gap:4,justifyItems:"center",textAlign:"center"}}>
      <div style={{fontSize:20,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif",marginBottom:4}}>{title}</div>
      <div style={{fontSize:13,color:C.muted,lineHeight:1.65}}>{description}</div>
    </div>
    {rows.length
      ?rows.map((row,index)=><ExtremeTradeRow key={`${tone}-${row.trade.id}`} row={row} tone={tone} index={index}/>)
      :<div style={{padding:"18px 20px",borderRadius:18,background:C.surfaceAlt,boxShadow:`inset 0 0 0 1px ${tone==="win"?"rgba(34,197,94,0.10)":"rgba(239,68,68,0.10)"}`,fontSize:14,color:C.muted,lineHeight:1.75}}>
        No {tone==="win"?"winning":"losing"} trades to rank yet.
      </div>}
  </div>;
}

function AICoach({trades}){
  const[msgs,setMsgs]=useState([{role:"ai",text:"I've analyzed your journal notes first and use mistake tags as a fallback. Ask about your best setup, the habits hurting expectancy, your best trading window, or request a full performance breakdown."}]);
  const[input,setInput]=useState("");
  const[loading,setLoading]=useState(false);
  const scrollRef=useRef();
  const {insights,stats}=useMemo(()=>({
    insights:buildCoachInsights(trades),
    stats:calcStats(trades),
  }),[trades,ACTIVE_THEME]);

  useEffect(()=>{if(scrollRef.current)scrollRef.current.scrollTop=scrollRef.current.scrollHeight;},[msgs]);

  const send=async(text)=>{
    const question=text||input;
    if(!question.trim()||loading)return;
    setInput("");
    setMsgs(current=>[...current,{role:"user",text:question}]);
    setLoading(true);
    await new Promise(resolve=>setTimeout(resolve,450));
    setMsgs(current=>[...current,{role:"ai",text:generateCoachReply(question,trades)}]);
    setLoading(false);
  };

  const QUICK=[
    "Give me a full performance analysis",
    "What patterns are hurting my P&L?",
    "What is my most profitable setup?",
    "Why do I keep exiting winners early?",
    "When should I be trading for best results?",
    "What rule would have the biggest impact on my results?",
  ];

  if(!trades.length)return<div style={{display:"flex",flexDirection:"column",gap:22,animation:"riseIn .45s ease both"}}>
    <PageIntro
      eyebrow="AI Coach"
      title="Private coaching built on your own journal"
      description="Ask for performance breakdowns, habit analysis, and concrete rules based on your actual trading history."
    />
    <EmptyState
      icon="bot"
      title="The coach needs trade data"
      message="Add or import a few trades first. Once the journal has real execution notes, the AI coach can surface patterns and suggest tighter rules."
    />
  </div>;

  return<div style={{display:"flex",flexDirection:"column",gap:22,animation:"riseIn .45s ease both"}}>
    <PageIntro
      eyebrow="AI Coach"
      title="A coaching workspace that feels product-grade"
      description="Review your strongest edge, then ask targeted questions in a cleaner chat experience built around your actual journal data."
    />

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
      {insights.map((insight,index)=><Card key={`${insight.title}-${index}`} accent={insight.color} style={{padding:"16px 18px",background:`linear-gradient(180deg, ${C.surface}, ${insight.color}08)`}}>
        <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
          <div style={{width:40,height:40,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",background:`${insight.color}12`,color:insight.color,fontWeight:800,fontSize:18}}>
            {insight.icon}
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:6}}>{insight.title}</div>
            <div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>{insight.text}</div>
          </div>
        </div>
      </Card>)}
      <Metric label="Journal Coverage" value={`${trades.length} trades`} icon="layers" small sub={`Net ${fmtMoney(stats.totalPnl)} tracked in this account`} trend={{label:"Live account context",tone:"positive"}}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.45fr) minmax(320px,0.9fr)",gap:18,alignItems:"start"}}>
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"18px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",gap:14,alignItems:"center",flexWrap:"wrap",background:`linear-gradient(180deg, ${C.surface}, ${C.surfaceAlt})`}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(180deg, #4f8cff, #2563eb)",boxShadow:"0 16px 30px rgba(59,130,246,0.22)"}}>
              <Icon name="bot" size={20} color="#fff"/>
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:C.text}}>MoskiPTP Coach</div>
              <div style={{fontSize:12,color:C.muted}}>Local journal intelligence across {trades.length} saved trade{trades.length!==1?"s":""}</div>
            </div>
          </div>
          <Pill label="Private analysis" color={C.teal}/>
        </div>

        <div ref={scrollRef} style={{height:420,overflowY:"auto",padding:"22px 20px",display:"flex",flexDirection:"column",gap:14,background:C.chatBg}}>
          {msgs.map((msg,index)=><div key={index} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"84%",display:"flex",gap:10,alignItems:"flex-end",flexDirection:msg.role==="user"?"row-reverse":"row"}}>
              <div style={{width:34,height:34,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:msg.role==="user"?C.accentBg:C.surface,boxShadow:C.shadow}}>
                <Icon name={msg.role==="user"?"user":"bot"} size={16} color={msg.role==="user"?C.accent:C.text}/>
              </div>
              <div style={{
                background:msg.role==="user"?"linear-gradient(180deg, #4f8cff, #2563eb)":C.surface,
                color:msg.role==="user"?"#fff":C.text,
                borderRadius:msg.role==="user"?"20px 20px 8px 20px":"20px 20px 20px 8px",
                padding:"14px 16px",
                boxShadow:C.shadow,
                fontSize:13,
                lineHeight:1.75,
                whiteSpace:"pre-wrap",
              }}>{msg.text}</div>
            </div>
          </div>)}
          {loading&&<div style={{display:"flex",alignItems:"center",gap:8,paddingLeft:44}}>
            {[0,1,2].map(index=><span key={index} style={{width:8,height:8,borderRadius:"50%",background:C.accent,display:"inline-block",animation:`pulseDot 1.2s ${index*0.2}s infinite`}}/>)}
            <span style={{fontSize:12,color:C.muted}}>Analyzing your journal...</span>
          </div>}
        </div>

        <div style={{padding:"18px 20px",borderTop:`1px solid ${C.border}`,background:C.surface}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Ask your coach about execution, setups, or recurring mistakes..." style={{...inp({height:52,borderRadius:999,padding:"0 18px"}),flex:1}}/>
            <button onClick={()=>send()} disabled={loading||!input.trim()} style={{...btnBase(),height:52,padding:"0 22px",borderRadius:999,background:"linear-gradient(180deg, #4f8cff, #2563eb)",color:"#fff",boxShadow:"0 18px 30px rgba(59,130,246,0.22)"}}>Send</button>
          </div>
        </div>
      </Card>

      <div style={{display:"grid",gap:18}}>
        <Card style={{padding:"20px 22px",background:`linear-gradient(180deg, ${C.surface}, ${C.surfaceAlt})`}}>
          <SLabel>Suggested prompts</SLabel>
          <div style={{display:"grid",gap:10}}>
            {QUICK.map(prompt=><button key={prompt} onClick={()=>send(prompt)} style={{...btnBase(),padding:"12px 14px",textAlign:"left",justifyContent:"flex-start",background:C.surface}}>
              {prompt}
            </button>)}
          </div>
        </Card>

        <Card>
          <SLabel>What this coach looks for</SLabel>
          <div style={{display:"grid",gap:12}}>
            {[
              "Which setup has the best win rate and net P&L.",
              "When your entries and exits are strongest across the day.",
              "Which recurring notes or mistakes are costing the most.",
              "What single rule would improve expectancy fastest.",
            ].map(line=><div key={line} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{width:26,height:26,borderRadius:9,background:C.accentBg,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Icon name="spark" size={13} color={C.accent}/>
              </div>
              <div style={{fontSize:13,color:C.textSoft,lineHeight:1.7}}>{line}</div>
            </div>)}
          </div>
        </Card>
      </div>
    </div>
  </div>;
}

function importCSV(text){
  try{
    const rows=parseCsvRows(text.trim());
    if(rows.length<2)return[];
    const headers=rows[0].map(normalizeHeader);

    return rows.slice(1).map((values,index)=>{
      const row=Object.fromEntries(headers.map((header,columnIndex)=>[header,values[columnIndex]?.trim()||""]));
      const qty=parseMaybeNumber(row.qty??row.quantity)??1;
      const realizedPnl=parseMaybeNumber(row.return??row.pnl??row.profit_loss);
      const strategy=(row.tags||row.strategy||row.setup||"")
        .split(/[|;/]/)
        .map(v=>v.trim())
        .find(Boolean)||"Other";

      return normalizeTrade({
        id:`csv-${Date.now()}-${index}-${Math.random().toString(36).slice(2,8)}`,
        date:row.entry_date||row.date||new Date().toISOString().slice(0,10),
        symbol:(row.symbol||row.ticker||"SPY").toUpperCase(),
        market:normalizeMarket(row.market),
        direction:normalizeDirection(row.side||row.direction),
        entries:[{
          price:parseMaybeNumber(row.entry??row.entry_price),
          qty,
          date:row.entry_date||row.date||"",
          time:row.time||row.entry_time||"09:30",
        }],
        exits:[{
          price:parseMaybeNumber(row.exit??row.exit_price),
          qty,
          date:row.exit_date||row.date_exit||row.closed_date||row.close_date||row.entry_date||row.date||"",
          time:row.exit_time||"",
        }],
        targetPrice:parseMaybeNumber(row.target??row.target_price)??"",
        stopLoss:parseMaybeNumber(row.stop??row.stop_loss)??"",
        fees:parseMaybeNumber(row.fees??row.commission)??0,
        realizedPnl,
        holdMinutes:parseHoldMinutes(row.hold??row.duration),
        strategy,
        mistakes:[],
        positiveTags:[],
        emotion:row.emotion||"Neutral",
        preTrade:"",
        postTrade:row.notes||"",
        csvStatus:row.status||"",
      });
    }).filter(Boolean);
  }catch{return[];}
}
function exportCSV(trades){
  const csvEscape=value=>{
    const text=String(value??"");
    return/[",\n]/.test(text)?`"${text.replace(/"/g,'""')}"`:text;
  };
  const money=value=>{
    const amount=parseMaybeNumber(value);
    if(amount===null)return"";
    const abs=Math.abs(amount).toFixed(2);
    return`${amount<0?"-":""}$${abs}`;
  };
  const percent=value=>{
    const amount=parseMaybeNumber(value);
    if(amount===null)return"";
    return`${amount.toFixed(2)}%`;
  };
  const plainNumber=value=>{
    const amount=parseMaybeNumber(value);
    if(amount===null)return"";
    return Number.isInteger(amount)?String(amount):amount.toFixed(2);
  };
  const exportMarket=value=>{
    switch(normalizeMarket(value).toUpperCase()){
      case"STOCKS":return"STOCK";
      case"OPTIONS":return"OPTION";
      case"FUTURES":return"FUTURE";
      default:return normalizeMarket(value).toUpperCase();
    }
  };
  const averagePrice=rows=>{
    const totalQty=rows.reduce((sum,row)=>sum+(+row.qty||0),0);
    if(!totalQty)return null;
    return rows.reduce((sum,row)=>sum+((+row.price||0)*(+row.qty||0)),0)/totalQty;
  };
  const columns=["Entry Date","Entry Time","Exit Date","Symbol","Market","Status","Side","Qty","Entry","Exit","Target","Ent Tot","Ext Tot","Pos","Hold","Return","Return %","Tags","Notes"];
  const rows=trades.map(trade=>{
    const qty=trade.entries.reduce((sum,row)=>sum+(+row.qty||0),0)||trade.exits.reduce((sum,row)=>sum+(+row.qty||0),0)||1;
    const entryAvg=averagePrice(trade.entries);
    const exitAvg=averagePrice(trade.exits);
    const entryTotal=entryAvg!==null?entryAvg*qty:null;
    const exitTotal=exitAvg!==null?exitAvg*qty:null;
    const pnl=calcPnl(trade);
    const hold=calcDur(trade);
    const returnPct=entryTotal?((pnl/entryTotal)*100):null;
    const notes=(trade.postTrade||trade.preTrade||"").trim();
    const status=getTradeOutcome(trade);

    return[
      trade.entries[0]?.date||trade.date||"",
      trade.entries[0]?.time||"",
      trade.exits[0]?.date||trade.date||"",
      trade.symbol||"",
      exportMarket(trade.market),
      status,
      getDirectionLabel(trade.direction),
      qty,
      money(entryAvg),
      money(exitAvg),
      plainNumber(trade.targetPrice),
      money(entryTotal),
      money(exitTotal),
      trade.direction==="SHORT"?"-":"+",
      hold!==null?`${hold} MIN`:"",
      money(pnl),
      percent(returnPct),
      trade.strategy||"",
      notes,
    ].map(csvEscape).join(",");
  });
  const content=`\uFEFF${[columns.join(","),...rows].join("\n")}`;
  const blob=new Blob([content],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download="trades_export.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// â”€â”€ APP ROOT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function App(){
  const[trades,setTrades]=useState([]);
  const[reflections,setReflections]=useState([]);
  const[dailyAiReviews,setDailyAiReviews]=useState([]);
  const[accountTransactions,setAccountTransactions]=useState([]);
  const[startingBalance,setStartingBalance]=useState(0);
  const[loaded,setLoaded]=useState(false);
  const[view,setView]=useState(getStoredView);
  const[theme,setTheme]=useState(getStoredTheme);
  const[selected,setSelected]=useState(null);
  const[editing,setEditing]=useState(null);
  const[showForm,setShowForm]=useState(false);
  const[accountModalOpen,setAccountModalOpen]=useState(false);
  const[toast,setToast]=useState(null);
  const[user,setUser]=useState(null);
  const[authToken,setAuthToken]=useState("");
  const[authSource,setAuthSource]=useState("");
  const[authMode,setAuthMode]=useState("login");
  const[authBusy,setAuthBusy]=useState(false);
  const[authError,setAuthError]=useState("");
  const[reflectionSaving,setReflectionSaving]=useState(false);
  const[aiReviewSaving,setAiReviewSaving]=useState(false);

  C=theme==="dark"?DARK_THEME:LIGHT_THEME;
  ACTIVE_THEME=theme;

  useEffect(()=>{
    storage.set(THEME_STORAGE_KEY,theme);
    if(typeof document==="undefined")return;
    document.documentElement.dataset.theme=theme;
    document.body.dataset.theme=theme;
    document.documentElement.style.colorScheme=theme;
    document.body.style.colorScheme=theme;
  },[theme]);

  useEffect(()=>{
    let active=true;

    const restoreSession=async()=>{
      const savedToken=storage.get(AUTH_TOKEN_KEY).value;
      const savedSource=storage.get(AUTH_SOURCE_KEY).value||"server";

      if(!savedToken){
        setLoaded(true);
        return;
      }

      try{
        const data=savedSource==="local"
          ?await localSession(savedToken)
          :await apiRequest("/api/auth/session",{token:savedToken});
        if(!active)return;
        await hydrateSession(savedToken,data.user,data.trades,savedSource,data.reflections,data.daily_ai_reviews,data.account_transactions,data.starting_balance);
      }catch(error){
        storage.remove(AUTH_TOKEN_KEY);
        storage.remove(AUTH_SOURCE_KEY);
        if(active){
          setAuthToken("");
          setAuthSource("");
          setUser(null);
          setTrades([]);
          setReflections([]);
          setDailyAiReviews([]);
          setAccountTransactions([]);
          setStartingBalance(0);
          setAccountModalOpen(false);
          clearActivePanels();
          if(!isServerUnavailableError(error)&&savedSource==="local")setAuthError(error.message||"Please log in again.");
        }
      }finally{
        if(active)setLoaded(true);
      }
    };

    restoreSession();
    return()=>{active=false;};
  },[]);
  useEffect(()=>{storage.set(VIEW_STORAGE_KEY,String(view));},[view]);

  const notify=(msg,color=C.green)=>{setToast({msg,color});setTimeout(()=>setToast(null),3000);};
  const clearActivePanels=()=>{setSelected(null);setEditing(null);setShowForm(false);};
  const openView=index=>{startTransition(()=>{setView(index);clearActivePanels();});};
  const openNewTrade=()=>{startTransition(()=>{setShowForm(true);setEditing(null);setSelected(null);});};
  const openTradeEditor=trade=>{startTransition(()=>{setEditing(trade);setSelected(null);setShowForm(true);});};
  const openTradeDetail=trade=>{startTransition(()=>{setSelected(trade);setEditing(null);setShowForm(false);});};
  const closeDetailView=()=>{startTransition(()=>setSelected(null));};
  const closeTradeForm=()=>{startTransition(()=>{setShowForm(false);setEditing(null);});};
  const openAccountModal=()=>startTransition(()=>setAccountModalOpen(true));
  const closeAccountModal=()=>startTransition(()=>setAccountModalOpen(false));
  const syncTrades=async(nextTrades,successMessage,successColor=C.green)=>{
    if(!authToken){
      notify("Your session has ended. Please log in again.",C.red);
      return false;
    }

    try{
      const data=authSource==="local"
        ?await localSaveTrades(authToken,nextTrades)
        :await apiRequest("/api/trades",{method:"PUT",token:authToken,body:{trades:nextTrades}});
      setTrades(normalizeTrades(data.trades));
      if(successMessage)notify(successMessage,successColor);
      return true;
    }catch(error){
      notify(error.message||"Unable to save trades.",C.red);
      return false;
    }
  };

  const syncAccountLedger=async(nextStartingBalance,nextTransactions,successMessage,successColor=C.green)=>{
    if(!authToken){
      notify("Your session has ended. Please log in again.",C.red);
      return false;
    }

    const payload={
      startingBalance:normalizeStartingBalance(nextStartingBalance),
      transactions:normalizeAccountTransactions(nextTransactions,user?.id),
    };

    try{
      const data=authSource==="local"
        ?await localSaveAccountLedger(authToken,payload)
        :await apiRequest("/api/account-transactions",{
          method:"PUT",
          token:authToken,
          body:{
            starting_balance:payload.startingBalance,
            account_transactions:payload.transactions,
          },
        });
      setStartingBalance(normalizeStartingBalance(data.starting_balance));
      setAccountTransactions(normalizeAccountTransactions(data.account_transactions,user?.id));
      if(user?.id)saveStoredAccountLedger(user.id,{
        startingBalance:data.starting_balance,
        transactions:data.account_transactions,
      });
      if(successMessage)notify(successMessage,successColor);
      return true;
    }catch(error){
      if(authSource!=="local"&&user?.id&&(isMissingAccountTransactionsRouteError(error)||isServerUnavailableError(error))){
        try{
          saveStoredAccountLedger(user.id,payload);
          setStartingBalance(payload.startingBalance);
          setAccountTransactions(payload.transactions);
          if(successMessage)notify(`${successMessage} Saved in this browser.`,C.amber);
          return true;
        }catch(storageError){
          notify(storageError.message||"Unable to save account transactions.",C.red);
          return false;
        }
      }
      notify(
        isMissingAccountTransactionsRouteError(error)
          ?"Account transactions API not available. Restart `npm run dev`, `npm run api`, or `npm run preview` so the backend loads `/api/account-transactions`."
          :(error.message||"Unable to save account transactions."),
        C.red,
      );
      return false;
    }
  };

  const syncReflection=async(nextReflection)=>{
    if(!authToken){
      notify("Your session has ended. Please log in again.",C.red);
      return false;
    }

    setReflectionSaving(true);
    try{
      const data=authSource==="local"
        ?await localSaveReflection(authToken,nextReflection)
        :await apiRequest("/api/reflections",{method:"PUT",token:authToken,body:{reflection:nextReflection}});
      setReflections(normalizeReflections(data.reflections,user?.id));
      notify("Daily reflection saved.");
      return true;
    }catch(error){
      notify(
        isMissingReflectionRouteError(error)
          ?"Reflections API not available. Restart `npm run dev`, `npm run api`, or `npm run preview` so the backend loads `/api/reflections`."
          :(error.message||"Unable to save reflection."),
        C.red,
      );
      return false;
    }finally{
      setReflectionSaving(false);
    }
  };

  const syncDailyAiReview=async({date,reflection})=>{
    if(!authToken){
      notify("Your session has ended. Please log in again.",C.red);
      return false;
    }

    setAiReviewSaving(true);
    try{
      const generatedReview=buildDailyAiReview({
        date,
        reflection,
        trades,
      });
      const data=authSource==="local"
        ?await localSaveDailyAiReview(authToken,generatedReview)
        :await apiRequest("/api/daily-ai-reviews",{method:"PUT",token:authToken,body:{review:generatedReview}});
      setDailyAiReviews(normalizeDailyAiReviews(data.daily_ai_reviews,user?.id));
      notify("AI daily review saved.");
      return true;
    }catch(error){
      notify(
        isMissingDailyAiReviewRouteError(error)
          ?"Daily AI review API not available. Restart `npm run dev`, `npm run api`, or `npm run preview` so the backend loads `/api/daily-ai-reviews`."
          :(error.message||"Unable to generate AI review."),
        C.red,
      );
      return false;
    }finally{
      setAiReviewSaving(false);
    }
  };

  const hydrateSession=async(nextToken,nextUser,nextTrades,nextSource="server",nextReflections=[],nextDailyAiReviews=[],nextAccountTransactions=[],nextStartingBalance=0)=>{
    storage.set(AUTH_TOKEN_KEY,nextToken);
    storage.set(AUTH_SOURCE_KEY,nextSource);
    setAuthToken(nextToken);
    setAuthSource(nextSource);
    setUser(nextUser);
    setReflections(normalizeReflections(nextReflections,nextUser?.id));
    setDailyAiReviews(normalizeDailyAiReviews(nextDailyAiReviews,nextUser?.id));
    const serverLedger={
      startingBalance:normalizeStartingBalance(nextStartingBalance),
      transactions:normalizeAccountTransactions(nextAccountTransactions,nextUser?.id),
    };
    const storedLedger=loadStoredAccountLedger(nextUser?.id);
    const hasServerLedger=serverLedger.transactions.length>0||serverLedger.startingBalance!==0;
    setAccountTransactions(hasServerLedger?serverLedger.transactions:storedLedger.transactions);
    setStartingBalance(hasServerLedger?serverLedger.startingBalance:storedLedger.startingBalance);

    const serverTrades=normalizeTrades(nextTrades);
    const legacyTrades=loadLegacyTradesFromStorage();

    if(!legacyTrades.length){
      clearLegacyTradeStorage();
      setTrades(serverTrades);
      return;
    }

    const merged=mergeTrades(serverTrades,legacyTrades).trades;

    if(merged.length===serverTrades.length){
      clearLegacyTradeStorage();
      setTrades(serverTrades);
      return;
    }

    try{
      const data=nextSource==="local"
        ?await localSaveTrades(nextToken,merged)
        :await apiRequest("/api/trades",{method:"PUT",token:nextToken,body:{trades:merged}});
      setTrades(normalizeTrades(data.trades));
      clearLegacyTradeStorage();
      notify("Moved your existing local trades into this account.");
    }catch(error){
      setTrades(serverTrades);
      notify(error.message||"Signed in, but local trade migration failed.",C.red);
    }
  };

  const handleLogin=async credentials=>{
    setAuthBusy(true);
    setAuthError("");

    try{
      let data;
      let source="server";
      let loginError=null;

      try{
        data=await apiRequest("/api/auth/login",{method:"POST",body:credentials});
      }catch(error){
        loginError=error;
        if(!isServerUnavailableError(error)&&!isInvalidCredentialsError(error))throw error;
        data=await localLogin(credentials);
        source="local";
      }

      await hydrateSession(data.token,data.user,data.trades,source,data.reflections,data.daily_ai_reviews,data.account_transactions,data.starting_balance);
      clearActivePanels();
      notify(source==="local"
        ?isServerUnavailableError(loginError)
          ?`Welcome back, ${data.user.username}. Running in local account mode.`
          :`Welcome back, ${data.user.username}. Signed in to your saved local account.`
        :`Welcome back, ${data.user.username}.`);
    }catch(error){
      setAuthError(error.message||"Unable to log in.");
    }finally{
      setAuthBusy(false);
    }
  };

  const handleRegister=async credentials=>{
    setAuthBusy(true);
    setAuthError("");

    try{
      let data;
      let source="server";

      try{
        data=await apiRequest("/api/auth/register",{method:"POST",body:credentials});
      }catch(error){
        if(!isServerUnavailableError(error))throw error;
        data=await localRegister(credentials);
        source="local";
      }

      await hydrateSession(data.token,data.user,data.trades,source,data.reflections,data.daily_ai_reviews,data.account_transactions,data.starting_balance);
      clearActivePanels();
      notify(source==="local"
        ?`Account created for ${data.user.username}. Using local account mode.`
        :`Account created for ${data.user.username}.`);
    }catch(error){
      setAuthError(error.message||"Unable to create account.");
    }finally{
      setAuthBusy(false);
    }
  };

  const logout=()=>{
    storage.remove(AUTH_TOKEN_KEY);
    storage.remove(AUTH_SOURCE_KEY);
    setAuthToken("");
    setAuthSource("");
    setUser(null);
    setReflections([]);
    setDailyAiReviews([]);
    setAccountTransactions([]);
    setStartingBalance(0);
    setAccountModalOpen(false);
    setAuthMode("login");
    setAuthError("");
    clearActivePanels();
    notify("Logged out. Your journal is still saved to this account.",C.amber);
  };
  const saveTrade=async t=>{
    const nextTrades=trades.find(x=>x.id===t.id)?trades.map(x=>x.id===t.id?t:x):[t,...trades];
    const saved=await syncTrades(nextTrades,editing?"Trade updated!":"Trade saved!");
    if(saved){
      setShowForm(false);
      setEditing(null);
    }
  };
  const deleteTrade=async id=>{
    const saved=await syncTrades(trades.filter(t=>t.id!==id),"Trade deleted.",C.red);
    if(saved)setSelected(null);
  };
  const resetJournal=async()=>{
    if(typeof window!=="undefined"&&!window.confirm("Clear all saved trades from this account?"))return;
    const saved=await syncTrades([],"Journal cleared.",C.red);
    if(saved)clearActivePanels();
  };
  const handleCSV=e=>{
    const f=e.target.files[0];
    if(!f)return;
    const r=new FileReader();

    r.onload=async ev=>{
      const imp=importCSV(ev.target.result);
      if(!imp.length){
        notify("No valid trades found in CSV.",C.red);
        return;
      }

      const result=mergeTrades(trades,imp);
      await syncTrades(
        result.trades,
        `Imported ${result.added} trade${result.added!==1?"s":""}${result.skipped?` | skipped ${result.skipped} duplicate${result.skipped!==1?"s":""}`:""}`,
      );
    };

    r.readAsText(f);
    e.target.value="";
  };

  const isForm=showForm||editing;
  const navView=!isForm&&!selected?view:-1;
  const renderKey=isForm?"form":selected?`detail-${selected.id}`:`view-${view}`;
  const renderMain=()=>{
    if(isForm)return<TradeForm initial={editing} onSave={saveTrade} onCancel={closeTradeForm}/>;
    if(selected)return<TradeDetail trade={selected} onBack={closeDetailView} onEdit={openTradeEditor} onDelete={deleteTrade}/>;
    if(view===0)return<DashboardWorkbenchView trades={trades} reflections={reflections} aiReviews={dailyAiReviews} onSaveReflection={syncReflection} onGenerateAiReview={syncDailyAiReview} reflectionSaving={reflectionSaving} aiReviewSaving={aiReviewSaving}/>;
    if(view===1)return<TradeLogView trades={trades} onSelect={openTradeDetail} onNew={openNewTrade} onEdit={openTradeEditor} onImportCSV={handleCSV} onExportCSV={()=>exportCSV(trades)} onResetJournal={resetJournal}/>;
    if(view===2)return<AnalyticsView trades={trades}/>;
    if(view===3)return<AICoach trades={trades}/>;
  };

  if(!loaded)return<div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
    <Card glass accent={C.accent} style={{padding:"28px 32px",display:"flex",alignItems:"center",gap:16,background:C.glassStrong,boxShadow:C.shadowLg}}>
      <div style={{width:54,height:54,borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(180deg, #4f8cff, #2563eb)",boxShadow:"0 18px 32px rgba(59,130,246,0.22)"}}>
        <Icon name="chart" size={24} color="#fff"/>
      </div>
      <div>
        <div style={{fontSize:18,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif"}}>{BRAND.name}</div>
        <div style={{fontSize:13,color:C.muted}}>Restoring your trading workspace...</div>
      </div>
    </Card>
  </div>;

  if(!user)return<>
    {toast&&<div style={{position:"fixed",top:18,right:18,background:C.surface,color:C.text,padding:"12px 16px",borderRadius:16,fontSize:12,fontWeight:700,zIndex:9999,boxShadow:C.shadowLg,borderLeft:`4px solid ${toast.color}`}}>{toast.msg}</div>}
    <AuthScreen
      mode={authMode}
      onModeChange={mode=>{setAuthMode(mode);setAuthError("");}}
      onLogin={handleLogin}
      onRegister={handleRegister}
      loading={authBusy}
      error={authError}
      theme={theme}
      onToggleTheme={()=>setTheme(current=>current==="dark"?"light":"dark")}
    />
  </>;

  return<div style={{background:C.bg,minHeight:"100vh",color:C.text,fontSize:14}}>
    {toast&&<div style={{position:"fixed",top:18,right:18,background:C.surface,color:C.text,padding:"12px 16px",borderRadius:16,fontSize:12,fontWeight:700,zIndex:9999,boxShadow:C.shadowLg,borderLeft:`4px solid ${toast.color}`}}>{toast.msg}</div>}
    <div style={{background:C.headerGlass,backdropFilter:"blur(16px)",borderBottom:`1px solid ${C.border}`,boxShadow:C.shadow}}>
      <div style={{maxWidth:1280,margin:"0 auto",padding:"16px 16px 18px"}}>
        <div style={{display:"grid",gap:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:18,flexWrap:"wrap"}}>
            <div onClick={()=>openView(0)} style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
              <div style={{width:46,height:46,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(180deg, #4f8cff, #2563eb)",boxShadow:"0 16px 30px rgba(59,130,246,0.22)"}}>
                <Icon name="chart" size={21} color="#fff"/>
              </div>
              <div>
                <div style={{fontSize:18,fontWeight:800,color:C.text,fontFamily:"'Sora','Manrope',sans-serif"}}>{BRAND.name}</div>
                <div style={{fontSize:12,color:C.muted}}>{BRAND.tagline}</div>
              </div>
            </div>

            <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",justifyContent:"flex-end",marginLeft:"auto"}}>
              <ThemeToggleButton theme={theme} onToggle={()=>setTheme(current=>current==="dark"?"light":"dark")}/>
              <Pill label={authSource==="local"?"Local mode":"Cloud sync"} color={authSource==="local"?C.amber:C.teal} sm/>
              <button
                type="button"
                onClick={openAccountModal}
                style={{
                  ...btnBase(),
                  padding:"10px 14px",
                  borderRadius:18,
                  background:C.surfaceAlt,
                  boxShadow:C.shadow,
                  display:"flex",
                  alignItems:"center",
                  gap:10,
                  textAlign:"left",
                }}
              >
                <div style={{width:36,height:36,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",background:C.accentBg}}>
                  <Icon name="user" size={16} color={C.accent}/>
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:C.text}}>{user.username}</div>
                  <div style={{fontSize:11,color:C.muted}}>{trades.length} trades saved</div>
                </div>
              </button>
            </div>
          </div>

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,flexWrap:"wrap"}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              {VIEWS.map((label,index)=><button key={label} onClick={()=>openView(index)} style={{
                ...btnBase(),
                padding:"11px 14px",
                borderRadius:999,
                background:navView===index?`linear-gradient(180deg, ${C.accent}, ${C.accentStrong})`:C.surface,
                color:navView===index?"#fff":C.muted,
                boxShadow:navView===index?"0 16px 30px rgba(59,130,246,0.20)":C.shadow,
                transform:navView===index?"translateY(-1px)":"translateY(0)",
              }}>{label}</button>)}
            </div>

            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",justifyContent:"flex-end",marginLeft:"auto"}}>
              <button onClick={logout} style={{...btnBase(),padding:"10px 14px",borderRadius:999,display:"inline-flex",alignItems:"center",gap:8,background:C.redBg,color:C.red}}>
                <Icon name="logout" size={15} color={C.red}/>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div style={{padding:"28px 16px 48px"}}>
      <div style={{maxWidth:1280,margin:"0 auto"}}>
        <ViewErrorBoundary key={renderKey} onReset={()=>openView(1)}>
          {renderMain()}
        </ViewErrorBoundary>
      </div>
    </div>
    <AccountTransactionsModal
      open={accountModalOpen}
      user={user}
      tradesCount={trades.length}
      startingBalance={startingBalance}
      transactions={accountTransactions}
      trades={trades}
      onClose={closeAccountModal}
      onSaveLedger={syncAccountLedger}
    />
  </div>;
}

export default App;


