const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'orlcqc8n',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-05-19',
  token: 'skazU0Rsj3mjdHt3iEtKNIhdnxA7HCr4KCbhEM8wUKuGVi2O3oNQKMNPGJ28aDAKLvEyMgKlVKb6DJD1srECtZ8op2HdpdxRT0efEZ8oZ9hjKMEGKr9opFeqAGmLdOVIks57fTb56EI24vEA29nBST72wu7px1z331qLryhH6U1RptarAGKi'
});

async function fixPrices() {
  console.log('🔄 جاري عكس الأسعار لجميع المنتجات...');
  try {
    const products = await client.fetch(`*[_type == "product"]{_id, title, price, discountPrice}`);
    console.log(`تم العثور على ${products.length} منتج.`);
    
    let count = 0;
    for (const p of products) {
      if (p.price && p.discountPrice && p.price < p.discountPrice) {
        // Swap them
        await client.patch(p._id)
          .set({
            price: p.discountPrice,
            discountPrice: p.price
          })
          .commit();
        console.log(`✅ تم عكس أسعار: ${p.title} (${p.price} <-> ${p.discountPrice})`);
        count++;
      }
    }
    console.log(`🎉 اكتملت العملية بنجاح! تم تصحيح أسعار ${count} منتج.`);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

fixPrices();
