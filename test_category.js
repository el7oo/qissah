const puppeteer = require('puppeteer');

async function test() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://vanessia.shop/product/bras-mixeur-marque-contiglobal-inox/', { waitUntil: 'domcontentloaded' });
  
  const cat = await page.evaluate(() => {
    // try standard woocommerce category
    const postedIn = document.querySelector('.posted_in a');
    if (postedIn) return postedIn.innerText;
    
    // try breadcrumb
    const breadcrumbs = document.querySelectorAll('.woocommerce-breadcrumb a');
    if (breadcrumbs.length > 1) return breadcrumbs[breadcrumbs.length - 1].innerText;
    
    return null;
  });
  
  console.log('Category found:', cat);
  await browser.close();
}

test();
