import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  console.log("Navigating to page...");
  await page.goto('http://localhost:5173/');
  
  // Wait for initial animations
  await page.waitForTimeout(2000);
  
  // Scroll down slowly to trigger all whileInView animations
  console.log("Scrolling to trigger animations...");
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let i = 0; i < height; i += 400) {
    await page.evaluate((y) => window.scrollTo(0, y), i);
    await page.waitForTimeout(400);
  }
  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);
  
  console.log("Capturing light theme...");
  await page.screenshot({ path: 'landing-light.png', fullPage: true });
  
  console.log("Toggling dark theme...");
  // Click the theme toggle button (first button in nav)
  await page.locator('nav button').first().click();
  await page.waitForTimeout(1500);
  
  console.log("Capturing dark theme...");
  await page.screenshot({ path: 'landing-dark.png', fullPage: true });
  
  await browser.close();
  console.log("Done!");
})();
