fetch('https://ecomix.vip/categories', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
})
  .then(res => res.text())
  .then(html => {
    require('fs').writeFileSync('ecomix.html', html);
    console.log('Saved to ecomix.html');
  })
  .catch(err => console.error(err));
