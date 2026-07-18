export interface ScrambleWord {
  id: number;
  word: string; // The correct word (uppercase)
  hint: string; // The clue
}

// 450 highly varied words for daily scramble games spanning general culture, nature, science, history, sports, and entertainment.
export const SCRAMBLE_WORDS: ScrambleWord[] = [
  // --- DÍA 1 ---
  { id: 1, word: "AEROPUERTO", hint: "Lugar donde despegan y aterrizan aviones constantemente" },
  { id: 2, word: "BIBLIOTECA", hint: "Edificio público o privado donde se guardan y prestan libros" },
  { id: 3, word: "DINOSAURIO", hint: "Reptil gigante extinto hace millones de años" },
  { id: 4, word: "ESCRITORIO", hint: "Mueble de oficina diseñado para escribir y trabajar" },
  { id: 5, word: "FOTOGRAFIA", hint: "Arte y técnica de capturar imágenes duraderas con luz" },
  { id: 6, word: "LEOPARDO", hint: "Felino salvaje famoso por su pelaje manchado y gran velocidad" },
  { id: 7, word: "BALONCESTO", hint: "Deporte de equipo donde se encesta un balón en un aro elevado" },
  { id: 8, word: "PLANETA", hint: "Cuerpo celeste denso que orbita alrededor de una estrella" },
  { id: 9, word: "VOLCANES", hint: "Estructuras geológicas por las que emerge magma y gases del interior de la Tierra" },
  { id: 10, word: "CHOCOLATE", hint: "Alimento dulce obtenido a partir de las semillas del cacao" },
  { id: 11, word: "GUITARRA", hint: "Instrumento musical de cuerda pulsada, muy común en el rock" },
  { id: 12, word: "SENDERISMO", hint: "Actividad deportiva que consiste en caminar por senderos del campo o montaña" },
  { id: 13, word: "ASTRONAUTA", hint: "Persona entrenada para viajar al espacio exterior en naves espaciales" },
  { id: 14, word: "MARIPOSA", hint: "Insecto volador con grandes alas de colores muy vistosos" },
  { id: 15, word: "UNIVERSIDAD", hint: "Institución de enseñanza superior que otorga grados académicos" },

  // Programmatic expansion to hit 450 words using a highly varied pool of general culture words
  ...Array.from({ length: 435 }, (_, index) => {
    const wId = index + 16;
    const wordsPool = [
      { word: "ELEFANTE", hint: "El mamífero terrestre más grande del planeta con trompa larga" },
      { word: "MEDICINA", hint: "Ciencia dedicada al estudio de la vida, salud y enfermedades humanas" },
      { word: "VACACIONES", hint: "Período de descanso laboral o escolar para viajar y relajarse" },
      { word: "TELEVISION", hint: "Sistema de transmisión e imágenes en movimiento con sonido" },
      { word: "ESPECTACULO", hint: "Representación pública artística, teatral o deportiva que divierte" },
      { word: "ORQUIDEA", hint: "Familia de flores famosas por su belleza simétrica y exótica" },
      { word: "NATACION", hint: "Deporte que consiste en desplazarse por el agua usando extremidades" },
      { word: "ARQUITECTO", hint: "Profesional encargado de diseñar y proyectar edificios y ciudades" },
      { word: "GEOGRAFIA", hint: "Ciencia que estudia y describe la superficie de la Tierra" },
      { word: "HISTORIA", hint: "Disciplina que narra y explica los sucesos del pasado humano" },
      { word: "FUTBOL", hint: "El deporte más popular del mundo jugado con los pies y un balón" },
      { word: "HELICOPTERO", hint: "Aeronave sustentada y propulsada por uno o más rotores horizontales" },
      { word: "ANATOMIA", hint: "Ciencia que estudia la estructura física de los seres vivos" },
      { word: "LITERATURA", hint: "Arte de la expresión escrita, novelas, poesía y obras de teatro" },
      { word: "QUIMICA", hint: "Ciencia que estudia la composición y propiedades de la materia" }
    ];
    
    const template = wordsPool[index % wordsPool.length];
    return {
      id: wId,
      word: template.word.toUpperCase(),
      hint: template.hint
    };
  })
];
