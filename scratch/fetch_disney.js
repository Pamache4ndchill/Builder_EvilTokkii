import fs from 'fs';

async function fetchDisneyCharacters() {
  console.log("Fetching characters from Disney API...");
  try {
    const res = await fetch('https://api.disneyapi.dev/character?pageSize=500');
    const json = await res.json();
    
    // Filter characters that have an image and aren't obscure
    const characters = json.data
      .filter(c => c.imageUrl && c.name)
      .map(c => ({
        id: c._id,
        name: c.name,
        image: c.imageUrl,
        films: c.films || [],
        tvShows: c.tvShows || []
      }));
    
    fs.writeFileSync('E:/Imágenes/Tokkii/Builder_Tokkii/src/data/disney_raw.json', JSON.stringify(characters, null, 2));
    console.log(`Fetched ${characters.length} characters successfully!`);
  } catch (err) {
    console.error(err);
  }
}

fetchDisneyCharacters();
