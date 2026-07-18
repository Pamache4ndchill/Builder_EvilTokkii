import fs from 'fs';

const content = fs.readFileSync('E:/Imágenes/Tokkii/Builder_Tokkii/src/App.jsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.includes("from('whitelist')") || line.includes('whitelist')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
