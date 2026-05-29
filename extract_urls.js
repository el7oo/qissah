const fs = require('fs');
const content = fs.readFileSync('debug.html', 'utf8');
const urls = content.match(/https?:\/\/[^\s"'<>\\]+\.(png|jpe?g|webp|gif)/ig);
console.log([...new Set(urls)].join('\n'));
