require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('./luxara-store-firebase-adminsdk-fbsvc-50fc4055d3.json');

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

async function deleteAllOrders() {
  console.log('🗑️ جاري مسح جميع الطلبات السابقة...');
  try {
    const ordersRef = db.collection('orders');
    const snapshot = await ordersRef.get();
    
    if (snapshot.empty) {
      console.log('✅ لا توجد طلبات لحذفها.');
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`🎉 تم مسح ${snapshot.size} طلب(طلبات) بنجاح!`);
  } catch (error) {
    console.error('❌ خطأ أثناء الحذف:', error.message);
  }
}

deleteAllOrders();
