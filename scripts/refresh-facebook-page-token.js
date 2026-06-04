const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env");
const graphApiVersion = process.env.GRAPH_API_VERSION || "v23.0";

function loadDotEnv(file) {
  if (!fs.existsSync(file)) return {};
  const values = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalsAt = trimmed.indexOf("=");
    if (equalsAt === -1) continue;
    const key = trimmed.slice(0, equalsAt).trim();
    let value = trimmed.slice(equalsAt + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[key] = value;
    if (!process.env[key]) process.env[key] = value;
  }
  return values;
}

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Add it to .env before running this script.`);
  return value;
}

async function graphGet(pathname, params) {
  const url = new URL(`https://graph.facebook.com/${graphApiVersion}/${pathname}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body.error ? `${body.error.message} (code ${body.error.code || "unknown"})` : response.statusText;
    throw new Error(message);
  }
  return body;
}

function tokenExpiryLabel(tokenData) {
  const expiresAt = Number(tokenData?.expires_at || 0);
  if (!expiresAt) return "Never / no expiry returned";
  return new Date(expiresAt * 1000).toISOString();
}

async function debugToken(inputToken, appId, appSecret) {
  return graphGet("debug_token", {
    input_token: inputToken,
    access_token: `${appId}|${appSecret}`
  });
}

function upsertEnv(file, updates) {
  const existing = fs.existsSync(file) ? fs.readFileSync(file, "utf8").split(/\r?\n/) : [];
  const seen = new Set();
  const next = existing.map((line) => {
    const match = line.match(/^([^=#\s][^=]*)=/);
    if (!match) return line;
    const key = match[1].trim();
    if (!(key in updates)) return line;
    seen.add(key);
    return `${key}=${updates[key]}`;
  });

  for (const [key, value] of Object.entries(updates)) {
    if (!seen.has(key)) next.push(`${key}=${value}`);
  }

  fs.writeFileSync(file, `${next.filter((line, index, all) => line || index < all.length - 1).join("\n")}\n`, "utf8");
}

async function main() {
  loadDotEnv(envPath);

  const appId = required("META_APP_ID");
  const appSecret = required("META_APP_SECRET");
  const shortLivedUserToken = required("FB_USER_ACCESS_TOKEN");
  const pageId = required("FB_PAGE_ID");

  console.log("Exchanging short-lived user token for long-lived user token...");
  const longLived = await graphGet("oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLivedUserToken
  });

  const longLivedUserToken = longLived.access_token;
  const userDebug = await debugToken(longLivedUserToken, appId, appSecret);
  console.log(`Long-lived user token valid: ${userDebug.data?.is_valid === true}`);
  console.log(`Long-lived user token expires: ${tokenExpiryLabel(userDebug.data)}`);

  console.log("Requesting Page Access Token...");
  const accounts = await graphGet("me/accounts", {
    fields: "id,name,access_token",
    access_token: longLivedUserToken
  });

  const page = (accounts.data || []).find((item) => String(item.id) === String(pageId));
  if (!page?.access_token) {
    const available = (accounts.data || []).map((item) => `${item.name} (${item.id})`).join(", ") || "none";
    throw new Error(`Page ${pageId} was not returned by /me/accounts. Available pages: ${available}`);
  }

  const pageDebug = await debugToken(page.access_token, appId, appSecret);
  console.log(`Page token page: ${page.name} (${page.id})`);
  console.log(`Page token valid: ${pageDebug.data?.is_valid === true}`);
  console.log(`Page token type: ${pageDebug.data?.type || "unknown"}`);
  console.log(`Page token expires: ${tokenExpiryLabel(pageDebug.data)}`);

  if (pageDebug.data?.is_valid !== true) {
    throw new Error("Meta returned a Page token, but debug_token says it is not valid.");
  }

  upsertEnv(envPath, {
    GRAPH_API_VERSION: graphApiVersion,
    FB_PAGE_ID: pageId,
    FB_USER_ACCESS_TOKEN: longLivedUserToken,
    FB_PAGE_ACCESS_TOKEN: page.access_token
  });

  console.log(".env updated with FB_USER_ACCESS_TOKEN and FB_PAGE_ACCESS_TOKEN.");
  console.log("Now run: node scripts\\FB_Post.js");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
