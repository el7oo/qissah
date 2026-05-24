const puppeteer = require('puppeteer');

async function test() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Pick a random category to find a product
  await page.goto('https://ecomix.vip/categories', { waitUntil: 'networkidle2' });
  const productUrl = await page.evaluate(() => {
    // Just find any link containing /product/
    const a = document.querySelector('a[href*="/product/"]');
    return a ? a.href : null;
  });

  if (!productUrl) {
    console.log('No product found on categories page? Let us try a direct URL if we know one, or just search links.');
    // fallback
    await page.goto('https://ecomix.vip/', { waitUntil: 'networkidle2' });
    const fallbackUrl = await page.evaluate(() => {
      const a = document.querySelector('a[href*="/product/"]');
      return a ? a.href : null;
    });
    if (!fallbackUrl) {
      console.log('Could not find any product URL.');
      await browser.close();
      return;
    }
    await page.goto(fallbackUrl, { waitUntil: 'networkidle2' });
  } else {
    await page.goto(productUrl, { waitUntil: 'networkidle2' });
  }

  const images = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('img, picture source'));
    return all.map(img => ({
      tag: img.tagName,
      src: img.src,
      dataSrc: img.getAttribute('data-src'),
      className: img.className
    }));
  });

  console.log('All images found on the product page:');
  console.dir(images, { depth: null });
  await browser.close();
}

test();
