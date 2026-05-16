const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
if (privateKey.startsWith('"') && privateKey.endsWith('"')) privateKey = privateKey.slice(1, -1);
if (privateKey.startsWith("'") && privateKey.endsWith("'")) privateKey = privateKey.slice(1, -1);
privateKey = privateKey.replace(/\\n/g, '\n');

const client = new JWT({
  email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  key: privateKey,
  scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/datastore'],
});

client.getAccessToken()
  .then(token => console.log('SUCCESS! Token:', token.token.slice(0, 15) + '...'))
  .catch(err => {
    console.error('ERROR generating access token:', err);
    if (err.response && err.response.data) {
      console.error('Response data:', err.response.data);
    }
  });
