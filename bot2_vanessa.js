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

// ============================================================
// 🗂️ خريطة الأقسام الذكية - تكشف القسم من رابط المنتج
// ============================================================
const CATEGORY_MAP = [
  {
    category: 'اجهزة كهرومنزلية',
    keywords: [
      'machine-a-laver', 'lave-linge', 'lave-vaisselle',
      'refrigerateur', 'refregirateur', 'congelateur', 'presentoir',
      'cuisiniere', 'cuisinier', 'four-encastrable', 'four-electrique', 'four-et',
      'micro-onde', 'plaque-chauffante', 'palque-chauffante',
      'hotte', 'chauffe-bain', 'chauffe-eau',
      'climatiseur', 'chauffage', 'radiateur',
      'bains-dhuile', 'bain-dhuile', 'resistance',
      'fontaine', 'maxi-bar', 'mini-bar', 'glaciere',
      'contiglobal-by-geant', 'seche-cheveux', 'lisseur',
      'friteuse', 'petrin', 'blender', 'bras-mixeur', 'robot',
      'panineuse', 'cocotte', 'bouilloire', 'moulin-epices',
      'machine-a-cafe', 'cafetiere', 'rechaud', 'rechiade',
      'aspirateur', 'defroisseur', 'surjeteuse', 'machine-a-coudre',
      'machine-a-pates', 'tabona', 'ventilateur', 'refroidisseur',
      'air-cooler', 'air-frayer', 'piscine'
    ]
  },
  {
    category: 'اثاث وديكور',
    keywords: [
      'porte-de-chambre', 'porte-chambre', 'porte-salon', 'porte-cuisine',
      'porte-dentree', 'porte-de-cuisine', 'porte-potage', 'porte-panneau',
      'porte-balcon', 'porte-sanitaire', 'porte-plaquards', 'porte-hdf',
      'porte-fer', 'porte-bois', 'accordeon-bab', 'accordeon',
      'fenetre', 'cadre-bois', 'plaquard', 'adraj', 'درج'
    ]
  },
  {
    category: 'معدات العمل',
    keywords: [
      'meuleuse', 'perceuse', 'visseuse', 'perseuse', 'persseuse',
      'pistolet', 'pistolet-a-paintre', 'scie', 'jointeuse',
      'crown', 'beetro', 'decapeur', 'ventouse', 'pompe-a-eau',
      'booster', 'cerveau', 'precision-de-nivellement'
    ]
  },
  {
    category: 'صحة و جمال',
    keywords: [
      'sante-et-beaute', 'pack-tondeuse', 'tondeuse',
      'nettoyage-de-tache', 'lisseur-cheveux', 'lisseur-enzo'
    ]
  },
  {
    category: 'البسة',
    keywords: ['chaussure', 'chausse', 'vetement']
  }
];

/**
 * يكشف القسم الصح من رابط المنتج
 */
function detectCategoryFromUrl(url) {
  const lowerUrl = url.toLowerCase();
  for (const entry of CATEGORY_MAP) {
    for (const kw of entry.keywords) {
      if (lowerUrl.includes(kw)) {
        return entry.category;
      }
    }
  }
  return 'اجهزة كهرومنزلية'; // القسم الافتراضي لـ Vanessia
}

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

async function getShippingProfile(nameMatch) {
  const profiles = await client.fetch(`*[_type == "shippingProfile" && title match "${nameMatch}"]`);
  if (profiles.length > 0) return profiles[0]._id;
  const exactProfiles = await client.fetch(`*[_type == "shippingProfile" && title == "${nameMatch}"]`);
  if (exactProfiles.length > 0) return exactProfiles[0]._id;
  return null;
}

async function getOrCreateCategory(categoryName) {
  if (!categoryName) return null;
  const cleanName = categoryName.trim();
  if (!cleanName) return null;
  // Check if exists
  const exists = await client.fetch(`*[_type == "category" && title == $title][0]`, { title: cleanName });
  if (exists) return exists._id;
  
  // Create if not exists
  const doc = {
    _type: 'category',
    title: cleanName,
    slug: { _type: 'slug', current: slugify(cleanName) }
  };
  const created = await client.create(doc);
  console.log(`✨ تم إنشاء قسم جديد: ${cleanName}`);
  return created._id;
}

async function startBot2() {
  if (!fs.existsSync('vanessia.txt')) {
    console.log('❌ ملف vanessia.txt غير موجود.');
    return;
  }
  
  const urls = fs.readFileSync('vanessia.txt', 'utf8')
    .split('\n')
    .map(u => u.trim())
    .filter(u => u && !u.includes('/product-category/') && !u.startsWith('//') && u.startsWith('http'));

  console.log(`\n╔══════════════════════════════════════════════════╗`);
  console.log(`║  🚀 بدء بوت VANESSA (البوت الثاني)               ║`);
  console.log(`║  📦 إجمالي المنتجات: ${String(urls.length).padEnd(28)}║`);
  console.log(`╚══════════════════════════════════════════════════╝\n`);

  let shippingId = await getShippingProfile("فايب 2");
  if (!shippingId) {
      shippingId = await getShippingProfile("Vip 2"); // Fallback
  }

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  for (let i = 0; i < urls.length; i++) {
    console.log(`\n----------------------------------------`);
    console.log(`المنتج ${i + 1} من ${urls.length} (Vanessa)`);
    const pUrl = urls[i];
    
    try {
      await page.goto(pUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      await page.waitForFunction(() => document.querySelector('h1') || document.querySelector('.product_title'), { timeout: 15000 }).catch(()=>{});
      await new Promise(r => setTimeout(r, 2500)); // Wait for lazy loaded images to appear

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

        const catEls = Array.from(document.querySelectorAll('.posted_in a, .woocommerce-breadcrumb a'));
        let categoryName = null;
        if (catEls.length > 0) {
            // Get the last valid category link
            const validCats = catEls.filter(el => el.innerText && el.innerText.trim().toLowerCase() !== 'home' && el.innerText.trim() !== 'الرئيسية');
            if (validCats.length > 0) {
                categoryName = validCats[validCats.length - 1].innerText.trim();
            }
        }

        return { titleRaw, descRaw, currentPrice, oldPrice, images: [...new Set(galleryUrls)], categoryName };
      });

      if (!pData.titleRaw || pData.currentPrice === 0) {
        console.log(`⚠️ تخطي المنتج: لا يوجد سعر أو عنوان.`);
        continue;
      }

      const cleanTitle = premiumTitleCleaner(pData.titleRaw);
      
      const productDoc = {
        _type: 'product',
        title: cleanTitle,
        slug: { _type: 'slug', current: slugify(cleanTitle) },
        price: pData.oldPrice,
        discountPrice: pData.currentPrice,
        description: pData.descRaw ? pData.descRaw.trim() : cleanTitle,
        stockStatus: 'in_stock',
        deliveryType: 'home'
      };

      // Check for duplicates before uploading images or saving
      const existingProduct = await client.fetch(`*[_type == "product" && title == $title][0]`, { title: cleanTitle });
      if (existingProduct) {
          console.log(`🔄 تحديث المنتج: "${cleanTitle}" موجود مسبقاً.`);
          
          await client.patch(existingProduct._id)
            .set({
               price: pData.oldPrice,
               discountPrice: pData.currentPrice
            })
            .commit();
            
          continue;
      }

      let mainImageRef = null;
      let galleryRefs = [];
      
      if (pData.images.length > 0) {
          mainImageRef = await uploadImageFromUrl(pData.images[0], 'https://vanessia.shop');
          for (let imgUrl of pData.images.slice(1)) {
              let gRef = await uploadImageFromUrl(imgUrl, 'https://vanessia.shop');
              if (gRef) galleryRefs.push({ _type: 'image', _key: Math.random().toString(36).substring(7), asset: { _type: 'reference', _ref: gRef }});
          }
      }

      const totalImages = galleryRefs.length + (mainImageRef ? 1 : 0);

      const detectedCategory = detectCategoryFromUrl(pUrl);
      const catId = await getOrCreateCategory(detectedCategory);
      if (catId) {
          productDoc.category = { _type: 'reference', _ref: catId };
      }

      if (shippingId) productDoc.shippingProfile = { _type: 'reference', _ref: shippingId };
      if (mainImageRef) productDoc.mainImage = { _type: 'image', asset: { _type: 'reference', _ref: mainImageRef } };
      if (galleryRefs.length > 0) productDoc.gallery = galleryRefs;

      await client.create(productDoc);

      console.log(`تم سحب ${totalImages} صور`);
      console.log(`تم سحب السعر`);
      console.log(`تم سحب الوصف`);
      console.log(`✅ تم الربط بالقسم: ${detectedCategory}`);
      if (shippingId) console.log(`تم ربط التوصيل (فايب 2)`);

    } catch (error) {
      console.log(`❌ خطأ في المنتج: ${error.message}`);
    }
  }
  await browser.close();
  console.log("\n🎉 انتهى بوت VANESSA بنجاح!");
}

startBot2();
