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
      const response = await axios.get(fullUrl, { responseType: 'arraybuffer', timeout: 15000 });
      const buffer = Buffer.from(response.data, 'binary');
      const asset = await client.assets.upload('image', buffer, {
        filename: fullUrl.split('/').pop().split('?')[0] || 'luxury-product.jpg'
      });
      return asset._id;
    } catch (err) {
      await new Promise(res => setTimeout(res, 2000));
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
    .filter(u => u && !u.includes('/product-category/'));

  if (urls.length === 0) {
    console.log('⚠️ لا يوجد روابط منتجات صالحة في الملف!');
    return;
  }

  console.log(`🚀 بدء سحب ${urls.length} منتج من موقع Vanessia...`);
  
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // جلب إعدادات الشحن
  let shippingProfileId = null;
  const profiles = await client.fetch(`*[_type == "shippingProfile" && title match "vibe 2" || title match "Vibe 2"]`);
  if (profiles.length > 0) {
    shippingProfileId = profiles[0]._id;
  }

  // إنشاء قسم خاص لهم إذا أردت
  const sanityCategoryId = null; // أو يمكنك جلبه كما في السكربت السابق

  for (let i = 0; i < urls.length; i++) {
    const pUrl = urls[i];
    console.log(`\n⏳ سحب منتج ${i+1}/${urls.length}: ${pUrl}`);
    
    try {
      await page.goto(pUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      
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
        
        const imgEls = Array.from(document.querySelectorAll('.woocommerce-product-gallery__image a, .woocommerce-product-gallery__image img'));
        let galleryUrls = imgEls.map(img => img.getAttribute('href') || img.src || img.getAttribute('data-src')).filter(src => src && !src.includes('avatar') && !src.includes('placeholder'));
        
        return { titleRaw, descRaw, currentPrice, oldPrice, images: [...new Set(galleryUrls)] };
      });
      
      if (!pData.titleRaw || pData.currentPrice === 0) {
        console.log('⚠️ تخطي: المنتج غير متاح أو لا يوجد سعر.');
        continue;
      }
      
      const cleanTitle = premiumTitleCleaner(pData.titleRaw);
      const pSlug = slugify(cleanTitle);
      
      const existingProduct = await client.fetch(`*[_type == "product" && slug.current == $slug][0]`, { slug: pSlug });
      if (existingProduct) {
        console.log(`⚠️ المنتج موجود مسبقاً: ${cleanTitle}`);
        continue; 
      }
      
      let mainImageRef = null;
      let galleryRefs = [];
      
      if (pData.images.length > 0) {
          mainImageRef = await uploadImageFromUrl(pData.images[0]);
          for (let imgUrl of pData.images.slice(1)) { // Removed .slice(1, 4) limit
              let gRef = await uploadImageFromUrl(imgUrl);
              if (gRef) galleryRefs.push({ _type: 'image', _key: Math.random().toString(36).substring(7), asset: { _type: 'reference', _ref: gRef }});
          }
      }
      
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
      console.log(`✅ الإسم: ${cleanTitle}`);
      console.log(`✅ السعر: تم (${pData.currentPrice} دج)`);
      console.log(`✅ الوصف: تم`);
      console.log(`✅ التوصيل: تم`);
      console.log(`✅ الصور: تم رفع ${galleryRefs.length + (mainImageRef ? 1 : 0)} صورة بنجاح`);
      console.log(`----------------------------------------`);
      
    } catch(e) {
      console.log(`❌ خطأ في السحب: ${e.message}`);
    }
  }
  
  console.log('🎉 انتهى السحب من ملف vanessia.txt بنجاح!');
  await browser.close();
}

scrapeVanessiaUrls();
