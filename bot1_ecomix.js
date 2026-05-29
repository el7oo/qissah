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

function premiumTitleCleaner(title) {
  if(!title) return '';
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

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s{2,}/g, ' ').trim();
}

async function uploadImageFromUrl(url, retries = 3) {
  if (!url || url.includes('data:image') || url.includes('placeholder')) return null;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
      const buffer = Buffer.from(response.data, 'binary');
      const asset = await client.assets.upload('image', buffer, {
        filename: url.split('/').pop().split('?')[0] || 'product.jpg'
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
  // Check if exists
  const exists = await client.fetch(`*[_type == "category" && title == $title][0]`, { title: categoryName });
  if (exists) return exists._id;
  
  // Create if not exists
  const doc = {
    _type: 'category',
    title: categoryName,
    slug: { _type: 'slug', current: slugify(categoryName) }
  };
  const created = await client.create(doc);
  console.log(`✨ تم إنشاء قسم جديد: ${categoryName}`);
  return created._id;
}

async function startBot1() {
  const files = [
    'هواتف.txt', 'منتجات الصيف.txt', 'معدات العمل.txt', 'لوازم المطبخ.txt',
    'لوازم التخيم.txt', 'صحة ولياقة.txt', 'صحة و جمال.txt', 'زيوت ومستخلصات.txt',
    'حقائب.txt', 'ترفيه.txt', 'امن و مراقبة.txt', 'البسة.txt', 'اكسسوارات سيارات.txt',
    'اطفال و امومة.txt', 'اجهزة كهرومنزلية.txt', 'اثاث وديكور.txt'
  ];

  console.log(`\n╔══════════════════════════════════════════════════╗`);
  console.log(`║  🚀 بدء بوت ECOMIX (البوت الأول - مع الأقسام)    ║`);
  console.log(`╚══════════════════════════════════════════════════╝\n`);

  let shippingId = await getShippingProfile("vibe");
  if (!shippingId) {
      shippingId = await getShippingProfile("Vip"); // Fallback
  }

  for (const filename of files) {
    if (!fs.existsSync(filename)) {
      console.log(`⚠️ الملف ${filename} غير موجود، سيتم تخطيه.`);
      continue;
    }

    const categoryName = filename.replace('.txt', '').trim();
    console.log(`\n📁 جاري معالجة قسم: ${categoryName}`);
    
    // Create or get category
    const categoryId = await getOrCreateCategory(categoryName);
    
    const urls = fs.readFileSync(filename, 'utf8')
      .split('\n')
      .map(u => u.trim())
      .filter(u => u && !u.startsWith('//') && u.startsWith('http'));

    console.log(`العدد في هذا القسم: ${urls.length} منتج`);

    for (let i = 0; i < urls.length; i++) {
      console.log(`\n----------------------------------------`);
      console.log(`المنتج ${i + 1} من ${urls.length} (قسم: ${categoryName})`);
      const pUrl = urls[i];
      
      try {
        const idMatch = pUrl.match(/\/product\/(\d+)/);
        if (!idMatch) {
            console.log(`⚠️ تخطي المنتج: لم يتم العثور على ID في الرابط.`);
            continue;
        }
        const productId = idMatch[1];
        
        const res = await axios.get(`https://ecomix.vip/api/v1/product/${productId}?id=${productId}`);
        const pData = res.data.data;
        
        if (!pData || !pData.title) {
            console.log(`⚠️ تخطي المنتج: لم يتم العثور على بيانات في API.`);
            continue;
        }
        
        const cleanTitle = premiumTitleCleaner(pData.title);
        const description = stripHtml(pData.description) || cleanTitle;
        
        const currentPrice = pData.price || 0;
        let oldPrice = pData.selling || 0;
        if (oldPrice === 0 && currentPrice > 0) {
           oldPrice = Math.round(currentPrice * 1.15);
           oldPrice = Math.ceil(oldPrice / 100) * 100;
        } else if (currentPrice > oldPrice && oldPrice !== 0) { 
           let t = oldPrice; oldPrice = currentPrice; currentPrice = t; 
        }
        
        const baseUrl = 'https://tenants.toggaar.net/uploads/ecomix-toggaar-pro/';
        let imageUrls = [];
        if (pData.image) imageUrls.push(baseUrl + pData.image);
        if (pData.images && pData.images.length > 0) {
            pData.images.forEach(img => {
                if (img.image) imageUrls.push(baseUrl + img.image);
            });
        }
        // Remove duplicates
        imageUrls = [...new Set(imageUrls)];

        let mainImageRef = null;
        let galleryRefs = [];
        
        const productDoc = {
          _type: 'product',
          title: cleanTitle,
          slug: { _type: 'slug', current: slugify(cleanTitle) },
          price: oldPrice,
          discountPrice: currentPrice,
          description: description,
          stockStatus: 'in_stock',
          deliveryType: 'home'
        };

        // Check for duplicates before uploading images or saving
        const existingProduct = await client.fetch(`*[_type == "product" && title == $title][0]`, { title: cleanTitle });
        if (existingProduct) {
            console.log(`🔄 تحديث المنتج: "${cleanTitle}" موجود مسبقاً.`);
            
            const patchData = {
               price: oldPrice,
               discountPrice: currentPrice
            };
            if (categoryId) patchData.category = { _type: 'reference', _ref: categoryId };
            if (shippingId) patchData.shippingProfile = { _type: 'reference', _ref: shippingId };

            await client.patch(existingProduct._id).set(patchData).commit();
            continue;
        }

        if (imageUrls.length > 0) {
            mainImageRef = await uploadImageFromUrl(imageUrls[0]);
            for (let imgUrl of imageUrls.slice(1)) {
                let gRef = await uploadImageFromUrl(imgUrl);
                if (gRef) galleryRefs.push({ _type: 'image', _key: Math.random().toString(36).substring(7), asset: { _type: 'reference', _ref: gRef }});
            }
        }

        const totalImages = galleryRefs.length + (mainImageRef ? 1 : 0);

        if (categoryId) productDoc.category = { _type: 'reference', _ref: categoryId };
        if (shippingId) productDoc.shippingProfile = { _type: 'reference', _ref: shippingId };
        if (mainImageRef) productDoc.mainImage = { _type: 'image', asset: { _type: 'reference', _ref: mainImageRef } };
        if (galleryRefs.length > 0) productDoc.gallery = galleryRefs;

        await client.create(productDoc);

        console.log(`تم سحب ${totalImages} صور`);
        console.log(`تم سحب السعر (${currentPrice})`);
        console.log(`تم سحب الوصف`);
        if (categoryId) console.log(`تم الربط بالقسم: ${categoryName}`);
        if (shippingId) console.log(`تم ربط التوصيل`);

      } catch (error) {
        console.log(`❌ خطأ في المنتج: ${error.message}`);
      }
    }
  }
  console.log("\n🎉 انتهى بوت ECOMIX بنجاح!");
}

startBot1();
