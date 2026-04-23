import { chromium } from "playwright";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const screenshotDir = join(__dirname, "..", "tmp", "screenshots");

async function takeScreenshots() {
	await mkdir(screenshotDir, { recursive: true });
	
	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({
		viewport: { width: 1440, height: 900 },
	});
	const page = await context.newPage();
	
	const baseUrl = process.env.APP_URL || "http://localhost:4173";
	
	// Landing page
	await page.goto(baseUrl);
	await page.waitForTimeout(2000);
	await page.screenshot({ path: join(screenshotDir, "01-landing.png"), fullPage: false });
	console.log("✓ Landing page screenshot");
	
	// Scroll down on landing for more content
	await page.evaluate(() => window.scrollBy(0, 800));
	await page.waitForTimeout(500);
	await page.screenshot({ path: join(screenshotDir, "02-landing-scroll.png"), fullPage: false });
	console.log("✓ Landing page scrolled screenshot");
	
	// Our Why page
	await page.goto(`${baseUrl}/our-why`);
	await page.waitForTimeout(1500);
	await page.screenshot({ path: join(screenshotDir, "03-our-why.png"), fullPage: false });
	console.log("✓ Our Why page screenshot");
	
	// Broker Portal
	await page.goto(`${baseUrl}/broker-portal`);
	await page.waitForTimeout(1500);
	await page.screenshot({ path: join(screenshotDir, "04-broker-portal.png"), fullPage: false });
	console.log("✓ Broker Portal screenshot");
	
	// Contact page
	await page.goto(`${baseUrl}/contact`);
	await page.waitForTimeout(1500);
	await page.screenshot({ path: join(screenshotDir, "05-contact.png"), fullPage: false });
	console.log("✓ Contact page screenshot");
	
	// Browse page (need to enter broker code first)
	// Set the session storage for broker auth
	await page.goto(`${baseUrl}/broker-portal`);
	await page.waitForTimeout(1000);
	await page.evaluate(() => {
		sessionStorage.setItem("brokerAuth", "true");
		sessionStorage.setItem("brokerName", "Demo Agent");
	});
	await page.goto(`${baseUrl}/browse`);
	await page.waitForTimeout(2000);
	await page.screenshot({ path: join(screenshotDir, "06-browse.png"), fullPage: false });
	console.log("✓ Browse page screenshot");
	
	await browser.close();
	console.log("\nAll screenshots saved to:", screenshotDir);
}

takeScreenshots().catch(console.error);
