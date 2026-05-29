const axios = require('axios');

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s{2,}/g, ' ').trim();
}

async function run() {
  const url = 'https://ecomix.vip/Speaker_Mini_Portable/product/728655070';
  const idMatch = url.match(/\/product\/(\d+)/);
  if (!idMatch) return;
  const id = idMatch[1];
  
  const res = await axios.get(`https://ecomix.vip/api/v1/product/${id}?id=${id}`);
  const p = res.data.data;
  
  const title = p.title;
  const description = stripHtml(p.description) || title;
  const price = p.price; // 4000
  const oldPrice = p.selling || 0; // 4500
  
  let allImages = [];
  const baseUrl = 'https://tenants.toggaar.net/uploads/ecomix-toggaar-pro/';
  if (p.image) allImages.push(baseUrl + p.image);
  if (p.images && p.images.length > 0) {
     p.images.forEach(img => {
        allImages.push(baseUrl + img.image);
     });
  }
  
  console.log('Title:', title);
  console.log('Price:', price);
  console.log('Old Price:', oldPrice);
  console.log('Desc Length:', description.length);
  console.log('Images:', allImages);
}
run();
