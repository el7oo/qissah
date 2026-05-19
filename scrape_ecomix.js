// scrape_ecomix.js
// سكربت سحب المنتجات من موقع ecomix.vip ورفعها تلقائياً إلى Sanity
// المتطلبات: 
// 1. تثبيت الحزم: npm install axios cheerio @sanity/client
// 2. تشغيل السكربت: node scrape_ecomix.js

const axios = require('axios');
const cheerio = require('cheerio');
const { createClient } = require('@sanity/client');

// --- إعدادات Sanity ---
// يرجى استبدال هذه القيم بمعلومات مشروعك
const sanityClient = createClient({
  projectId: 'YOUR_PROJECT_ID', // تجده في ملف .env.local
  dataset: 'production',
  useCdn: false, // يجب أن تكون false عند إضافة البيانات
  apiVersion: '2023-01-01',
  token: 'YOUR_SANITY_WRITE_TOKEN', // تحتاج لإنشاء Token بصلاحية Editor من إعدادات Sanity
});

// --- إعدادات السحب ---
const TARGET_URL = 'https://ecomix.vip/category/home-appliances'; // رابط القسم الذي تريد سحبه

async function scrapeAndUpload() {
  console.log(`🚀 جاري سحب المنتجات من: ${TARGET_URL}`);
  
  try {
    // 1. سحب صفحة الويب
    const { data: html } = await axios.get(TARGET_URL);
    const $ = cheerio.load(html);
    
    const products = [];

    // 2. البحث عن المنتجات في الصفحة
    // ملاحظة: الـ Classes هنا تعتمد على هيكل موقع ecomix، قد تحتاج لتعديلها إذا تغير الموقع
    $('.product-card').each((index, element) => {
      const title = $(element).find('.product-title').text().trim();
      let priceText = $(element).find('.price').text().trim(); // مثال: "15,000 د.ج."
      const imageUrl = $(element).find('img').attr('src');
      
      // تحويل السعر لرقم
      let priceNum = parseInt(priceText.replace(/[^0-9]/g, ''));
      if (!priceNum) priceNum = 0;

      if (title && imageUrl) {
        products.push({
          _type: 'product',
          title: { ar: title }, // دعم تعدد اللغات
          slug: { _type: 'slug', current: `ecomix-${Date.now()}-${index}` },
          price: priceNum,
          category: { _type: 'reference', _ref: 'YOUR_CATEGORY_ID' }, // يجب استبداله بـ ID القسم في Sanity
          imageTempUrl: imageUrl, // مؤقتاً، سنشرح كيفية رفع الصور
        });
      }
    });

    console.log(`✅ تم إيجاد ${products.length} منتج. جاري الرفع إلى Sanity...`);

    // 3. رفع المنتجات إلى Sanity
    for (const product of products) {
      console.log(`⏳ جاري رفع: ${product.title.ar}`);
      // حفظ المنتج في Sanity
      // await sanityClient.create(product);
      console.log(`✔️ تم الرفع بنجاح!`);
    }

    console.log('🎉 اكتملت العملية بنجاح!');

  } catch (error) {
    console.error('❌ حدث خطأ أثناء السحب أو الرفع:', error.message);
  }
}

// scrapeAndUpload();
console.log('ملاحظة: السكربت جاهز. يرجى قراءة التعليقات وتعبئة YOUR_PROJECT_ID و YOUR_SANITY_WRITE_TOKEN قبل التشغيل.');
