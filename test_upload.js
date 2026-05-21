const axios = require('axios');
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'orlcqc8n',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-05-19',
  token: 'skazU0Rsj3mjdHt3iEtKNIhdnxA7HCr4KCbhEM8wUKuGVi2O3oNQKMNPGJ28aDAKLvEyMgKlVKb6DJD1srECtZ8op2HdpdxRT0efEZ8oZ9hjKMEGKr9opFeqAGmLdOVIks57fTb56EI24vEA29nBST72wu7px1z331qLryhH6U1RptarAGKi'
});

async function uploadImageFromUrl(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
    const buffer = Buffer.from(response.data, 'binary');
    const asset = await client.assets.upload('image', buffer, {
      filename: 'luxury-product.jpg'
    });
    console.log('Success!', asset._id);
  } catch (err) {
    console.log('Error:', err.message);
  }
}

uploadImageFromUrl('https://tenants.toggaar.net/uploads/ecomix-toggaar-pro/thumb-product-1740231351-3.png');
