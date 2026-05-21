const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://ecomix.vip/kidsclothes23/product/785411143', { waitUntil: 'domcontentloaded' });
  try {
     await page.waitForFunction(() => document.querySelector('h1') || document.querySelector('.product-title') || document.querySelector('.price'), { timeout: 15000 });
  } catch(e) {}
  
  
  const pData = await page.evaluate(() => {
    const titleEl = document.querySelector('h1') || document.querySelector('.product-title');
    const priceEl = document.querySelector('.price') || document.querySelector('.product-price');
    const descEl = document.querySelector('.description') || document.querySelector('.product-details');
    
    const titleRaw = titleEl ? titleEl.innerText : null;
    const descRaw = descEl ? descEl.innerText : null;
    
    const priceText = priceEl ? priceEl.innerText : null;
    let noDecimals = priceText ? priceText.replace(/\.00(?!\d)/g, '') : '';
    let justNumbers = noDecimals.replace(/[.,]/g, '');
    const numbers = justNumbers.match(/\d+/g) || [];
    const possiblePrices = numbers.map(Number).filter(n => n > 99); 
    
    let currentPrice = possiblePrices[0] || 0;
    
    const imgEls = Array.from(document.querySelectorAll('img'));
    let galleryUrls = imgEls.map(img => ({
      src: img.getAttribute('data-src') || img.src,
      className: img.className,
      parentClassName: img.parentElement ? img.parentElement.className : ''
    })).filter(o => o.src && !o.src.includes('avatar') && !o.src.includes('logo') && !o.src.includes('footer'));
    
    return { imagesInfo: galleryUrls };
  });

  console.log(pData);
  await browser.close();
})();
