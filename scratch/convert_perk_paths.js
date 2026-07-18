import fs from 'fs';

function convertPerkPaths(filePath) {
  console.log(`Converting paths in: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Regex to match the image line in the array, e.g. "image": "/Game/UI/..."
  const regex = /"image":\s*"([^"]+)"/g;
  
  const updatedContent = content.replace(regex, (match, path) => {
    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    // If it already has .png or is converted, keep it, otherwise append .png
    const finalFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
    return `"image": "/Imagenes/Perks/${finalFilename}"`;
  });
  
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`Successfully updated: ${filePath}`);
}

convertPerkPaths('E:/Imágenes/Tokkii/Builder_Tokkii/src/data/DbdPerks.ts');
convertPerkPaths('E:/Imágenes/Tokkii/Web/src/data/DbdPerks.ts');
