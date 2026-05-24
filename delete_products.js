const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'orlcqc8n',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-05-19',
  token: 'skazU0Rsj3mjdHt3iEtKNIhdnxA7HCr4KCbhEM8wUKuGVi2O3oNQKMNPGJ28aDAKLvEyMgKlVKb6DJD1srECtZ8op2HdpdxRT0efEZ8oZ9hjKMEGKr9opFeqAGmLdOVIks57fTb56EI24vEA29nBST72wu7px1z331qLryhH6U1RptarAGKi'
});

async function deleteAllProducts() {
  try {
    console.log('Fetching products to delete...');
    const products = await client.fetch(`*[_type == "product"]{_id}`);
    console.log(`Found ${products.length} products.`);
    
    if (products.length === 0) {
      console.log('No products to delete.');
      return;
    }

    const transaction = client.transaction();
    products.forEach(p => transaction.delete(p._id));
    
    console.log('Committing deletion transaction...');
    await transaction.commit();
    console.log('✅ Successfully deleted all products!');
  } catch (error) {
    console.error('Error deleting products:', error);
  }
}

deleteAllProducts();
