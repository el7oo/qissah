const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'orlcqc8n',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-05-19',
  token: 'skazU0Rsj3mjdHt3iEtKNIhdnxA7HCr4KCbhEM8wUKuGVi2O3oNQKMNPGJ28aDAKLvEyMgKlVKb6DJD1srECtZ8op2HdpdxRT0efEZ8oZ9hjKMEGKr9opFeqAGmLdOVIks57fTb56EI24vEA29nBST72wu7px1z331qLryhH6U1RptarAGKi'
});

async function updateSanityCategories() {
  console.log('🔄 جاري تحديث الأقسام في Sanity...');
  try {
    // Fetch all categories
    const categories = await client.fetch(`*[_type == "category"]`);
    
    for (const cat of categories) {
      if (cat.title === 'منتجات بالجملة' || cat.title?.ar === 'منتجات بالجملة') {
        console.log(`🗑️ جاري حذف قسم: ${cat.title}`);
        await client.delete(cat._id);
        console.log('✅ تم الحذف بنجاح.');
      } else if (cat.title === 'منتجات الصيف' || cat.title?.ar === 'منتجات الصيف') {
        console.log(`🏖️ جاري إضافة ايموجي لقسم: ${cat.title}`);
        await client.patch(cat._id).set({ icon: '🏖️' }).commit();
        console.log('✅ تم التحديث بنجاح.');
      } else if (cat.title === 'صحة ولياقة' || cat.title?.ar === 'صحة ولياقة') {
        console.log(`🏋️ جاري إضافة ايموجي لقسم: ${cat.title}`);
        await client.patch(cat._id).set({ icon: '🏋️' }).commit();
        console.log('✅ تم التحديث بنجاح.');
      }
    }
    console.log('🎉 تمت عملية التحديث بنجاح!');
  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  }
}

updateSanityCategories();
