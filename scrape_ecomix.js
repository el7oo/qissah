const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeEcomix() {
  console.log('🚀 بدء تشغيل بوت سحب المنتجات من Ecomix...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  try {
    console.log('🌐 جاري الدخول إلى الأقسام...');
    await page.goto('https://ecomix.vip/categories', { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Extract categories
    const categories = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a.category-tile'));
      return links.map(a => ({
        title: a.getAttribute('title') || a.innerText.trim(),
        url: a.href,
        image: a.querySelector('img')?.getAttribute('data-src') || a.querySelector('img')?.src
      })).filter(c => c.title !== '');
    });
    
    console.log(`📦 تم العثور على ${categories.length} قسم!`);
    console.log(categories.slice(0, 5)); // Show first 5
    
    fs.writeFileSync('ecomix_categories.json', JSON.stringify(categories, null, 2));
    
    if (categories.length > 0) {
      const targetCategory = categories[0];
      console.log(`\n🔍 جاري الدخول إلى قسم: ${targetCategory.title} وسحب المنتجات...`);
      await page.goto(targetCategory.url, { waitUntil: 'networkidle2', timeout: 60000 });
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const products = await page.evaluate(() => {
        // Find product elements
        const items = Array.from(document.querySelectorAll('.p-tile'));
        return items.map(item => {
          const titleEl = item.querySelector('.item-title') || item.querySelector('.title');
          const priceEl = item.querySelector('.price');
          const imgEl = item.querySelector('img');
          const linkEl = item.querySelector('a');
          return {
            title: titleEl ? titleEl.innerText.trim() : '',
            price: priceEl ? priceEl.innerText.replace(/[^0-9.]/g, '') : '',
            image: imgEl ? (imgEl.getAttribute('data-src') || imgEl.src) : '',
            url: linkEl ? linkEl.href : ''
          };
        }).filter(p => p.title !== '');
      });
      
      console.log(`💎 تم العثور على ${products.length} منتج في هذا القسم!`);
      fs.writeFileSync('ecomix_products.json', JSON.stringify(products, null, 2));
      console.log(products.slice(0, 3)); // Show first 3
    }
    
  } catch (error) {
    console.error('❌ حدث خطأ أثناء السحب:', error.message);
  } finally {
    console.log('⏳ جاري إغلاق المتصفح...');
    await browser.close();
  }
}

scrapeEcomix();
