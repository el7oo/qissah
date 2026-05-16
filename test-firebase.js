require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
if (privateKey.startsWith('"') && privateKey.endsWith('"')) privateKey = privateKey.slice(1, -1);
if (privateKey.startsWith("'") && privateKey.endsWith("'")) privateKey = privateKey.slice(1, -1);
privateKey = privateKey.replace(/\\n/g, '\n');

console.log('Key length:', privateKey.length);
console.log('Key starts with:', privateKey.slice(0, 30));
console.log('Key ends with:', privateKey.slice(-30));
console.log('Project ID:', process.env.FIREBASE_ADMIN_PROJECT_ID);

try {
  const app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    })
  });
  
  const db = getFirestore(app);
  db.collection('orders').limit(1).get()
    .then(() => console.log('SUCCESS! Firebase works!'))
    .catch(e => console.error('ERROR from Firebase:', e.message));
} catch (e) {
  console.error('ERROR Initializing:', e.message);
}
