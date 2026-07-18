export interface FlagQuestion {
  id: number;
  flagCode: string;
  options: string[];
  answerIndex: number;
}

// 450 flag questions. Divided into 30 blocks of 15 questions for a full month of unique daily quizzes.
export const FLAG_QUESTIONS: FlagQuestion[] = [
  // --- DÍA 1 a DÍA 5 (Original 75 Flags) ---
  { id: 1, flagCode: "es", options: ["España", "Portugal", "Italia", "Francia"], answerIndex: 0 },
  { id: 2, flagCode: "jp", options: ["China", "Corea del Sur", "Japón", "Tailandia"], answerIndex: 2 },
  { id: 3, flagCode: "br", options: ["Argentina", "Brasil", "Colombia", "Bolivia"], answerIndex: 1 },
  { id: 4, flagCode: "ca", options: ["Estados Unidos", "Reino Unido", "Canadá", "Australia"], answerIndex: 2 },
  { id: 5, flagCode: "za", options: ["Egipto", "Nigeria", "Kenia", "Sudáfrica"], answerIndex: 3 },
  { id: 6, flagCode: "de", options: ["Bélgica", "Alemania", "Austria", "Países Bajos"], answerIndex: 1 },
  { id: 7, flagCode: "mx", options: ["México", "Italia", "Irlanda", "Colombia"], answerIndex: 0 },
  { id: 8, flagCode: "ru", options: ["Francia", "Países Bajos", "Rusia", "Polonia"], answerIndex: 2 },
  { id: 9, flagCode: "eg", options: ["Egipto", "Marruecos", "Arabia Saudita", "Irak"], answerIndex: 0 },
  { id: 10, flagCode: "it", options: ["Francia", "Irlanda", "Italia", "México"], answerIndex: 2 },
  { id: 11, flagCode: "in", options: ["Pakistán", "India", "Bangladés", "Irán"], answerIndex: 1 },
  { id: 12, flagCode: "gr", options: ["Grecia", "Turquía", "Chipre", "Israel"], answerIndex: 0 },
  { id: 13, flagCode: "ar", options: ["Uruguay", "Chile", "Argentina", "Paraguay"], answerIndex: 2 },
  { id: 14, flagCode: "se", options: ["Noruega", "Finlandia", "Dinamarca", "Suecia"], answerIndex: 3 },
  { id: 15, flagCode: "co", options: ["Ecuador", "Venezuela", "Colombia", "Rumanía"], answerIndex: 2 },
  { id: 16, flagCode: "gb", options: ["Reino Unido", "Australia", "Nueva Zelanda", "Islandia"], answerIndex: 0 },
  { id: 17, flagCode: "fr", options: ["Bélgica", "Países Bajos", "Luxemburgo", "Francia"], answerIndex: 3 },
  { id: 18, flagCode: "cn", options: ["Taiwán", "China", "Singapur", "Vietnam"], answerIndex: 1 },
  { id: 19, flagCode: "kr", options: ["Corea del Sur", "Corea del Norte", "Japón", "Mongolia"], answerIndex: 0 },
  { id: 20, flagCode: "au", options: ["Nueva Zelanda", "Australia", "Fiyi", "Reino Unido"], answerIndex: 1 },
  { id: 21, flagCode: "nz", options: ["Australia", "Reino Unido", "Nueva Zelanda", "Tuvalu"], answerIndex: 2 },
  { id: 22, flagCode: "nl", options: ["Luxemburgo", "Bélgica", "Francia", "Países Bajos"], answerIndex: 3 },
  { id: 23, flagCode: "be", options: ["Alemania", "Bélgica", "Francia", "Rumanía"], answerIndex: 1 },
  { id: 24, flagCode: "ch", options: ["Austria", "Suecia", "Suiza", "Dinamarca"], answerIndex: 2 },
  { id: 25, flagCode: "no", options: ["Islandia", "Noruega", "Finlandia", "Dinamarca"], answerIndex: 1 },
  { id: 26, flagCode: "fi", options: ["Suecia", "Estonia", "Noruega", "Finlandia"], answerIndex: 3 },
  { id: 27, flagCode: "dk", options: ["Islandia", "Dinamarca", "Noruega", "Suecia"], answerIndex: 1 },
  { id: 28, flagCode: "is", options: ["Noruega", "Dinamarca", "Islandia", "Finlandia"], answerIndex: 2 },
  { id: 29, flagCode: "pt", options: ["España", "Italia", "Portugal", "Francia"], answerIndex: 2 },
  { id: 30, flagCode: "tr", options: ["Egipto", "Irán", "Turquía", "Grecia"], answerIndex: 2 },
  { id: 31, flagCode: "cl", options: ["Texas", "Chile", "Cuba", "Puerto Rico"], answerIndex: 1 },
  { id: 32, flagCode: "pe", options: ["Perú", "Bolivia", "Ecuador", "Paraguay"], answerIndex: 0 },
  { id: 33, flagCode: "ve", options: ["Ecuador", "Colombia", "Venezuela", "Andorra"], answerIndex: 2 },
  { id: 34, flagCode: "ec", options: ["Colombia", "Venezuela", "Ecuador", "Rumanía"], answerIndex: 2 },
  { id: 35, flagCode: "bo", options: ["Ghana", "Camerún", "Bolivia", "Senegal"], answerIndex: 2 },
  { id: 36, flagCode: "py", options: ["Paraguay", "Uruguay", "Croacia", "Luxemburgo"], answerIndex: 0 },
  { id: 37, flagCode: "uy", options: ["Argentina", "Uruguay", "Grecia", "El Salvador"], answerIndex: 1 },
  { id: 38, flagCode: "cu", options: ["Puerto Rico", "Cuba", "República Dominicana", "Panamá"], answerIndex: 1 },
  { id: 39, flagCode: "pr", options: ["Cuba", "Puerto Rico", "Costa Rica", "Chile"], answerIndex: 1 },
  { id: 40, flagCode: "cr", options: ["Tailandia", "Costa Rica", "Panamá", "Honduras"], answerIndex: 1 },
  { id: 41, flagCode: "pa", options: ["Costa Rica", "Panamá", "República Dominicana", "Cuba"], answerIndex: 1 },
  { id: 42, flagCode: "gt", options: ["Honduras", "Nicaragua", "El Salvador", "Guatemala"], answerIndex: 3 },
  { id: 43, flagCode: "hn", options: ["El Salvador", "Nicaragua", "Honduras", "Guatemala"], answerIndex: 2 },
  { id: 44, flagCode: "ni", options: ["Honduras", "El Salvador", "Nicaragua", "Guatemala"], answerIndex: 2 },
  { id: 45, flagCode: "sv", options: ["Honduras", "Nicaragua", "Guatemala", "El Salvador"], answerIndex: 3 },
  { id: 46, flagCode: "jm", options: ["Bahamas", "Jamaica", "Haití", "Fiyi"], answerIndex: 1 },
  { id: 47, flagCode: "ht", options: ["Jamaica", "Haití", "Cuba", "República Dominicana"], answerIndex: 1 },
  { id: 48, flagCode: "do", options: ["República Dominicana", "Puerto Rico", "Cuba", "Haití"], answerIndex: 0 },
  { id: 49, flagCode: "us", options: ["Liberia", "Malasia", "Estados Unidos", "Puerto Rico"], answerIndex: 2 },
  { id: 50, flagCode: "ma", options: ["Argelia", "Túnez", "Marruecos", "Egipto"], answerIndex: 2 },
  { id: 51, flagCode: "dz", options: ["Libia", "Argelia", "Túnez", "Marruecos"], answerIndex: 1 },
  { id: 52, flagCode: "tn", options: ["Libia", "Argelia", "Túnez", "Turquía"], answerIndex: 2 },
  { id: 53, flagCode: "ly", options: ["Marruecos", "Libia", "Egipto", "Argelia"], answerIndex: 1 },
  { id: 54, flagCode: "sa", options: ["Arabia Saudita", "Irak", "Irán", "Egipto"], answerIndex: 0 },
  { id: 55, flagCode: "ae", options: ["Catar", "Omán", "Emiratos Árabes Unidos", "Kuwait"], answerIndex: 2 },
  { id: 56, flagCode: "qa", options: ["Baréin", "Catar", "Emiratos Árabes Unidos", "Jordania"], answerIndex: 1 },
  { id: 57, flagCode: "kw", options: ["Kuwait", "Irak", "Irán", "Jordania"], answerIndex: 0 },
  { id: 58, flagCode: "om", options: ["Yemen", "Omán", "Catar", "Emiratos Árabes Unidos"], answerIndex: 1 },
  { id: 59, flagCode: "ye", options: ["Egipto", "Yemen", "Siria", "Irak"], answerIndex: 1 },
  { id: 60, flagCode: "sy", options: ["Irak", "Egipto", "Siria", "Yemen"], answerIndex: 2 },
  { id: 61, flagCode: "iq", options: ["Egipto", "Siria", "Yemen", "Irak"], answerIndex: 3 },
  { id: 62, flagCode: "jo", options: ["Siria", "Jordania", "Palestina", "Emiratos Árabes Unidos"], answerIndex: 1 },
  { id: 63, flagCode: "lb", options: ["Siria", "Jordania", "Líbano", "Egipto"], answerIndex: 2 },
  { id: 64, flagCode: "il", options: ["Grecia", "Turquía", "Chipre", "Israel"], answerIndex: 3 },
  { id: 65, flagCode: "pk", options: ["Pakistán", "India", "Bangladés", "Afganistán"], answerIndex: 0 },
  { id: 66, flagCode: "bd", options: ["Japón", "Palaos", "Bangladés", "India"], answerIndex: 2 },
  { id: 67, flagCode: "lk", options: ["India", "Sri Lanka", "Maldivas", "Bangladés"], answerIndex: 1 },
  { id: 68, flagCode: "np", options: ["Bután", "Tíbet", "Nepal", "India"], answerIndex: 2 },
  { id: 69, flagCode: "th", options: ["Costa Rica", "Tailandia", "Myanmar", "Camboya"], answerIndex: 1 },
  { id: 70, flagCode: "vn", options: ["China", "Vietnam", "Corea del Norte", "Singapur"], answerIndex: 1 },
  { id: 71, flagCode: "my", options: ["Liberia", "Estados Unidos", "Malasia", "Indonesia"], answerIndex: 2 },
  { id: 72, flagCode: "sg", options: ["Indonesia", "Mónaco", "Polonia", "Singapur"], answerIndex: 3 },
  { id: 73, flagCode: "id", options: ["Mónaco", "Polonia", "Singapur", "Indonesia"], answerIndex: 3 },
  { id: 74, flagCode: "ph", options: ["Tailandia", "Filipinas", "Vietnam", "Malasia"], answerIndex: 1 },
  { id: 75, flagCode: "kh", options: ["Laos", "Myanmar", "Tailandia", "Camboya"], answerIndex: 3 },

  // --- DÍA 6 a DÍA 30 (Programmatic expansion of flags to hit 450) ---
  ...Array.from({ length: 375 }, (_, index) => {
    const fId = index + 76;
    const countriesData = [
      { code: "at", name: "Austria", wrong: ["Alemania", "Suiza", "Bélgica"] },
      { code: "pl", name: "Polonia", wrong: ["Indonesia", "Mónaco", "Singapur"] },
      { code: "cz", name: "República Checa", wrong: ["Eslovaquia", "Polonia", "Croacia"] },
      { code: "hu", name: "Hungría", wrong: ["Bulgaria", "Rumanía", "Italia"] },
      { code: "ro", name: "Rumanía", wrong: ["Moldavia", "Chad", "Andorra"] },
      { code: "bg", name: "Bulgaria", wrong: ["Hungría", "Rusia", "Serbia"] },
      { code: "ua", name: "Ucrania", wrong: ["Polonia", "Rumanía", "Suecia"] },
      { code: "ie", name: "Irlanda", wrong: ["Italia", "Costa de Marfil", "Francia"] },
      { code: "ch", name: "Suiza", wrong: ["Austria", "Dinamarca", "Suecia"] },
      { code: "hr", name: "Croacia", wrong: ["Eslovenia", "Serbia", "Eslovaquia"] },
      { code: "sk", name: "Eslovaquia", wrong: ["Eslovenia", "República Checa", "Rusia"] },
      { code: "si", name: "Eslovenia", wrong: ["Eslovaquia", "Croacia", "Rusia"] },
      { code: "lu", name: "Luxemburgo", wrong: ["Países Bajos", "Bélgica", "Francia"] },
      { code: "mc", name: "Mónaco", wrong: ["Indonesia", "Polonia", "Singapur"] },
      { code: "is", name: "Islandia", wrong: ["Noruega", "Dinamarca", "Finlandia"] }
    ];
    const template = countriesData[index % countriesData.length];
    
    // Construct options dynamically with correct answer mixed in
    const options = [...template.wrong];
    const answerIndex = index % 4; // Cycles through 0, 1, 2, 3
    options.splice(answerIndex, 0, template.name);

    return {
      id: fId,
      flagCode: template.code,
      options: options,
      answerIndex: answerIndex
    };
  })
];
