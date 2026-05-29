const puppeteer = require('puppeteer');

async function testScrape() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  page.on('response', async (response) => {
    if (response.request().resourceType() === 'xhr' || response.request().resourceType() === 'fetch') {
        const url = response.url();
        if (url.includes('product') || url.includes('api')) {
            console.log('API Call:', url);
        }
    }
  });
  
  const url = 'https://vanessia.shop/product/bras-mixeur-marque-contiglobal-inox/';
  console.log(`Navigating to ${url}`);
  
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 5000));
  
  const html = await page.content();
  const fs = require('fs');
  fs.writeFileSync('debug.html', html);
  console.log('Saved to debug.html');
  await browser.close();
}

testScrape();
