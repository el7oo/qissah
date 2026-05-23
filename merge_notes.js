const fs = require('fs');
const path = require('path');

const directoryPath = __dirname;
const files = fs.readdirSync(directoryPath);
let allUrls = new Set();
let fileCount = 0;

files.forEach(file => {
  if (file.endsWith('.txt') && file !== 'vanessia.txt' && file !== 'urls.txt') {
    const filePath = path.join(directoryPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const urls = content.split('\n').map(u => u.trim()).filter(u => u.length > 0);
    urls.forEach(u => allUrls.add(u));
    fileCount++;
    console.log(`تمت قراءة ${urls.length} رابط من ملف ${file}`);
  }
});

if (fs.existsSync('urls.txt')) {
  const content = fs.readFileSync('urls.txt', 'utf-8');
  const urls = content.split('\n').map(u => u.trim()).filter(u => u.length > 0 && !u.startsWith('//'));
  urls.forEach(u => allUrls.add(u));
}

const uniqueUrls = Array.from(allUrls);
const header = `// العدد الإجمالي للمنتجات المدمجة: ${uniqueUrls.length}\n`;
fs.writeFileSync('urls.txt', header + uniqueUrls.join('\n'));

console.log(`\n🎉 تم دمج الروابط بنجاح!`);
console.log(`📂 عدد الملفات التي تم دمجها: ${fileCount}`);
console.log(`📦 العدد الإجمالي للروابط الفريدة: ${uniqueUrls.length}`);
console.log(`تم حفظ الجميع في ملف urls.txt`);
