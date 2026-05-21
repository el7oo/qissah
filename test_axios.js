const axios = require('axios');
async function test() {
  try {
    const res = await axios.get('https://tenants.toggaar.net/uploads/ecomix-toggaar-pro/thumb-product-1740231351-3.png', { responseType: 'arraybuffer', timeout: 15000 });
    console.log('Success!', res.status);
  } catch (err) {
    console.log('Error:', err.message);
  }
}
test();
