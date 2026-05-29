const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1280, height: 800 });
  
  await page.goto('https://ecomix.vip/Speaker_Mini_Portable/product/728655070', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 5000));
  
  await page.screenshot({ path: 'C:\\Users\\AL MQna3\\.gemini\\antigravity-ide\\brain\\1a985f33-e415-48e5-b574-501e813423cc\\ecomix_screenshot.png', fullPage: true });
  await browser.close();
  console.log('Screenshot saved.');
}
run();
