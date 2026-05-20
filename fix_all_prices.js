const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'orlcqc8n',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-05-19',
  token: 'skazU0Rsj3mjdHt3iEtKNIhdnxA7HCr4KCbhEM8wUKuGVi2O3oNQKMNPGJ28aDAKLvEyMgKlVKb6DJD1srECtZ8op2HdpdxRT0efEZ8oZ9hjKMEGKr9opFeqAGmLdOVIks57fTb56EI24vEA29nBST72wu7px1z331qLryhH6U1RptarAGKi'
});

async function fixAllPrices() {
  console.log('🔄 بدء عملية تصحيح الأسعار لجميع المنتجات...');
  
  try {
    const products = await client.fetch(`*[_type == "product"]{_id, price, discountPrice, title}`);
    console.log(`تم العثور على ${products.length} منتج في قاعدة البيانات.`);
    
    let updatedCount = 0;
    
    for (const p of products) {
      if (!p.price) continue;
      
      let needsUpdate = false;
      let newDiscountPrice = p.discountPrice;
      
      // If there is no discount price, OR if discount price is the same/less than the actual price
      if (!p.discountPrice || p.discountPrice <= p.price) {
        newDiscountPrice = Math.round(p.price * 1.15); // +15%
        newDiscountPrice = Math.ceil(newDiscountPrice / 100) * 100; // Round to nearest 100
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await client.patch(p._id)
          .set({ discountPrice: newDiscountPrice })
          .commit();
        console.log(`✅ تم تصحيح تخفيض منتج: ${p.title} (السعر: ${p.price} -> القديم: ${newDiscountPrice})`);
        updatedCount++;
      }
    }
    
    console.log(`\n🎉 اكتملت العملية! تم تحديث أسعار ${updatedCount} منتج.`);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

fixAllPrices();
