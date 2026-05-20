const puppeteer = require('puppeteer');

async function testVanessia() {
  console.log('Testing Vanessia...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://vanessia.shop/categories', { waitUntil: 'networkidle2' });
  
  const categories = await page.evaluate(() => {
    // Try ecomix structure
    let links = Array.from(document.querySelectorAll('a.category-tile'));
    if (links.length === 0) {
      links = Array.from(document.querySelectorAll('.category-item a, .cat-wrap a, .category-box a'));
    }
    
    return links.map(a => ({
      title: a.getAttribute('title') || a.innerText.trim(),
      url: a.href
    })).filter(c => c.title !== '');
  });
  
  console.log(categories);
  await browser.close();
}

testVanessia();
