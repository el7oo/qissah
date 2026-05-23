const puppeteer = require('puppeteer');

async function checkEcomixImages() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://ecomix.vip', { waitUntil: 'networkidle2' });
  
  // click first product
  const firstProduct = await page.$('a.p-tile, .product a, .p-card a');
  if (firstProduct) {
    const href = await page.evaluate(el => el.href, firstProduct);
    console.log('Navigating to', href);
    await page.goto(href, { waitUntil: 'networkidle2' });
    
    const imgs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        dataSrc: img.getAttribute('data-src'),
        class: img.className
      }));
    });
    console.log(imgs.slice(0, 15));
  } else {
    console.log('No product found');
  }
  await browser.close();
}

checkEcomixImages();
