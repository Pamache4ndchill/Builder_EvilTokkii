const API_KEY = 'c643beea1b2997e11c80b80ee67803ea';

async function test() {
  console.log("Testing SGDB Search...");
  try {
    const res = await fetch(`https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent("Elden Ring")}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    const json = await res.json();
    console.log("Search Result:", JSON.stringify(json, null, 2));
    
    if (json.success && json.data && json.data.length > 0) {
      const gameId = json.data[0].id;
      console.log(`Found Elden Ring ID: ${gameId}`);
      console.log("Fetching Grids...");
      const resGrids = await fetch(`https://www.steamgriddb.com/api/v2/grids/game/${gameId}?dimensions=600x900`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });
      const jsonGrids = await resGrids.json();
      console.log("Grids Result:", JSON.stringify(jsonGrids, null, 2));
    }
  } catch (err) {
    console.error(err);
  }
}

test();
