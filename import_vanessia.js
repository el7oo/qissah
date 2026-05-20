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

async function getOrCreateCategory(title, icon) {
  const existingCat = await client.fetch(`*[_type == "category" && title == $title][0]`, { title });
  if (existingCat) return existingCat._id;
  
  const newCat = await client.create({
    _type: 'category',
    title: title,
    slug: { _type: 'slug', current: slugify(title) },
    icon: icon
  });
  return newCat._id;
}

async function scrapeAndImport() {
  console.log('🚀 بدء تشغيل بوت Vanessia V1.0...');
  
  // Find shipping profile "vibe 2"
  let shippingProfileId = null;
  const profiles = await client.fetch(`*[_type == "shippingProfile" && title match "vibe 2" || title match "Vibe 2"]`);
  if (profiles.length > 0) {
    shippingProfileId = profiles[0]._id;
    console.log(`✅ تم العثور على ملف الشحن: ${profiles[0].title}`);
  }

  // Define target categories on Vanessia and their Sanity equivalents
  // User requested: "ضعها كلها في قسم خاص سميه vanessia"
  const targetCategories = [
    { url: 'https://vanessia.shop/product-category/electromenager/', sanityTitle: 'vanessia', sanityIcon: '📦' },
    { url: 'https://vanessia.shop/product-category/porte-et-fenetre-pvc/', sanityTitle: 'vanessia', sanityIcon: '📦' },
    { url: 'https://vanessia.shop/product-category/porte-bois-rouge/', sanityTitle: 'vanessia', sanityIcon: '📦' },
    { url: 'https://vanessia.shop/product-category/porte-fer/', sanityTitle: 'vanessia', sanityIcon: '📦' },
    { url: 'https://vanessia.shop/product-category/cuisine/', sanityTitle: 'vanessia', sanityIcon: '📦' },
    { url: 'https://vanessia.shop/product-category/divers/', sanityTitle: 'vanessia', sanityIcon: '📦' },
    { url: 'https://vanessia.shop/product-category/outils/', sanityTitle: 'vanessia', sanityIcon: '📦' },
    { url: 'https://vanessia.shop/product-category/sante-et-beaute/', sanityTitle: 'vanessia', sanityIcon: '📦' }
  ];

  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  try {
    for (const cat of targetCategories) {
      console.log(`\n========================================`);
      console.log(`📂 القسم المستهدف: ${cat.sanityTitle} من الرابط ${cat.url}`);
      
      const sanityCategoryId = await getOrCreateCategory(cat.sanityTitle, cat.sanityIcon);
      
      let currentPage = 1;
      let hasNextPage = true;
      let emptyPagesCount = 0;
      
      while (hasNextPage) {
        // WooCommerce pagination is usually /page/2/
        const pageUrl = currentPage === 1 ? cat.url : `${cat.url}page/${currentPage}/`;
        console.log(`📄 فحص الصفحة ${currentPage}...`);
        
        await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 90000 });
        
        // Wait for WooCommerce products container
        try {
          await page.waitForSelector('.product', { timeout: 10000 });
        } catch(e) {
          // might be empty
        }

        // extract product URLs from the category page
        const productsBasic = await page.evaluate(() => {
          const items = Array.from(document.querySelectorAll('.product, li.product, .product-item'));
          return items.map(item => {
            const linkEl = item.querySelector('a.woocommerce-LoopProduct-link') || item.querySelector('a');
            return linkEl ? linkEl.href : null;
          }).filter(url => url !== null);
        });
        
        if (productsBasic.length === 0) {
            emptyPagesCount++;
            if (emptyPagesCount >= 2 || currentPage > 1) { 
               // In WooCommerce, if page 2 is 404, we break immediately
               console.log(`⚠️ انتهت الصفحات في هذا القسم.`);
               hasNextPage = false;
               break;
            } else {
               currentPage++;
               continue;
            }
        }
        
        emptyPagesCount = 0;

        console.log(`🎯 تم العثور على ${productsBasic.length} منتج. سيتم رفعها...`);
        
        for (const pUrl of productsBasic) {
          const pPage = await browser.newPage();
          try {
            await pPage.goto(pUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
            
            const pData = await pPage.evaluate(() => {
              const titleEl = document.querySelector('h1.product_title');
              const priceEl = document.querySelector('p.price') || document.querySelector('.price');
              const descEl = document.querySelector('#tab-description') || document.querySelector('.woocommerce-product-details__short-description');
              
              const titleRaw = titleEl ? titleEl.innerText : '';
              const descRaw = descEl ? descEl.innerText : '';
              
              const priceText = priceEl ? priceEl.innerText : '';
              const cleanPriceText = priceText.replace(/\.00/g, '').replace(/[^\d\s-]/g, ' '); 
              const numbers = cleanPriceText.match(/\d+/g) || [];
              const possiblePrices = numbers.map(Number).filter(n => n > 99); 
              
              let currentPrice = possiblePrices[0] || 0;
              let oldPrice = possiblePrices[1] || 0;
              
              if (oldPrice === 0 && currentPrice > 0) {
                 oldPrice = Math.round(currentPrice * 1.15);
                 oldPrice = Math.ceil(oldPrice / 100) * 100;
              } else if (currentPrice > oldPrice && oldPrice !== 0) { 
                 let t = oldPrice; oldPrice = currentPrice; currentPrice = t; 
              }
              
              // Find WooCommerce gallery images
              const imgEls = Array.from(document.querySelectorAll('.woocommerce-product-gallery__image a, .woocommerce-product-gallery__image img'));
              let galleryUrls = imgEls.map(img => img.getAttribute('href') || img.src || img.getAttribute('data-src')).filter(src => src && !src.includes('avatar') && !src.includes('placeholder'));
              
              return { titleRaw, descRaw, currentPrice, oldPrice, images: [...new Set(galleryUrls)] };
            });
            
            await pPage.close(); 
            
            if (!pData.titleRaw || pData.oldPrice === 0) continue; 
            
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
                for (let i = 1; i < Math.min(pData.images.length, 4); i++) {
                    const gRef = await uploadImageFromUrl(pData.images[i]);
                    if (gRef) galleryRefs.push({ _type: 'image', _key: Math.random().toString(36).substring(7), asset: { _type: 'reference', _ref: gRef }});
                }
            }
            
            const productDoc = {
              _type: 'product',
              title: cleanTitle,
              slug: { _type: 'slug', current: slugify(cleanTitle) },
              price: pData.currentPrice,
              discountPrice: pData.oldPrice,
              description: pData.descRaw.trim(),
              category: sanityCategoryId ? { _type: 'reference', _ref: sanityCategoryId } : undefined,
              stockStatus: 'in_stock',
              deliveryType: 'home'
            };
            
            if (shippingProfileId) productDoc.shippingProfile = { _type: 'reference', _ref: shippingProfileId };
            if (mainImageRef) productDoc.mainImage = { _type: 'image', asset: { _type: 'reference', _ref: mainImageRef } };
            if (galleryRefs.length > 0) productDoc.gallery = galleryRefs;
            
            await client.create(productDoc);
            
          } catch(e) {
            console.log(`   ❌ خطأ في المنتج: ${pUrl}`);
            try { await pPage.close(); } catch(err){}
          }
        }
        
        console.log(`✅ انتهت الصفحة ${currentPage}`);
        currentPage++;
      }
    }
    console.log('\n🌟🌟🌟 انتهى السحب من موقع Vanessia بنجاح!');
  } catch (error) {
    console.error('❌ خطأ فادح:', error.message);
  } finally {
    await browser.close();
  }
}

scrapeAndImport();
