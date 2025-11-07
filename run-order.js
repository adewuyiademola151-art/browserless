import "dotenv/config";
import { chromium } from "playwright-core";

function getWsEndpoints() {
  const token = process.env.BROWSERLESS_TOKEN || process.env.BROWSERLESS_API_TOKEN;
  if (!token) throw new Error("Missing BROWSERLESS_TOKEN");
  const region = (process.env.BROWSERLESS_REGION || "").trim();
  const hosts = [];
  if (region) hosts.push(`wss://${region}.browserless.io?token=${token}`);
  hosts.push(`wss://production-sfo.browserless.io?token=${token}`);
  hosts.push(`wss://chrome.browserless.io?token=${token}`);
  hosts.push(`wss://playwright.browserless.io/?token=${token}`); // fallback
  return hosts;
}

async function connectBrowserless() {
  let lastErr;
  for (const ws of getWsEndpoints()) {
    try {
      console.log("Trying:", ws);
      return await chromium.connect(ws, { timeout: 30000 });
    } catch (e) {
      console.warn("Failed:", e?.message || e);
      lastErr = e;
    }
  }
  throw lastErr || new Error("Could not connect to Browserless");
}

export async function runJob(payload = {}) {
  const browser = await connectBrowserless();
  const context = await browser.newContext();
  const page = await context.newPage();

  // TODO: replace this with your Okta + Predictive Ordering flow
  await page.goto("https://example.com", { waitUntil: "domcontentloaded" });
  const title = await page.title();

  await context.close();
  await browser.close();

  return { message: "Done", title, payloadUsed: payload };
}
