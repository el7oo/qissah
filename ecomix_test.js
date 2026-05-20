const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://ecomix.vip/categories');
  const html = await page.content();
  console.log(html.substring(0, 1000));
  await browser.close();
})();
