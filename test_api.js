const axios = require('axios');

async function testApi() {
  try {
    const res = await axios.get('https://ecomix.vip/api/v1/product/728655070?id=728655070', {
       headers: {
         'User-Agent': 'Mozilla/5.0'
       }
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}
testApi();
