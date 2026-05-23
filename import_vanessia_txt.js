const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'orlcqc8n',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-05-19',
  token: 'skazU0Rsj3mjdHt3iEtKNIhdnxA7HCr4KCbhEM8wUKuGVi2O3oNQKMNPGJ28aDAKLvEyMgKlVKb6DJD1srECtZ8op2HdpdxRT0efEZ8oZ9hjKMEGKr9opFeqAGmLdOVIks57fTb56EI24vEA29nBST72wu7px1z331qLryhH6U1RptarAGKi'
});

const MAX_IMAGES = 6; // حد أقصى 6 صور لكل منتج

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
  let fullUrl = url.startsWith('/') ? 'https://vanessia.shop' + url : url;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(fullUrl, { responseType: 'arraybuffer', timeout: 20000 });
      const buffer = Buffer.from(response.data, 'binary');
      const asset = await client.assets.upload('image', buffer, {
        filename: fullUrl.split('/').pop().split('?')[0] || 'luxury-product.jpg'
      });
      return asset._id;
    } catch (err) {
      if (i < retries - 1) await new Promise(res => setTimeout(res, 2000));
    }
  }
  return null;
}

async function scrapeVanessiaUrls() {
  if (!fs.existsSync('vanessia.txt')) {
    console.log('❌ ملف vanessia.txt غير موجود.');
    return;
  }
  
  // قراءة الروابط وتصفيتها (تجاهل روابط الأقسام)
  const urls = fs.readFileSync('vanessia.txt', 'utf8')
    .split('\n')
    .map(u => u.trim())
    .filter(u => u && !u.includes('/product-category/') && !u.startsWith('//'));

  if (urls.length === 0) {
    console.log('⚠️ لا يوجد روابط منتجات صالحة في الملف!');
    return;
  }

  console.log(`\n╔══════════════════════════════════════════════════╗`);
  console.log(`║  🚀 بوت Vanessia V6.0 - الإصدار المطور          ║`);
  console.log(`║  📦 إجمالي المنتجات: ${String(urls.length).padEnd(28)}║`);
  console.log(`║  📸 الحد الأقصى للصور: ${MAX_IMAGES} صور لكل منتج          ║`);
  console.log(`╚══════════════════════════════════════════════════╝\n`);
  
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // جلب إعدادات الشحن
  let shippingProfileId = null;
  try {
    const profiles = await client.fetch(`*[_type == "shippingProfile" && (title match "vibe" || title match "Vibe")]{_id, title}`);
    if (profiles.length > 0) {
      shippingProfileId = profiles[0]._id;
      console.log(`📦 تم العثور على ملف التوصيل: "${profiles[0].title}"\n`);
    } else {
      console.log(`⚠️ لم يتم العثور على ملف توصيل باسم "vibe"، سيتم المتابعة بدونه.\n`);
    }
  } catch(e) {
    console.log(`⚠️ خطأ في جلب ملف التوصيل: ${e.message}\n`);
  }

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < urls.length; i++) {
    const pUrl = urls[i];
    const progress = `[${i+1}/${urls.length}]`;
    console.log(`\n⏳ ${progress} سحب منتج: ${pUrl}`);
    
    try {
      await page.goto(pUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      // انتظار تحميل العناصر
      await page.waitForFunction(() => document.querySelector('h1') || document.querySelector('.product_title'), { timeout: 15000 }).catch(()=>{});

      const pData = await page.evaluate(() => {
        const titleEl = document.querySelector('h1.product_title') || document.querySelector('h1');
        const priceEl = document.querySelector('p.price') || document.querySelector('.price');
        const descEl = document.querySelector('#tab-description') || document.querySelector('.woocommerce-product-details__short-description');
        
        const titleRaw = titleEl ? titleEl.innerText : '';
        const descRaw = descEl ? descEl.innerText : '';
        
        const priceText = priceEl ? priceEl.innerText : '';
        let noDecimals = priceText.replace(/\.00(?!\d)/g, '');
        let justNumbers = noDecimals.replace(/[.,]/g, '');
        const numbers = justNumbers.match(/\d+/g) || [];
        const possiblePrices = numbers.map(Number).filter(n => n > 99); 
        
        let currentPrice = possiblePrices[0] || 0;
        let oldPrice = possiblePrices[1] || 0;
        
        if (oldPrice === 0 && currentPrice > 0) {
           oldPrice = Math.round(currentPrice * 1.15);
           oldPrice = Math.ceil(oldPrice / 100) * 100;
        } else if (currentPrice > oldPrice && oldPrice !== 0) { 
           let t = oldPrice; oldPrice = currentPrice; currentPrice = t; 
        }
        
        // سحب جميع صور المعرض
        const imgEls = Array.from(document.querySelectorAll('.woocommerce-product-gallery__image a, .woocommerce-product-gallery__image img'));
        let galleryUrls = imgEls
          .map(img => img.getAttribute('href') || img.src || img.getAttribute('data-src'))
          .filter(src => src && !src.includes('avatar') && !src.includes('placeholder') && !src.includes('data:image'));
        
        // إذا لم نجد صور في المعرض نبحث عن أي صور منتج
        if (galleryUrls.length === 0) {
          const allImgs = Array.from(document.querySelectorAll('img'));
          galleryUrls = allImgs
            .map(img => img.getAttribute('data-src') || img.src)
            .filter(src => src && 
              !src.includes('logo') && !src.includes('footer') && 
              !src.includes('avatar') && !src.includes('icon') && 
              !src.includes('data:image') &&
              src.match(/\.(jpeg|jpg|png|webp|gif)/i)
            );
        }

        return { titleRaw, descRaw, currentPrice, oldPrice, images: [...new Set(galleryUrls)] };
      });
      
      if (!pData.titleRaw || pData.currentPrice === 0) {
        console.log(`   ⚠️ تخطي: المنتج غير متاح أو لا يوجد سعر.`);
        skipCount++;
        continue;
      }
      
      const cleanTitle = premiumTitleCleaner(pData.titleRaw);
      const pSlug = slugify(cleanTitle);
      
      const existingProduct = await client.fetch(`*[_type == "product" && slug.current == $slug][0]`, { slug: pSlug });
      if (existingProduct) {
        console.log(`   ⚠️ المنتج موجود مسبقاً: ${cleanTitle}`);
        skipCount++;
        continue; 
      }
      
      // رفع الصور - حتى 6 صور
      let mainImageRef = null;
      let galleryRefs = [];
      const imagesToUpload = pData.images.slice(0, MAX_IMAGES);
      
      if (imagesToUpload.length > 0) {
          console.log(`   📸 جاري رفع ${imagesToUpload.length} صورة...`);
          mainImageRef = await uploadImageFromUrl(imagesToUpload[0]);
          for (let imgUrl of imagesToUpload.slice(1)) {
              let gRef = await uploadImageFromUrl(imgUrl);
              if (gRef) galleryRefs.push({ _type: 'image', _key: Math.random().toString(36).substring(7), asset: { _type: 'reference', _ref: gRef }});
          }
      }
      
      const totalImages = galleryRefs.length + (mainImageRef ? 1 : 0);

      const productDoc = {
        _type: 'product',
        title: cleanTitle,
        slug: { _type: 'slug', current: pSlug },
        price: pData.currentPrice,
        discountPrice: pData.oldPrice,
        description: pData.descRaw ? pData.descRaw.trim() : cleanTitle,
        stockStatus: 'in_stock',
        deliveryType: 'home'
      };
      
      if (shippingProfileId) productDoc.shippingProfile = { _type: 'reference', _ref: shippingProfileId };
      if (mainImageRef) productDoc.mainImage = { _type: 'image', asset: { _type: 'reference', _ref: mainImageRef } };
      if (galleryRefs.length > 0) productDoc.gallery = galleryRefs;
      
      await client.create(productDoc);
      successCount++;

      console.log(`   ✅ الإسم: ${cleanTitle}`);
      console.log(`   ✅ السعر: ${pData.currentPrice} دج (قبل: ${pData.oldPrice} دج)`);
      console.log(`   ✅ الوصف: تم رفعه بنجاح`);
      console.log(`   ✅ التوصيل: ${shippingProfileId ? 'تم الربط بنجاح' : 'بدون ملف توصيل'}`);
      console.log(`   ✅ الصور: تم رفع ${totalImages} صورة بنجاح 📸`);
      console.log(`   ────────────────────────────────────`);
      console.log(`   📊 التقدم: ${successCount} نجاح | ${skipCount} تخطي | ${errorCount} خطأ`);
      
    } catch(e) {
      errorCount++;
      console.log(`   ❌ خطأ في السحب: ${e.message}`);
    }
  }
  
  console.log(`\n╔══════════════════════════════════════════════════╗`);
  console.log(`║  🎉 انتهى بوت Vanessia V6.0 بنجاح!             ║`);
  console.log(`║  ✅ تم رفع: ${String(successCount).padEnd(37)}║`);
  console.log(`║  ⚠️ تم تخطي: ${String(skipCount).padEnd(36)}║`);
  console.log(`║  ❌ أخطاء: ${String(errorCount).padEnd(38)}║`);
  console.log(`╚══════════════════════════════════════════════════╝`);

  await browser.close();
}

scrapeVanessiaUrls();
