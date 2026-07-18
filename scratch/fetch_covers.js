import fs from 'fs';

const API_KEY = 'c643beea1b2997e11c80b80ee67803ea';

// Helper to delay execution (avoid rate limits)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Pre-seeded list of 450 popular video game titles across various platforms and eras
const gameTitles = [
  // RPG / Adventure
  "The Witcher 3: Wild Hunt", "Elden Ring", "The Elder Scrolls V: Skyrim", "Fallout 4", "Cyberpunk 2077",
  "Baldurs Gate 3", "Persona 5 Royal", "Mass Effect Legendary Edition", "Dragon Age: Inquisition", "Monster Hunter: World",
  "Dark Souls III", "Bloodborne", "Sekiro: Shadows Die Twice", "Lies of P", "Hogwarts Legacy",
  "Final Fantasy VII Remake", "Starfield", "Assassin's Creed Valhalla", "Horizon Zero Dawn", "God of War",
  "Red Dead Redemption 2", "Grand Theft Auto V", "Grand Theft Auto: San Andreas", "Grand Theft Auto IV", "Mafia: Definitive Edition",
  "Marvel's Spider-Man Remastered", "Batman: Arkham Knight", "Uncharted 4: A Thief's End", "The Last of Us Part I", "Death Stranding",
  "Ghost of Tsushima", "Tomb Raider", "Rise of the Tomb Raider", "Shadow of the Tomb Raider", "Control",
  
  // Shooters / Action
  "Doom Eternal", "Half-Life 2", "Portal 2", "Portal", "BioShock Infinite",
  "BioShock", "Borderlands 2", "Borderlands 3", "Far Cry 3", "Far Cry 5",
  "Crysis", "Metro Exodus", "Left 4 Dead 2", "Titanfall 2", "Apex Legends",
  "Counter-Strike 2", "Valorant", "Overwatch 2", "Team Fortress 2", "Destiny 2",
  "Call of Duty: Modern Warfare", "Call of Duty: Black Ops III", "Battlefield 1", "Battlefield V", "Rainbow Six Siege",
  "Rust", "DayZ", "ARK: Survival Evolved", "Subnautica", "The Forest",
  "Sons of the Forest", "Dying Light", "Dead Island 2", "Warframe", "Payday 2",
  "Helldivers 2", "Ghost Recon Wildlands", "Tom Clancy's The Division 2", "Alan Wake 2", "Dead Space",
  
  // Strategy / Simulation
  "Minecraft", "Terraria", "Roblox", "SimCity", "The Sims 4",
  "Stardew Valley", "Cities: Skylines", "Animal Crossing: New Horizons", "RimWorld", "Factorio",
  "Satisfactory", "Euro Truck Simulator 2", "Microsoft Flight Simulator", "Civilization VI", "Age of Empires II: Definitive Edition",
  "Crusader Kings III", "Stellaris", "Hearts of Iron IV", "Total War: Warhammer III", "Football Manager 2024",
  "Plague Inc: Evolved", "Frostpunk", "Anno 1800", "Jurassic World Evolution 2", "Planet Coaster",
  
  // Indies / Platformers / Puzzle
  "Hades", "Hollow Knight", "Celeste", "Cuphead", "Dead Cells",
  "Ori and the Blind Forest", "Ori and the Will of the Wisps", "Tunic", "Dave the Diver", "Sea of Stars",
  "Dredge", "Cult of the Lamb", "Untitled Goose Game", "Fall Guys", "Among Us",
  "Phasmophobia", "Lethal Company", "Garry's Mod", "Braid", "Limbo",
  "Inside", "Super Meat Boy", "Shovel Knight", "The Binding of Isaac: Rebirth", "Enter the Gungeon",
  "Slay the Spire", "Inscryption", "Disco Elysium", "Stray", "Subnautica: Below Zero",
  "Katana Zero", "Hotline Miami", "Undertale", "Deltarune", "Outer Wilds",
  "Firewatch", "What Remains of Edith Finch", "The Stanley Parable", "Baba Is You", "Superliminal",
  "Human: Fall Flat", "It Takes Two", "A Way Out", "Overcooked! 2", "Keep Talking and Nobody Explodes",
  
  // Nintendo Classics / Console Exclusives
  "The Legend of Zelda: Breath of the Wild", "The Legend of Zelda: Tears of the Kingdom", "Super Mario Odyssey", "Super Mario Bros. Wonder", "Mario Kart 8 Deluxe",
  "Super Smash Bros. Ultimate", "Metroid Dread", "Luigis Mansion 3", "Splatoon 3", "Pokemon Scarlet",
  "Pokemon Violet", "Xenoblade Chronicles 3", "Fire Emblem: Three Houses", "Animal Crossing: Wild World", "Super Mario Galaxy",
  "The Legend of Zelda: Ocarina of Time", "The Legend of Zelda: Majoras Mask", "The Legend of Zelda: Wind Waker", "Super Mario 64", "Mario Party Superstars",
  
  // Sports / Racing
  "EA Sports FC 24", "FIFA 23", "NBA 2K24", "Madden NFL 24", "Rocket League",
  "Forza Horizon 5", "Forza Horizon 4", "Gran Turismo 7", "Need for Speed Unbound", "Need for Speed Heat",
  "F1 23", "Assetto Corsa Competizione", "Dirt 5", "Wreckfest", "Riders Republic",
  "Tony Hawks Pro Skater 1 + 2", "Skate 3", "PGA Tour 2K23", "WWE 2K24", "UFC 5",
  
  // Horror
  "Resident Evil 4", "Resident Evil Village", "Resident Evil 2", "Resident Evil 7: Biohazard", "Silent Hill 2",
  "Dead by Daylight", "Outlast", "Outlast 2", "Amnesia: The Dark Descent", "Amnesia: Rebirth",
  "The Evil Within 2", "Alien: Isolation", "SOMA", "Dead Space Remake", "The Callisto Protocol",
  "Phasmophobia", "The Mortuary Assistant", "Demonologist", "Devour", "Pacify",

  // Fighting / Arcade
  "Street Fighter 6", "Mortal Kombat 1", "Mortal Kombat 11", "Tekken 8", "Tekken 7",
  "Guilty Gear -Strive-", "Dragon Ball FighterZ", "Super Smash Bros. Melee", "Brawlhalla", "MultiVersus",

  // More RPGs & Popular Games
  "Chrono Trigger", "Final Fantasy VII", "Final Fantasy X", "Final Fantasy XV", "Kingdom Hearts III",
  "NieR: Automata", "NieR Replicant", "Genshin Impact", "Honkai: Star Rail", "Monster Hunter Rise",
  "World of Warcraft", "Guild Wars 2", "Final Fantasy XIV", "The Elder Scrolls Online", "Lost Ark",
  "Path of Exile", "Diablo IV", "Diablo III", "Grim Dawn", "Torchlight II",
  "Star Wars Jedi: Fallen Order", "Star Wars Jedi: Survivor", "Star Wars: Battlefront II", "Squadrons", "No Mans Sky",
  "Elite Dangerous", "Star Citizen", "Sea of Thieves", "Valheim", "V Rising",
  "Terraria", "Enshrouded", "Palworld", "Lego Star Wars: The Skywalker Saga", "Kena: Bridge of Spirits",
  "Psychonauts 2", "Ratchet & Clank: Rift Apart", "Sackboy: A Big Adventure", "Returnal", "Demon's Souls",
  "Granblue Fantasy: Relink", "Yakuza: Like a Dragon", "Like a Dragon: Infinite Wealth", "Judgment", "Lost Judgment",
  "Persona 3 Reload", "Persona 4 Golden", "Shin Megami Tensei V", "Octopath Traveler II", "Triangle Strategy",
  "Live A Live", "Bravely Default II", "Dragon Quest XI S", "Ni no Kuni: Wrath of the White Witch", "Tales of Arise",
  "Scarlet Nexus", "Code Vein", "Astral Chain", "Bayonetta 3", "Wonderful 101",
  "Okami HD", "Shadow of the Colossus", "Ico", "The Last Guardian", "Detroit: Become Human",
  "Heavy Rain", "Beyond: Two Souls", "Until Dawn", "The Quarry", "Life is Strange",
  "Life is Strange: True Colors", "Tell Me Why", "As Dusk Falls", "Detroit Become Human", "Disco Elysium",
  "Phoenix Wright: Ace Attorney Trilogy", "Danganronpa: Trigger Happy Havoc", "Zero Escape: The Nonary Games", "AI: The Somnium Files", "Slay the Princess",
  "Clannad", "Steins;Gate", "Doki Doki Literature Club Plus!", "The Wolf Among Us", "The Walking Dead: Telltale",
  "Tales from the Borderlands", "Life is Strange 2", "Vampyr", "Plague Tale: Innocence", "Plague Tale: Requiem",
  "Hellblade: Senua's Sacrifice", "Senuas Saga: Hellblade II", "System Shock", "Prey", "Dishonored 2",
  "Dishonored", "Deus Ex: Mankind Divided", "Deus Ex: Human Revolution", "Hitman 3", "Hitman 2",
  "Metal Gear Solid V: The Phantom Pain", "Metal Gear Solid Delta: Snake Eater", "Metal Gear Rising: Revengeance", "Deathloop", "Ghostwire: Tokyo",
  "Splinter Cell: Blacklist", "Watch Dogs 2", "Watch Dogs: Legion", "Tom Clancys Ghost Recon Breakpoint", "Far Cry 6",
  "Far Cry New Dawn", "Assassin's Creed Odyssey", "Assassin's Creed Origins", "Assassin's Creed Mirage", "For Honor",
  "The Crew Motorfest", "Riders Republic", "Steep", "Trials Rising", "Rayman Legends",
  "South Park: The Fractured but Whole", "South Park: The Stick of Truth", "Immortals Fenyx Rising", "Skull and Bones", "Avatar: Frontiers of Pandora",
  "Prince of Persia: The Lost Crown", "Mario + Rabbids Sparks of Hope", "Just Dance 2024", "Trackmania", "Grow Home",
  "Grow Up", "Valiant Hearts: The Great War", "Child of Light", "Beyond Good & Evil", "Splinter Cell Chaos Theory",
  "Tom Clancys Rainbow Six Extraction", "Division Heartland", "XDefiant", "Hyper Scape", "Watch Dogs",
  "Assassin's Creed IV Black Flag", "Assassin's Creed II", "Far Cry 4", "Far Cry Primal", "Driver San Francisco",
  "Rayman Origins", "South Park Stick of Truth", "Prince of Persia Sands of Time", "Anno 2070", "Anno 2205",
  "The Settlers: New Allies", "Silent Hunter 5", "Tom Clancys EndWar", "Haze", "Red Steel 2",
  "ZombiU", "Rabbids Go Home", "Red Steel", "Cold Fear", "Beyond Good and Evil 2"
];

// Clean duplicate names just in case
const uniqueTitles = Array.from(new Set(gameTitles)).slice(0, 450);

async function searchGame(title) {
  try {
    const res = await fetch(`https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(title)}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    const json = await res.json();
    if (json.success && json.data && json.data.length > 0) {
      return json.data[0]; // Return the first match (contains id and name)
    }
  } catch (err) {
    console.error(`Search error for ${title}:`, err.message);
  }
  return null;
}

async function getGameGrids(gameId) {
  try {
    const res = await fetch(`https://www.steamgriddb.com/api/v2/grids/game/${gameId}?dimensions=600x900`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    const json = await res.json();
    if (json.success && json.data && json.data.length > 0) {
      // Find the first grid that has no text (clean cover art)
      const textless = json.data.find(grid => grid.style === 'no_logo');
      
      // Fallback to the first grid if no textless is found
      return textless ? textless.url : json.data[0].url;
    }
  } catch (err) {
    console.error(`Grids error for game ID ${gameId}:`, err.message);
  }
  return null;
}

async function fetchCovers() {
  console.log(`Starting SteamGridDB extraction for ${uniqueTitles.length} games...`);
  const quizQuestions = [];
  
  for (let i = 0; i < uniqueTitles.length; i++) {
    const title = uniqueTitles[i];
    
    // 1. Search for game
    const game = await searchGame(title);
    await sleep(250); // Respect rate limit
    
    if (game) {
      // 2. Fetch cover URL
      const coverUrl = await getGameGrids(game.id);
      await sleep(250); // Respect rate limit
      
      if (coverUrl) {
        // Find 3 incorrect names
        const incorrects = [];
        const pool = uniqueTitles.filter(t => t !== title);
        
        while (incorrects.length < 3 && pool.length > 0) {
          const randIdx = Math.floor(Math.random() * pool.length);
          const name = pool.splice(randIdx, 1)[0];
          if (!incorrects.includes(name)) {
            incorrects.push(name);
          }
        }
        
        const options = [title, ...incorrects];
        // Shuffle options
        for (let s = options.length - 1; s > 0; s--) {
          const r = Math.floor(Math.random() * (s + 1));
          const tmp = options[s];
          options[s] = options[r];
          options[r] = tmp;
        }
        
        quizQuestions.push({
          id: game.id,
          text: "¿A qué videojuego pertenece esta carátula?",
          image: coverUrl,
          options: options,
          answerIndex: options.indexOf(title)
        });
      }
    }
    
    if ((i + 1) % 25 === 0 || i === uniqueTitles.length - 1) {
      console.log(`Extracted covers: ${quizQuestions.length}/${i + 1} games...`);
    }
  }

  // Write to Builder
  const fileContent = `// Archivo generado automáticamente con carátulas de SteamGridDB
export interface CoverQuestion {
  id: number;
  text: string;
  image: string;
  options: string[];
  answerIndex: number;
}

export const COVERS_QUESTIONS: CoverQuestion[] = ${JSON.stringify(quizQuestions, null, 2)};
`;

  fs.writeFileSync('E:/Imágenes/Tokkii/Builder_Tokkii/src/data/CoversQuestions.ts', fileContent);
  console.log(`Finished! Generated CoversQuestions.ts with ${quizQuestions.length} cover questions.`);
}

fetchCovers();
