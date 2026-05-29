const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'orlcqc8n',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-05-19',
  token: 'skazU0Rsj3mjdHt3iEtKNIhdnxA7HCr4KCbhEM8wUKuGVi2O3oNQKMNPGJ28aDAKLvEyMgKlVKb6DJD1srECtZ8op2HdpdxRT0efEZ8oZ9hjKMEGKr9opFeqAGmLdOVIks57fTb56EI24vEA29nBST72wu7px1z331qLryhH6U1RptarAGKi'
});

async function wipeData() {
  console.log("========================================");
  console.log("🧹 جاري مسح جميع المنتجات والأقسام... برجاء الانتظار...");
  
  let products = await client.fetch(`*[_type == "product"]._id`);
  console.log(`تم العثور على ${products.length} منتج للحذف.`);
  let count = 0;
  for (const id of products) {
    await client.delete(id).catch(e => console.error("Error deleting product", e.message));
    count++;
    if (count % 50 === 0) console.log(`تم مسح ${count} منتج...`);
  }
  
  let categories = await client.fetch(`*[_type == "category"]._id`);
  console.log(`تم العثور على ${categories.length} قسم للحذف.`);
  for (const id of categories) {
    await client.delete(id).catch(e => console.error("Error deleting category", e.message));
  }
  
  // Double check
  products = await client.fetch(`*[_type == "product"]._id`);
  categories = await client.fetch(`*[_type == "category"]._id`);
  if (products.length === 0 && categories.length === 0) {
      console.log("✅ تم التأكد: جميع المنتجات والأقسام تم مسحها كلياً بنجاح (0 متبقي)!");
  } else {
      console.log(`⚠️ تبقي ${products.length} منتجات و ${categories.length} أقسام لم يتم مسحها.`);
  }
  console.log("========================================\n");
}

wipeData();
