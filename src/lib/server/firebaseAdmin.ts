import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`[FirebaseAdmin] Missing required env var: ${name}`);
  }
  return value;
}

let cachedApp: App | null = null;

function initFirebaseAdmin(): App {
  if (cachedApp) return cachedApp;
  if (getApps().length > 0) {
    cachedApp = getApps()[0]!;
    return cachedApp;
  }

  const projectId = required('FIREBASE_ADMIN_PROJECT_ID');
  const clientEmail = required('FIREBASE_ADMIN_CLIENT_EMAIL');
  let privateKey = required('FIREBASE_ADMIN_PRIVATE_KEY');
  // Remove surrounding quotes if they exist
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  cachedApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
  return cachedApp;
}

export function getAdminDb() {
  return getFirestore(initFirebaseAdmin());
}
