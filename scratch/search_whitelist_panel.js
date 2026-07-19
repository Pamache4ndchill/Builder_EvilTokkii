import fs from 'fs';

const content = fs.readFileSync('E:/Imágenes/Tokkii/Builder_Tokkii/src/App.jsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.includes('whitelist') || line.includes('access_news') || line.includes('Aprobados')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
