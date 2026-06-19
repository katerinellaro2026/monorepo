import { chromium, type Browser, type BrowserContext } from 'playwright';

const USER_AGENT =
  process.env.SCRAPING_USER_AGENT ?? 'InmoDataIA-Bot/1.0 (contact@inmodata.ia)';

let browser: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

export async function newContext(): Promise<BrowserContext> {
  const b = await getBrowser();
  return b.newContext({
    userAgent: USER_AGENT,
    locale: 'es-PE',
    timezoneId: 'America/Lima',
    viewport: { width: 1280, height: 800 },
    extraHTTPHeaders: {
      'Accept-Language': 'es-PE,es;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    },
  });
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
