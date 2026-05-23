const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'orlcqc8n',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-05-19',
  token: 'skazU0Rsj3mjdHt3iEtKNIhdnxA7HCr4KCbhEM8wUKuGVi2O3oNQKMNPGJ28aDAKLvEyMgKlVKb6DJD1srECtZ8op2HdpdxRT0efEZ8oZ9hjKMEGKr9opFeqAGmLdOVIks57fTb56EI24vEA29nBST72wu7px1z331qLryhH6U1RptarAGKi'
});

async function wipeData() {
  console.log("Wiping all products and categories...");
  const products = await client.fetch(`*[_type == "product"]._id`);
  console.log(`Found ${products.length} products to delete.`);
  for (const id of products) {
    await client.delete(id).catch(console.error);
  }
  
  const categories = await client.fetch(`*[_type == "category"]._id`);
  console.log(`Found ${categories.length} categories to delete.`);
  for (const id of categories) {
    await client.delete(id).catch(console.error);
  }
  
  console.log("Wipe complete!");
}

wipeData();
