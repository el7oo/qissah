const puppeteer = require('puppeteer');
const fs = require('fs');

async function testVanessia() {
  console.log('Fetching Vanessia main page...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://vanessia.shop', { waitUntil: 'networkidle2' });
  
  const html = await page.content();
  fs.writeFileSync('vanessia_main.html', html);
  console.log('Saved to vanessia_main.html');
  await browser.close();
}

testVanessia();
