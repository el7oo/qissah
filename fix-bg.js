const fs = require('fs');

let css = fs.readFileSync('src/app/globals.css', 'utf8');

// Replace body::before with .lx::before
css = css.replace(/body::before/g, '.lx::before');

// Make sure .lx has position relative if needed, but it already has it in luxara.css
// Update driftAnim if it's not large enough
css = css.replace(/width: 100vw;/, 'width: 200%;');
css = css.replace(/height: 100vh;/, 'height: 200%;');
css = css.replace(/top: 0;/, 'top: -50%;');
css = css.replace(/left: 0;/, 'left: -50%;');
css = css.replace(/position: fixed;/, 'position: absolute;');

fs.writeFileSync('src/app/globals.css', css);
console.log('Updated CSS to target .lx instead of body');
