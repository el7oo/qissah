const fs = require('fs');

function readEnv(name) {
  const text = fs.readFileSync('.env.local', 'utf8');
  const line = text
    .split(/\r?\n/)
    .find((l) => l.startsWith(`${name}=`));
  if (!line) return '';
  return line.slice(name.length + 1).replace(/^"/, '').replace(/"$/, '');
}

async function run() {
  const base = 'http://localhost:3000';

  const productsRes = await fetch(`${base}/api/products`);
  const productsJson = await productsRes.json();
  const products = Array.isArray(productsJson.products) ? productsJson.products : [];
  console.log('products_status', productsRes.status, 'count', products.length);
  if (products.length === 0) {
    console.log('no_products_abort');
    return;
  }

  const orderBody = {
    items: [{ id: products[0].id, quantity: 1 }],
    shipping: {
      fullName: 'Smoke Test User',
      phone: '0550000000',
      wilayaId: 16,
      deliveryType: 'desk',
      addressLine1: '',
    },
  };

  const unauthOrder = await fetch(`${base}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderBody),
  });
  console.log('order_post_unauth', unauthOrder.status);

  const insforgeBase = readEnv('NEXT_PUBLIC_INSFORGE_BASE_URL').replace(/\/+$/, '');
  const anonKey = readEnv('NEXT_PUBLIC_INSFORGE_ANON_KEY');
  if (!insforgeBase || !anonKey) {
    console.log('missing_insforge_env');
    return;
  }

  // Try login with generated credential (may fail if account not present).
  const testEmail = `smoketest+${Date.now()}@example.com`;
  const loginRes = await fetch(`${insforgeBase}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      email: testEmail,
      password: 'TempPass123!',
      client_type: 'web',
    }),
  });
  console.log('insforge_login_status', loginRes.status);
  const loginText = await loginRes.text();

  let token = '';
  try {
    const j = JSON.parse(loginText);
    token =
      j?.session?.accessToken ||
      j?.accessToken ||
      j?.data?.session?.accessToken ||
      '';
  } catch {
    token = '';
  }

  if (!token) {
    console.log('no_token_obtained');
    return;
  }

  const authOrder = await fetch(`${base}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderBody),
  });
  console.log('order_post_auth', authOrder.status);
  console.log('order_post_auth_body', (await authOrder.text()).slice(0, 240));

  const authGet = await fetch(`${base}/api/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log('orders_get_auth', authGet.status);
  console.log('orders_get_auth_body', (await authGet.text()).slice(0, 240));
}

run().catch((err) => {
  console.error('smoke_error', err?.message || err);
  process.exit(1);
});

