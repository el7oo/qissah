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

async function uploadImageFromUrl(url, retries = 3) {
  if (!url || url.includes('data:image') || url.includes('placeholder')) return null;
  let fullUrl = url.startsWith('/') ? 'https://ecomix.vip' + url : url;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(fullUrl, { responseType: 'arraybuffer', timeout: 15000 });
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

async function scrapeUrls() {
  if (!fs.existsSync('urls.txt')) {
    console.log('❌ ملف urls.txt غير موجود. الرجاء إنشاؤه ووضع الروابط فيه (رابط في كل سطر).');
    return;
  }
  const urls = fs.readFileSync('urls.txt', 'utf8').split('\n').map(u => u.trim()).filter(u => u);
  if (urls.length === 0) {
    console.log('⚠️ ملف urls.txt فارغ!');
    return;
  }

  console.log(`🚀 بدء سحب ${urls.length} منتج من الروابط اليدوية...`);
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  // Get shipping profile
  const vibeRes = await client.fetch('*[_type == "shippingProfile" && name == "vibe"][0]._id');
  const vibeProfileId = vibeRes || '3cf38708-3ab0-47be-a577-c9d343f11559';

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`\n⏳ سحب منتج ${i+1}/${urls.length}: ${url}`);
    
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForFunction(() => document.querySelector('h1') || document.querySelector('.product-title') || document.querySelector('.price'), { timeout: 10000 }).catch(()=>{});
      
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
        let oldPrice = possiblePrices[1] || currentPrice;

        const imgEls = Array.from(document.querySelectorAll('.gallery img, .product-images img, .slick-slide img, .swiper-slide img, .pleceholder-zoomer-base-container img, .preload-img, .lazy-img'));
        let galleryUrls = imgEls.map(img => img.getAttribute('data-src') || img.src).filter(src => src && !src.includes('avatar') && !src.includes('logo') && !src.includes('footer'));
        
        if (galleryUrls.length === 0) {
            const mainImg = document.querySelector('img.preload-img') || document.querySelector('img.lazy-img') || document.querySelector('.main-image img');
            if (mainImg) galleryUrls.push(mainImg.getAttribute('data-src') || mainImg.src);
        }
        return { titleRaw, descRaw, currentPrice, oldPrice, images: [...new Set(galleryUrls)] };
      });

      if (!pData.titleRaw || pData.currentPrice === 0) {
        console.log('⚠️ تخطي: المنتج غير متاح أو لا يوجد سعر.');
        continue;
      }

      let cleanTitle = pData.titleRaw.replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
      let currentPrice = pData.currentPrice;
      let finalPrice = Math.round(currentPrice * 1.15); // Add 15% automatically
      let oldPrice = finalPrice + 900;
      let pSlug = slugify(cleanTitle);

      const existing = await client.fetch(`*[_type == "product" && slug.current == $slug][0]`, { slug: pSlug });
      if (existing) {
          console.log(`⚠️ المنتج "${cleanTitle}" موجود مسبقاً.`);
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
          price: finalPrice,
          discountPrice: finalPrice, // Keep consistent
          shippingProfile: { _type: 'reference', _ref: vibeProfileId },
          stockStatus: 'in_stock',
          description: pData.descRaw || cleanTitle,
          categoryId: 'ecomix', // Defaulting to Ecomix category logic if needed, or null
      };

      if (mainImageRef) newProduct.mainImage = { _type: 'image', asset: { _type: 'reference', _ref: mainImageRef } };
      if (galleryRefs.length > 0) newProduct.gallery = galleryRefs;

      await client.create(newProduct);
      console.log(`✅ تمت إضافة المنتج بنجاح: ${cleanTitle}`);

    } catch (e) {
      console.log(`❌ خطأ في السحب: ${e.message}`);
    }
  }

  console.log('🎉 انتهى السحب اليدوي بنجاح!');
  await browser.close();
}

scrapeUrls();
