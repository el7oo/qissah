const puppeteer = require('puppeteer');
const { createClient } = require('@sanity/client');
const axios = require('axios');

const client = createClient({
  projectId: 'orlcqc8n',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-05-19',
  token: 'skazU0Rsj3mjdHt3iEtKNIhdnxA7HCr4KCbhEM8wUKuGVi2O3oNQKMNPGJ28aDAKLvEyMgKlVKb6DJD1srECtZ8op2HdpdxRT0efEZ8oZ9hjKMEGKr9opFeqAGmLdOVIks57fTb56EI24vEA29nBST72wu7px1z331qLryhH6U1RptarAGKi'
});

function premiumTitleCleaner(title) {
  let cleaned = title
    .replace(/[☆★]/g, '') 
    .replace(/\s\d+\s*تقييمات/g, '')
    .replace(/0 تقييمات/g, '') 
    .replace(/\b(نوعية ممتازة|ممتازة|أصلي|جديد|تخفيض|شحن مجاني)\b/g, '') 
    .replace(/[-\+]/g, ' ') 
    .replace(/\n/g, ' ') 
    .replace(/\s{2,}/g, ' ') 
    .trim();
    
  return cleaned;
}

function slugify(text) {
  return text.toLowerCase().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '') || Math.random().toString(36).substring(7);
}

async function uploadImageFromUrl(url, retries = 3) {
  if (!url || url.includes('data:image') || url.includes('placeholder')) return null;
  let fullUrl = url.startsWith('/') ? 'https://ecomix.vip' + url : url;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(fullUrl, { responseType: 'arraybuffer', timeout: 30000 });
      const buffer = Buffer.from(response.data, 'binary');
      const asset = await client.assets.upload('image', buffer, {
        filename: fullUrl.split('/').pop().split('?')[0] || 'luxury-product.jpg'
      });
      return asset._id;
    } catch (err) {
      console.log(`     ⚠️ فشل تحميل الصورة، محاولة ${i + 1} من ${retries}...`);
      await new Promise(res => setTimeout(res, 3000));
    }
  }
  return null;
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 250;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if(totalHeight >= scrollHeight - window.innerHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

async function scrapeAndImport() {
  console.log('🚀 بدء تشغيل بوت Ecomix V5.0 (المثالي)...');
  
  let shippingProfileId = null;
  const profiles = await client.fetch(`*[_type == "shippingProfile" && (title match "فايب" || title match "vibe" || title match "Vibe")]`);
  if (profiles.length > 0) {
    shippingProfileId = profiles[0]._id;
    console.log(`✅ تم العثور على ملف الشحن: ${profiles[0].title}`);
  }

  let failedUrls = [];

  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  try {
    console.log('🌐 جاري سحب الأقسام...');
    await page.goto('https://ecomix.vip/categories', { waitUntil: 'networkidle2', timeout: 90000 });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const categories = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a.category-tile'));
      return links.map(a => ({
        title: a.getAttribute('title') || a.innerText.trim(),
        url: a.href,
        icon: '📌'
      })).filter(c => c.title !== '');
    });
    console.log(`تم العثور على ${categories.length} قسم`);
    
    for (const cat of categories) {
      if (cat.title.includes('بالجملة')) continue;
        
      console.log(`\n========================================`);
      console.log(`📂 القسم الحالي: ${cat.title}`);
      
      let sanityCategoryId = null;
      const existingCat = await client.fetch(`*[_type == "category" && title == $title][0]`, { title: cat.title });
      if (existingCat) {
        sanityCategoryId = existingCat._id;
      } else {
        const newCat = await client.create({ _type: 'category', title: cat.title, slug: { _type: 'slug', current: slugify(cat.title) }, icon: cat.icon });
        sanityCategoryId = newCat._id;
      }
      
      let currentPage = 1;
      let hasNextPage = true;
      let emptyPagesCount = 0; // if we get 2 empty pages in a row, then break.
      
      while (hasNextPage) {
        const pageUrl = `${cat.url}?page=${currentPage}`;
        console.log(`📄 فحص الصفحة ${currentPage}...`);
        
        await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 90000 });
        
        try {
          // Wait longer, up to 15s for the page to render completely
          await page.waitForSelector('a', { timeout: 15000 });
        } catch(e) {}

        await autoScroll(page); 
        await new Promise(r => setTimeout(r, 2000)); 
        
        // Extract basic product info from category page to be faster
        const productsBasic = await page.evaluate(() => {
          // Try multiple selectors that Ecomix might use
          const items = Array.from(document.querySelectorAll('.p-tile, .product a, .p-card a, a[href*="/product/"]'));
          return items.map(item => {
            const linkEl = item.tagName === 'A' ? item : item.querySelector('a');
            return linkEl ? linkEl.href : null;
          }).filter(url => url !== null && url.includes('/product/'));
        });
        
        if (productsBasic.length === 0) {
            emptyPagesCount++;
            if (emptyPagesCount >= 2) { // 2 empty pages in a row means it's really the end
               console.log(`⚠️ انتهت الصفحات في هذا القسم بشكل مؤكد.`);
               hasNextPage = false;
               break;
            } else {
               console.log(`⚠️ الصفحة تبدو فارغة، سنحاول الصفحة التي تليها للتأكد...`);
               currentPage++;
               continue;
            }
        }
        
        emptyPagesCount = 0; // reset

        console.log(`🎯 تم العثور على ${productsBasic.length} منتج. سيتم رفعها...`);
        
        for (const pUrl of productsBasic) {
          const pPage = await browser.newPage();
          try {
            await pPage.goto(pUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
            
            // Wait for the SPA to render the product details
            try {
               await pPage.waitForFunction(() => document.querySelector('h1') || document.querySelector('.product-title') || document.querySelector('.price'), { timeout: 15000 });
            } catch(e) {}
            
            
            const pData = await pPage.evaluate(() => {
              const titleEl = document.querySelector('h1') || document.querySelector('.product-title');
              const priceEl = document.querySelector('.price') || document.querySelector('.product-price');
              const descEl = document.querySelector('.description') || document.querySelector('.product-details');
              
              const titleRaw = titleEl ? titleEl.innerText : '';
              const descRaw = descEl ? descEl.innerText : '';
              
              // Prices fix: remove commas used as thousands separators, then extract numbers
              const priceText = priceEl ? priceEl.innerText : '';
              let noDecimals = priceText.replace(/\.00(?!\d)/g, '');
              let justNumbers = noDecimals.replace(/[.,]/g, '');
              const numbers = justNumbers.match(/\d+/g) || [];
              const possiblePrices = numbers.map(Number).filter(n => n > 99); 
              
              let currentPrice = possiblePrices[0] || 0;
              let oldPrice = possiblePrices[1] || 0;
              
              if (oldPrice === 0 && currentPrice > 0) {
                 // Fake discount: +15%
                 oldPrice = Math.round(currentPrice * 1.15);
                 // Round to nearest 100 for aesthetics (e.g. 3450 -> 3500)
                 oldPrice = Math.ceil(oldPrice / 100) * 100;
              } else if (currentPrice > oldPrice && oldPrice !== 0) { 
                 let t = oldPrice; oldPrice = currentPrice; currentPrice = t; 
              }
              
              // ALL images on page that look like product images
              const allImgEls = Array.from(document.querySelectorAll('img'));
              let galleryUrls = allImgEls
                .map(img => img.getAttribute('data-src') || img.src)
                .filter(src => src && 
                  !src.includes('logo') && 
                  !src.includes('footer') && 
                  !src.includes('avatar') && 
                  !src.includes('icon') && 
                  !src.includes('banner') &&
                  (src.match(/\.(jpeg|jpg|png|webp|gif)/i) || src.includes('uploads') || src.includes('product'))
                );
              
              if (galleryUrls.length === 0) {
                  const mainImg = document.querySelector('meta[property="og:image"]');
                  if (mainImg) galleryUrls.push(mainImg.content);
              }
              
              return { titleRaw, descRaw, currentPrice, oldPrice, images: [...new Set(galleryUrls)] };
            });
            
            await pPage.close(); 
            
            if (!pData.titleRaw || pData.currentPrice === 0) continue; 
            
            const cleanTitle = premiumTitleCleaner(pData.titleRaw);
            
            const existingProduct = await client.fetch(`*[_type == "product" && title == $title][0]`, { title: cleanTitle });
            if (existingProduct) {
              continue; 
            }
            
            console.log(`   🎁 رفع منتج: ${cleanTitle}`);
            
            let mainImageRef = null;
            let galleryRefs = [];
            
            if (pData.images.length > 0) {
                mainImageRef = await uploadImageFromUrl(pData.images[0]);
                for (let i = 1; i < pData.images.length; i++) { // No image limit
                    const gRef = await uploadImageFromUrl(pData.images[i]);
                    if (gRef) galleryRefs.push({ _type: 'image', _key: Math.random().toString(36).substring(7), asset: { _type: 'reference', _ref: gRef }});
                }
            }
            
            const productDoc = {
              _type: 'product',
              title: cleanTitle,
              slug: { _type: 'slug', current: slugify(cleanTitle) },
              price: pData.currentPrice, // The selling price
              discountPrice: pData.oldPrice, // The crossed-out price
              description: pData.descRaw.trim(),
              category: sanityCategoryId ? { _type: 'reference', _ref: sanityCategoryId } : undefined,
              stockStatus: 'in_stock',
              deliveryType: 'home'
            };
            
            if (shippingProfileId) productDoc.shippingProfile = { _type: 'reference', _ref: shippingProfileId };
            if (mainImageRef) productDoc.mainImage = { _type: 'image', asset: { _type: 'reference', _ref: mainImageRef } };
            if (galleryRefs.length > 0) productDoc.gallery = galleryRefs;
            
            await client.create(productDoc);
            
            console.log(`✅ الإسم: ${cleanTitle}`);
            console.log(`✅ السعر: تم (${pData.currentPrice} دج)`);
            console.log(`✅ الوصف: تم`);
            console.log(`✅ التوصيل: تم (vibe)`);
            console.log(`✅ الصور: تم رفع ${galleryRefs.length + (mainImageRef ? 1 : 0)} صورة بنجاح`);
            console.log(`----------------------------------------`);
          } catch(e) {
            console.log(`   ❌ خطأ في المنتج (تم الحفظ في القائمة الفاشلة): ${pUrl}`);
            failedUrls.push(pUrl);
            try { await pPage.close(); } catch(err){}
          }
        }
        
        console.log(`✅ انتهت الصفحة ${currentPage}`);
        currentPage++;
      }
    }
    console.log('\n🌟🌟🌟 انتهى السحب بنجاح!');
    
    if (failedUrls.length > 0) {
       console.log('\n========================================');
       console.log(`🚨 الروابط التي فشل البوت في رفعها (${failedUrls.length} رابط):`);
       failedUrls.forEach(url => console.log(`- ${url}`));
       console.log('يرجى رفعها يدويا!');
       console.log('========================================\n');
    }
  } catch (error) {
    console.error('❌ خطأ فادح:', error.message);
  } finally {
    await browser.close();
  }
}

scrapeAndImport();
