import fs from 'fs';

// Helper to delay execution (to avoid rate-limiting)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function translateName(name) {
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(name)}`);
    const json = await res.json();
    if (json && json[0] && json[0][0] && json[0][0][0]) {
      return json[0][0][0].trim();
    }
  } catch (err) {
    console.error(`Error translating ${name}:`, err.message);
  }
  return name;
}

// Custom manual overrides for famous Disney characters to ensure 100% correct translation
const manualTranslations = {
  "Snow White": "Blancanieves",
  "Cinderella": "Cenicienta",
  "Sleeping Beauty": "Bella Durmiente",
  "Little Mermaid": "La Sirenita",
  "Scrooge McDuck": "Rico McPato",
  "Donald Duck": "Pato Donald",
  "Daisy Duck": "Pata Daisy",
  "Mickey Mouse": "Mickey Mouse",
  "Minnie Mouse": "Minnie Mouse",
  "Goofy": "Goofy",
  "Pluto": "Pluto",
  "Scamp": "Golfillo",
  "Lady": "Reina",
  "Tramp": "Golfo",
  "Peter Pan": "Peter Pan",
  "Tinker Bell": "Campanilla",
  "Pinocchio": "Pinocho",
  "Jiminy Cricket": "Pepito Grillo",
  "Beast": "Bestia",
  "Belle": "Bella",
  "Woody": "Woody",
  "Buzz Lightyear": "Buzz Lightyear",
  "Lightning McQueen": "Rayo McQueen",
  "Tow Mater": "Mate",
  "Evil Queen": "La Reina Malvada",
  "Maleficent": "Maléfica",
  "Cruella De Vil": "Cruella de Vil",
  "Captain Hook": "Capitán Garfio",
  "Jafar": "Jafar",
  "Ursula": "Úrsula",
  "Hades": "Hades",
  "Gaston": "Gastón",
  "Scar": "Scar",
  "Cheshire Cat": "Gato de Cheshire",
  "Mad Hatter": "Sombrerero Loco",
  "White Rabbit": "Conejo Blanco",
  "Queen of Hearts": "Reina de Corazones"
};

async function runTranslation() {
  console.log("Reading raw characters...");
  const rawData = JSON.parse(fs.readFileSync('E:/Imágenes/Tokkii/Builder_Tokkii/src/data/disney_raw.json', 'utf8'));
  
  // Take up to 450 characters (we need 450 for 30 days of 15 unique characters)
  const list = rawData.slice(0, 450);
  const translatedList = [];
  
  console.log(`Starting translation of ${list.length} characters...`);
  
  for (let i = 0; i < list.length; i++) {
    const char = list[i];
    let translatedName = char.name;
    
    // Check manual override first
    if (manualTranslations[char.name]) {
      translatedName = manualTranslations[char.name];
    } else {
      // Use Google Translate API (with a 200ms delay to be polite)
      translatedName = await translateName(char.name);
      await sleep(200);
    }
    
    // Generate 3 incorrect options from the other translated names
    translatedList.push({
      id: char.id,
      name: translatedName,
      image: char.image
    });
    
    if ((i + 1) % 50 === 0) {
      console.log(`Translated ${i + 1}/${list.length}...`);
    }
  }

  // Generate the formatted structure for the quiz:
  // Each question has: { text: "Adivina el personaje de Disney", image: "...", options: [...], answerIndex: N }
  const quizQuestions = [];
  
  for (let i = 0; i < translatedList.length; i++) {
    const char = translatedList[i];
    const correctName = char.name;
    
    // Pick 3 incorrect names
    const incorrects = [];
    const pool = translatedList.filter(c => c.name !== correctName);
    
    while (incorrects.length < 3 && pool.length > 0) {
      const randIdx = Math.floor(Math.random() * pool.length);
      const randomChar = pool.splice(randIdx, 1)[0];
      if (!incorrects.includes(randomChar.name)) {
        incorrects.push(randomChar.name);
      }
    }
    
    const options = [correctName, ...incorrects];
    // Shuffle options
    for (let s = options.length - 1; s > 0; s--) {
      const r = Math.floor(Math.random() * (s + 1));
      const tmp = options[s];
      options[s] = options[r];
      options[r] = tmp;
    }
    
    quizQuestions.push({
      id: char.id,
      text: "¿Cómo se llama este personaje de Disney?",
      image: char.image,
      options: options,
      answerIndex: options.indexOf(correctName)
    });
  }
  
  // Write to E:\Imágenes\Tokkii\Builder_Tokkii\src\data\DisneyQuestions.ts
  const fileContent = `// Archivo generado automáticamente con 450 personajes de Disney
export interface DisneyQuestion {
  id: number;
  text: string;
  image: string;
  options: string[];
  answerIndex: number;
}

export const DISNEY_QUESTIONS: DisneyQuestion[] = ${JSON.stringify(quizQuestions, null, 2)};
`;

  fs.writeFileSync('E:/Imágenes/Tokkii/Builder_Tokkii/src/data/DisneyQuestions.ts', fileContent);
  console.log("Finished generating DisneyQuestions.ts with 450 questions!");
}

runTranslation();
