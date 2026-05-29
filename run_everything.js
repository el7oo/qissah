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

function slugify(text) {
  return text.toLowerCase().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '') || Math.random().toString(36).substring(7);
}

async function uploadImageFromUrl(url, baseUrl, retries = 3) {
  if (!url || url.includes('data:image') || url.includes('placeholder')) return null;
  let fullUrl = url.startsWith('/') ? baseUrl + url : url;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(fullUrl, { responseType: 'arraybuffer', timeout: 30000 });
      const buffer = Buffer.from(response.data, 'binary');
      const asset = await client.assets.upload('image', buffer, {
        filename: fullUrl.split('/').pop().split('?')[0] || 'product.jpg'
      });
      return asset._id;
    } catch (err) {
      if (i < retries - 1) await new Promise(res => setTimeout(res, 2000));
    }
  }
  return null;
}

async function wipeData() {
  console.log("========================================");
  console.log("🧹 جاري مسح جميع المنتجات والأقسام السابقة...");
  const products = await client.fetch(`*[_type == "product"]._id`);
  console.log(`تم العثور على ${products.length} منتج للحذف.`);
  for (const id of products) {
    await client.delete(id).catch(e => console.error("Error deleting product", e.message));
  }
  
  const categories = await client.fetch(`*[_type == "category"]._id`);
  console.log(`تم العثور على ${categories.length} قسم للحذف.`);
  for (const id of categories) {
    await client.delete(id).catch(e => console.error("Error deleting category", e.message));
  }
  console.log("✅ تم مسح البيانات بنجاح!");
  console.log("========================================\n");
}

async function getShippingProfile(nameMatch) {
  const profiles = await client.fetch(`*[_type == "shippingProfile" && title match "${nameMatch}"]`);
  if (profiles.length > 0) return profiles[0]._id;
  const exactProfiles = await client.fetch(`*[_type == "shippingProfile" && title == "${nameMatch}"]`);
  if (exactProfiles.length > 0) return exactProfiles[0]._id;
  return null;
}

async function scrapeEcomix(browser) {
  if (!fs.existsSync('urls.txt')) {
    console.log('❌ ملف urls.txt غير موجود.');
    return;
  }
  
  const urls = fs.readFileSync('urls.txt', 'utf8')
    .split('\n')
    .map(u => u.trim())
    .filter(u => u.startsWith('http'));

  console.log(`\n╔══════════════════════════════════════════════════╗`);
  console.log(`║  🚀 بدء بوت ECOMIX                               ║`);
  console.log(`║  📦 إجمالي المنتجات: ${String(urls.length).padEnd(28)}║`);
  console.log(`╚══════════════════════════════════════════════════╝\n`);

  let shippingId = await getShippingProfile("فايب");
  if (!shippingId) {
      shippingId = await getShippingProfile("Vip"); // Fallback
  }

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  for (let i = 0; i < urls.length; i++) {
    console.log(`\n----------------------------------------`);
    console.log(`المنتج ${i + 1} من ${urls.length} (Ecomix)`);
    const pUrl = urls[i];
    
    try {
      await page.goto(pUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForFunction(() => document.querySelector('h1') || document.querySelector('.product-title') || document.querySelector('.price'), { timeout: 15000 }).catch(()=>{});

      const pData = await page.evaluate(() => {
        const titleEl = document.querySelector('h1') || document.querySelector('.product-title');
        const priceEl = document.querySelector('.price') || document.querySelector('.product-price');
        const descEl = document.querySelector('.description') || document.querySelector('.product-details');
        
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
        
        let rawUrls = [];
        document.querySelectorAll('img').forEach(img => {
           let src = img.getAttribute('data-src') || img.getAttribute('data-lazy') || img.getAttribute('srcset') || img.getAttribute('src') || img.src;
           if (src) {
               if (src.includes(',')) {
                   let parts = src.split(',');
                   src = parts[parts.length - 1].trim().split(' ')[0];
               } else {
                   src = src.split(' ')[0];
               }
               rawUrls.push(src);
           }
        });
        
        document.querySelectorAll('[style*="background-image"]').forEach(el => {
           let bg = el.style.backgroundImage;
           if (bg && bg.includes('url(')) {
               let urlMatch = bg.match(/url\(['"]?(.*?)['"]?\)/);
               if (urlMatch && urlMatch[1]) rawUrls.push(urlMatch[1]);
           }
        });
        
        let galleryUrls = rawUrls.filter(src => src && typeof src === 'string' && src.length > 15)
          .filter(src => 
            !src.includes('logo') && 
            !src.includes('footer') && 
            !src.includes('avatar') && 
            !src.includes('icon') && 
            !src.includes('banner') &&
            !src.includes('.svg') &&
            !src.includes('placeholder')
          );
        
        if (galleryUrls.length === 0) {
            const mainImg = document.querySelector('meta[property="og:image"]');
            if (mainImg) galleryUrls.push(mainImg.content);
        }
        
        return { titleRaw, descRaw, currentPrice, oldPrice, images: [...new Set(galleryUrls)] };
      });

      if (!pData.titleRaw || pData.currentPrice === 0) {
        console.log(`⚠️ تخطي المنتج: لا يوجد سعر أو عنوان.`);
        continue;
      }

      const cleanTitle = premiumTitleCleaner(pData.titleRaw);
      
      let mainImageRef = null;
      let galleryRefs = [];
      
      // رفع جميع الصور
      if (pData.images.length > 0) {
          mainImageRef = await uploadImageFromUrl(pData.images[0], 'https://ecomix.vip');
          for (let imgUrl of pData.images.slice(1)) {
              let gRef = await uploadImageFromUrl(imgUrl, 'https://ecomix.vip');
              if (gRef) galleryRefs.push({ _type: 'image', _key: Math.random().toString(36).substring(7), asset: { _type: 'reference', _ref: gRef }});
          }
      }

      const totalImages = galleryRefs.length + (mainImageRef ? 1 : 0);

      const productDoc = {
        _type: 'product',
        title: cleanTitle,
        slug: { _type: 'slug', current: slugify(cleanTitle) },
        price: pData.currentPrice,
        discountPrice: pData.oldPrice,
        description: pData.descRaw ? pData.descRaw.trim() : cleanTitle,
        stockStatus: 'in_stock',
        deliveryType: 'home'
      };

      if (shippingId) productDoc.shippingProfile = { _type: 'reference', _ref: shippingId };
      if (mainImageRef) productDoc.mainImage = { _type: 'image', asset: { _type: 'reference', _ref: mainImageRef } };
      if (galleryRefs.length > 0) productDoc.gallery = galleryRefs;

      await client.create(productDoc);

      console.log(`تم سحب السعر`);
      console.log(`تم سحب الوصف`);
      if (shippingId) console.log(`تم ربط التوصيل`);
      console.log(`تم سحب ${totalImages} صور`);

    } catch (error) {
      console.log(`❌ خطأ في المنتج: ${error.message}`);
    }
  }
  await page.close();
}

async function scrapeVanessa(browser) {
  if (!fs.existsSync('vanessia.txt')) {
    console.log('❌ ملف vanessia.txt غير موجود.');
    return;
  }
  
  const urls = fs.readFileSync('vanessia.txt', 'utf8')
    .split('\n')
    .map(u => u.trim())
    .filter(u => u && !u.includes('/product-category/') && !u.startsWith('//') && u.startsWith('http'));

  console.log(`\n╔══════════════════════════════════════════════════╗`);
  console.log(`║  🚀 بدء بوت VANESSA                              ║`);
  console.log(`║  📦 إجمالي المنتجات: ${String(urls.length).padEnd(28)}║`);
  console.log(`╚══════════════════════════════════════════════════╝\n`);

  let shippingId = await getShippingProfile("فايب 2");
  if (!shippingId) {
      shippingId = await getShippingProfile("Vip 2"); // Fallback
  }

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  for (let i = 0; i < urls.length; i++) {
    console.log(`\n----------------------------------------`);
    console.log(`المنتج ${i + 1} من ${urls.length} (Vanessa)`);
    const pUrl = urls[i];
    
    try {
      await page.goto(pUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
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
        
        const imgEls = Array.from(document.querySelectorAll('.woocommerce-product-gallery__image a, .woocommerce-product-gallery__image img'));
        let galleryUrls = imgEls
          .map(img => img.getAttribute('href') || img.src || img.getAttribute('data-src'))
          .filter(src => src && !src.includes('avatar') && !src.includes('placeholder') && !src.includes('data:image'));
        
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
        console.log(`⚠️ تخطي المنتج: لا يوجد سعر أو عنوان.`);
        continue;
      }

      const cleanTitle = premiumTitleCleaner(pData.titleRaw);
      
      let mainImageRef = null;
      let galleryRefs = [];
      
      // رفع جميع الصور
      if (pData.images.length > 0) {
          mainImageRef = await uploadImageFromUrl(pData.images[0], 'https://vanessia.shop');
          for (let imgUrl of pData.images.slice(1)) {
              let gRef = await uploadImageFromUrl(imgUrl, 'https://vanessia.shop');
              if (gRef) galleryRefs.push({ _type: 'image', _key: Math.random().toString(36).substring(7), asset: { _type: 'reference', _ref: gRef }});
          }
      }

      const totalImages = galleryRefs.length + (mainImageRef ? 1 : 0);

      const productDoc = {
        _type: 'product',
        title: cleanTitle,
        slug: { _type: 'slug', current: slugify(cleanTitle) },
        price: pData.currentPrice,
        discountPrice: pData.oldPrice,
        description: pData.descRaw ? pData.descRaw.trim() : cleanTitle,
        stockStatus: 'in_stock',
        deliveryType: 'home'
      };

      if (shippingId) productDoc.shippingProfile = { _type: 'reference', _ref: shippingId };
      if (mainImageRef) productDoc.mainImage = { _type: 'image', asset: { _type: 'reference', _ref: mainImageRef } };
      if (galleryRefs.length > 0) productDoc.gallery = galleryRefs;

      await client.create(productDoc);

      console.log(`تم سحب السعر`);
      console.log(`تم سحب الوصف`);
      if (shippingId) console.log(`تم ربط التوصيل`);
      console.log(`تم سحب ${totalImages} صور`);

    } catch (error) {
      console.log(`❌ خطأ في المنتج: ${error.message}`);
    }
  }
  await page.close();
}

async function runEverything() {
  await wipeData();

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  
  await scrapeEcomix(browser);
  await scrapeVanessa(browser);

  await browser.close();
  console.log("🎉 انتهى العمل بالكامل!");
}

runEverything();
