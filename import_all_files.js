const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'orlcqc8n',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-05-19',
  token: 'skazU0Rsj3mjdHt3iEtKNIhdnxA7HCr4KCbhEM8wUKuGVi2O3oNQKMNPGJ28aDAKLvEyMgKlVKb6DJD1srECtZ8op2HdpdxRT0efEZ8oZ9hjKMEGKr9opFeqAGmLdOVIks57fTb56EI24vEA29nBST72wu7px1z331qLryhH6U1RptarAGKi'
});

const categoryMap = {
  'هواتف.txt': 'phones',
  'منتجات الصيف.txt': 'clothing',
  'معدات العمل.txt': 'work',
  'لوازم المطبخ.txt': 'kitchen',
  'لوازم التخيم.txt': 'camping',
  'صحة ولياقة.txt': 'care',
  'صحة و جمال.txt': 'care',
  'زيوت ومستخلصات.txt': 'oils',
  'حقائب.txt': 'bags',
  'ترفيه.txt': 'entertainment',
  'امن و مراقبة.txt': 'security',
  'البسة.txt': 'clothing',
  'اكسسوارات سيارات.txt': 'carAcc',
  'اطفال و امومة.txt': 'baby',
  'اجهزة كهرومنزلية.txt': 'homeApp',
  'اثاث وديكور.txt': 'decor'
};

async function uploadImageFromUrl(url, retries = 3) {
  if (!url || url.includes('data:image') || url.includes('placeholder')) return null;
  let fullUrl = url.startsWith('/') ? 'https://ecomix.vip' + url : url;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(fullUrl, { responseType: 'arraybuffer', timeout: 20000 });
      const buffer = Buffer.from(response.data, 'binary');
      const asset = await client.assets.upload('image', buffer, { filename: 'product-img.jpg' });
      return asset._id;
    } catch (err) {
      await new Promise(res => setTimeout(res, 2000));
    }
  }
  return null;
}

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function run() {
  console.log('🚀 بدء السحب الشامل من الملفات النصية المخصصة...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(60000);

  const vibeRes = await client.fetch('*[_type == "shippingProfile"][0]._id');
  const vibeProfileId = vibeRes || '28ae66c2-a63b-4faa-a47a-e96a781486c8';

  const files = Object.keys(categoryMap);

  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.log(`⚠️ الملف ${file} غير موجود. جاري تخطيه...`);
      continue;
    }

    const categoryId = categoryMap[file];
    const urls = fs.readFileSync(file, 'utf8').split('\n').map(u => u.trim()).filter(u => u.startsWith('http'));
    
    console.log(`\n================================`);
    console.log(`📂 قسم: ${categoryId} (${file}) - عدد الروابط: ${urls.length}`);
    console.log(`================================`);

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`⏳ [${i+1}/${urls.length}] سحب: ${url}`);
      
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => document.querySelector('h1') || document.querySelector('.product-title') || document.querySelector('.price'), { timeout: 15000 }).catch(()=>{});
        
        const pData = await page.evaluate(() => {
          const titleEl = document.querySelector('h1') || document.querySelector('.product-title');
          const priceEl = document.querySelector('.price') || document.querySelector('.product-price');
          const descEl = document.querySelector('.description') || document.querySelector('.product-details');
          
          let titleRaw = titleEl ? titleEl.innerText : null;
          let descRaw = descEl ? descEl.innerText : null;
          let priceText = priceEl ? priceEl.innerText : '';
          
          let noDecimals = priceText.replace(/\.00(?!\d)/g, '');
          let justNumbers = noDecimals.replace(/[.,]/g, '');
          const numbers = justNumbers.match(/\d+/g) || [];
          const possiblePrices = numbers.map(Number).filter(n => n > 99); 
          let currentPrice = possiblePrices[0] || 0;

          const imgEls = Array.from(document.querySelectorAll('.gallery img, .product-images img, .slick-slide img, .swiper-slide img, .pleceholder-zoomer-base-container img, .preload-img, .lazy-img'));
          let galleryUrls = imgEls.map(img => img.getAttribute('data-src') || img.src).filter(src => src && !src.includes('avatar') && !src.includes('logo') && !src.includes('footer'));
          
          if (galleryUrls.length === 0) {
              const mainImg = document.querySelector('img.preload-img') || document.querySelector('img.lazy-img') || document.querySelector('.main-image img');
              if (mainImg) galleryUrls.push(mainImg.getAttribute('data-src') || mainImg.src);
          }
          return { titleRaw, descRaw, currentPrice, images: [...new Set(galleryUrls)] };
        });

        if (!pData.titleRaw || pData.currentPrice === 0) {
          console.log('   ⚠️ خطأ: لم يتم العثور على اسم المنتج أو السعر.');
          continue;
        }

        let cleanTitle = pData.titleRaw.replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
        let currentPrice = pData.currentPrice;
        let finalPrice = Math.round(currentPrice * 1.15); // Add 15% automatically
        let oldPrice = finalPrice + 900;
        let pSlug = slugify(cleanTitle);

        const existing = await client.fetch(`*[_type == "product" && slug.current == $slug][0]`, { slug: pSlug });
        if (existing) {
            console.log(`   ⚠️ تخطي: المنتج "${cleanTitle}" موجود مسبقاً.`);
            continue;
        }

        let mainImageRef = null;
        let galleryRefs = [];
        if (pData.images.length > 0) {
            mainImageRef = await uploadImageFromUrl(pData.images[0]);
            for (let imgUrl of pData.images.slice(1, 4)) {
                let ref = await uploadImageFromUrl(imgUrl);
                if (ref) galleryRefs.push({ _type: 'image', _key: Math.random().toString(36).substring(7), asset: { _type: 'reference', _ref: ref } });
            }
        }

        const newProduct = {
            _type: 'product',
            title: cleanTitle,
            slug: { _type: 'slug', current: pSlug },
            price: oldPrice, // Original price (higher)
            discountPrice: finalPrice, // Current selling price (lower)
            shippingProfile: { _type: 'reference', _ref: vibeProfileId },
            stockStatus: 'in_stock',
            description: pData.descRaw || cleanTitle,
            categoryId: categoryId,
        };

        if (mainImageRef) newProduct.mainImage = { _type: 'image', asset: { _type: 'reference', _ref: mainImageRef } };
        if (galleryRefs.length > 0) newProduct.gallery = galleryRefs;

        await client.create(newProduct);
        console.log(`   ✨ تم الرفع بنجاح: ${cleanTitle}`);
        console.log(`     ✅ الوصف: ${pData.descRaw ? 'موجود ومسحوب' : 'غير موجود (تم استخدام الاسم)'}`);
        console.log(`     ✅ الصور: تم سحب ${galleryRefs.length + (mainImageRef ? 1 : 0)} صور`);
        console.log(`     ✅ السعر: تم الحساب (${finalPrice} د.ج بدل ${oldPrice} د.ج)`);
        console.log(`     ✅ التوصيل: مربوط بملف الشحن Vibe بنجاح`);

      } catch (e) {
        console.log(`   ❌ خطأ: ${e.message}`);
      }
    }
  }

  console.log('🎉 انتهى السحب المخصص بنجاح!');
  await browser.close();
}

run();
