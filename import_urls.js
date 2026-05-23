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

const MAX_IMAGES = 6; 
const EXCLUDED_FILES = ['urls.txt', 'vanessia.txt', 'merged_urls.txt', 'requirements.txt'];

function premiumTitleCleaner(title) {
  return title
    .replace(/[☆★]/g, '') 
    .replace(/\s\d+\s*تقييمات/g, '')
    .replace(/0 تقييمات/g, '') 
    .replace(/\b(نوعية ممتازة|ممتازة|أصلي|جديد|تخفيض|شحن مجاني)\b/g, '') 
    .replace(/[-\+]/g, ' ') 
    .replace(/\n/g, ' ') 
    .replace(/\s{2,}/g, ' ') 
    .trim();
}

async function uploadImageFromUrl(url, retries = 3) {
  if (!url || url.includes('data:image') || url.includes('placeholder')) return null;
  let fullUrl = url.startsWith('/') ? 'https://ecomix.vip' + url : url;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(fullUrl, { responseType: 'arraybuffer', timeout: 20000 });
      const buffer = Buffer.from(response.data, 'binary');
      const asset = await client.assets.upload('image', buffer, { filename: fullUrl.split('/').pop().split('?')[0] || 'product-img.jpg' });
      return asset._id;
    } catch (err) {
      if (i < retries - 1) await new Promise(res => setTimeout(res, 2000));
    }
  }
  return null;
}

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '') || Math.random().toString(36).substring(7);
}

async function getOrCreateCategory(categoryName) {
  const cSlug = slugify(categoryName);
  const existing = await client.fetch(`*[_type == "category" && title == $title][0]`, { title: categoryName });
  if (existing) return existing._id;
  
  const newCat = await client.create({
    _type: 'category',
    title: categoryName,
    slug: { _type: 'slug', current: cSlug }
  });
  console.log(`📂 تم إنشاء قسم جديد: ${categoryName}`);
  return newCat._id;
}

async function processCategoryFile(filePath, categoryName, browser, shippingProfileId) {
  const urls = fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .map(u => u.trim())
    .filter(u => u && !u.startsWith('//'));

  if (urls.length === 0) return;

  const categoryId = await getOrCreateCategory(categoryName);
  console.log(`\n===========================================`);
  console.log(`📁 قسم: ${categoryName} (${urls.length} منتج)`);
  console.log(`===========================================`);

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`\n⏳ [${i+1}/${urls.length}] سحب: ${url}`);
    
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
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
        let oldPrice = possiblePrices[1] || 0;

        if (oldPrice === 0 && currentPrice > 0) {
           oldPrice = Math.round(currentPrice * 1.15);
           oldPrice = Math.ceil(oldPrice / 100) * 100;
        } else if (currentPrice > oldPrice && oldPrice !== 0) { 
           let t = oldPrice; oldPrice = currentPrice; currentPrice = t; 
        }

        const allImgEls = Array.from(document.querySelectorAll('img'));
        let galleryUrls = allImgEls
          .map(img => img.getAttribute('data-src') || img.src)
          .filter(src => src && 
            !src.includes('logo') && 
            !src.includes('footer') && 
            !src.includes('avatar') && 
            !src.includes('icon') && 
            !src.includes('banner') &&
            !src.includes('data:image') &&
            src.match(/\.(jpeg|jpg|png|webp|gif)/i)
          );

        if (galleryUrls.length === 0) {
          const mainImg = document.querySelector('meta[property="og:image"]');
          if (mainImg) galleryUrls.push(mainImg.content);
        }

        return { titleRaw, descRaw, currentPrice, oldPrice, images: [...new Set(galleryUrls)] };
      });

      if (!pData.titleRaw || pData.currentPrice === 0) {
        console.log(`   ⚠️ تخطي: منتج غير متاح`);
        continue;
      }

      let cleanTitle = premiumTitleCleaner(pData.titleRaw);
      let pSlug = slugify(cleanTitle);

      const existing = await client.fetch(`*[_type == "product" && slug.current == $slug][0]`, { slug: pSlug });
      if (existing) {
          console.log(`   ⚠️ موجود مسبقاً.`);
          continue;
      }

      let mainImageRef = null;
      let galleryRefs = [];
      const imagesToUpload = pData.images.slice(0, MAX_IMAGES);

      if (imagesToUpload.length > 0) {
          mainImageRef = await uploadImageFromUrl(imagesToUpload[0]);
          for (let imgUrl of imagesToUpload.slice(1)) {
              let ref = await uploadImageFromUrl(imgUrl);
              if (ref) galleryRefs.push({ _type: 'image', _key: Math.random().toString(36).substring(7), asset: { _type: 'reference', _ref: ref } });
          }
      }

      const newProduct = {
          _type: 'product',
          title: cleanTitle,
          slug: { _type: 'slug', current: pSlug },
          price: pData.currentPrice,
          discountPrice: pData.oldPrice,
          description: pData.descRaw ? pData.descRaw.trim() : cleanTitle,
          stockStatus: 'in_stock',
          deliveryType: 'home',
          category: { _type: 'reference', _ref: categoryId }
      };

      if (shippingProfileId) newProduct.shippingProfile = { _type: 'reference', _ref: shippingProfileId };
      if (mainImageRef) newProduct.mainImage = { _type: 'image', asset: { _type: 'reference', _ref: mainImageRef } };
      if (galleryRefs.length > 0) newProduct.gallery = galleryRefs;

      await client.create(newProduct);
      console.log(`   ✅ ${cleanTitle} (${pData.currentPrice} دج) -> ${categoryName}`);

    } catch (e) {
      console.log(`   ❌ خطأ: ${e.message}`);
    }
  }
  await page.close();
}

async function main() {
  const files = fs.readdirSync(__dirname);
  const txtFiles = files.filter(f => f.endsWith('.txt') && !EXCLUDED_FILES.includes(f));

  if (txtFiles.length === 0) {
    console.log('⚠️ لا يوجد ملفات تصنيفات بصيغة txt.');
    return;
  }

  console.log(`\n🚀 بدء بوت Qissah V7.0 - تحديث الأقسام الذكي 🚀`);
  console.log(`📁 تم العثور على ${txtFiles.length} ملفات تصنيف.`);

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  let shippingProfileId = null;
  try {
    const profiles = await client.fetch(`*[_type == "shippingProfile" && (title match "vibe" || title match "Vibe")]{_id, title}`);
    if (profiles.length > 0) shippingProfileId = profiles[0]._id;
  } catch(e) {}

  for (let file of txtFiles) {
    const categoryName = path.basename(file, '.txt');
    const filePath = path.join(__dirname, file);
    await processCategoryFile(filePath, categoryName, browser, shippingProfileId);
  }

  await browser.close();
  console.log(`\n🎉 اكتمل السحب والتصنيف بنجاح!`);
}

main();
