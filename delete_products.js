const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'orlcqc8n',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-05-19',
  token: 'skazU0Rsj3mjdHt3iEtKNIhdnxA7HCr4KCbhEM8wUKuGVi2O3oNQKMNPGJ28aDAKLvEyMgKlVKb6DJD1srECtZ8op2HdpdxRT0efEZ8oZ9hjKMEGKr9opFeqAGmLdOVIks57fTb56EI24vEA29nBST72wu7px1z331qLryhH6U1RptarAGKi'
});

async function deleteAllProducts() {
  console.log('🗑️ جاري مسح جميع المنتجات القديمة لضمان بيانات نظيفة 100%...');
  try {
    const products = await client.fetch(`*[_type == "product"]{_id}`);
    console.log(`تم العثور على ${products.length} منتج لحذفه.`);
    
    // Delete in batches to avoid rate limits
    for (let i = 0; i < products.length; i += 50) {
      const batch = products.slice(i, i + 50);
      const transaction = client.transaction();
      batch.forEach(p => transaction.delete(p._id));
      await transaction.commit();
      console.log(`✅ تم حذف ${i + batch.length} من ${products.length} منتج...`);
    }
    
    console.log('\n🎉 تم مسح كافة المنتجات بنجاح! المتجر الآن نظيف وجاهز.');
  } catch (err) {
    console.error('❌ خطأ أثناء الحذف:', err.message);
  }
}

deleteAllProducts();
