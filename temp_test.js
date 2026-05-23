const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto('https://ecomix.vip/product/%d8%b7%d8%a7%d9%82%d9%85-%d8%ba%d8%b7%d8%a7%d8%a1-%d8%b3%d8%b1%d9%8a%d8%b1-%d8%a8%d9%86%d9%85%d8%b7-%d8%a3%d9%88%d8%b1%d8%a7%d9%82-%d8%a7%d9%84%d8%b4%d8%ac%d8%b1', {waitUntil: 'networkidle2'});
  const urls = await page.evaluate(() => {
    let imgs = [];
    if (window.__NUXT__) {
       try {
         const json = JSON.stringify(window.__NUXT__);
         const matches = json.match(/https:\/\/tenants\.toggaar\.net\/uploads\/[^\"]+/g);
         if (matches) imgs = [...imgs, ...matches];
       } catch(e){}
    }
    document.querySelectorAll('img').forEach(img => imgs.push(img.src || img.getAttribute('data-src')));
    return [...new Set(imgs)];
  });
  console.log(urls);
  await browser.close();
})();
