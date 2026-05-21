const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'orlcqc8n',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-05-19',
});

async function check() {
  const p = await client.fetch('*[_type=="shippingProfile"]{_id, name}');
  console.log(p);
}
check();
