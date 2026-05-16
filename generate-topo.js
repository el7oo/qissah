const fs = require('fs');

const width = 800;
const height = 800;
const numLines = 25;

let paths = '';

// Generate multiple organic looking wavy loops for a topography effect
for (let i = 0; i < numLines; i++) {
  const scale = 1 - (i / numLines);
  const cx = 400 + Math.sin(i * 0.5) * 60;
  const cy = 400 + Math.cos(i * 0.3) * 60;
  
  let d = `M ${cx + 350 * scale} ${cy} `;
  for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
    const r = 350 * scale + Math.sin(angle * 5 + i) * 40 * scale + Math.cos(angle * 3) * 20 * scale;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    d += `L ${x} ${y} `;
  }
  d += 'Z';
  paths += `<path d="${d}" fill="none" stroke="#000000" stroke-width="2" opacity="${0.15 + scale * 0.2}" />\n`;
}

// Add a second set of lines for complexity
for (let i = 0; i < numLines - 5; i++) {
  const scale = 1 - (i / (numLines - 5));
  const cx = 100 + Math.cos(i * 0.4) * 80;
  const cy = 100 + Math.sin(i * 0.6) * 80;
  
  let d = `M ${cx + 250 * scale} ${cy} `;
  for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
    const r = 250 * scale + Math.sin(angle * 4 + i * 2) * 35 * scale;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    d += `L ${x} ${y} `;
  }
  d += 'Z';
  paths += `<path d="${d}" fill="none" stroke="#000000" stroke-width="2" opacity="${0.15 + scale * 0.2}" />\n`;
}

const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${paths}
</svg>`;

fs.writeFileSync('public/topography.svg', svg);
console.log('Topography SVG generated successfully!');
