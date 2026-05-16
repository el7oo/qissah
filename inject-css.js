const fs = require('fs');
const svg = fs.readFileSync('public/topography.svg', 'utf8');
const b64 = Buffer.from(svg).toString('base64');
const dataUri = 'url("data:image/svg+xml;base64,' + b64 + '")';

let css = fs.readFileSync('src/app/globals.css', 'utf8');
css = css.replace(/url\('\/topography\.svg'\)/g, dataUri);
css = css.replace(/opacity: 0\.12;/g, 'opacity: 0.25;');
css = css.replace(/opacity: 0\.08;/g, 'opacity: 0.15;');

fs.writeFileSync('src/app/globals.css', css);
console.log('Injected Base64 SVG into CSS');
