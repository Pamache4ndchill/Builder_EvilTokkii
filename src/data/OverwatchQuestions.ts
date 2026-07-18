export interface Question {
  id: number;
  text: string;
  options: string[];
  answerIndex: number;
}

export const OVERWATCH_QUESTIONS: Question[] = [
  // --- DÍA 1 (Preguntas 1 - 15) ---
  {
    id: 1,
    text: "¿Cuál es el nombre del mentor de Reinhardt que lideró a los Cruzados en la Batalla de Eichenwalde?",
    options: ["Balderich von Adler", "Wilhelm Reinhardt", "Torvald Lindholm", "Siegfried von Coburg"],
    answerIndex: 0
  },
  {
    id: 2,
    text: "¿Cómo se llama la IA ómnica rebelde de tipo 'Dios' de la que Anubis es uno de sus núcleos?",
    options: ["Programa Dios (God Program)", "Proyecto Titán", "Protocolo de Asimilación", "Scream ómnico"],
    answerIndex: 0
  },
  {
    id: 3,
    text: "¿Cuál es la designación exacta del modelo de Bastion de la Crisis Ómnica que controlamos en el juego?",
    options: ["SST Laboratories E54", "OR15-A Unit 4", "B-73 Bastion-X", "E54-SST Titan"],
    answerIndex: 0
  },
  {
    id: 4,
    text: "¿Quién es el actual líder espiritual de los Shambali tras el asesinato de Tekhartha Mondatta?",
    options: ["Zenyatta", "Tekhartha Mondatta (no tiene sucesor)", "Ramattra", "Ninguno, el templo se disolvió"],
    answerIndex: 1
  },
  {
    id: 5,
    text: "¿Cuál es el nombre real del tercer portador del guantelete y líder de Talon, Doomfist?",
    options: ["Akande Ogundimu", "Adebayo Ogundimu", "Efe Oladele", "Maximilian"],
    answerIndex: 0
  },
  {
    id: 6,
    text: "¿Qué operación encubierta de Blackwatch expuso públicamente la existencia de la división al mundo?",
    options: ["El Incidente de Venecia", "El Asalto a King's Row", "La Operación de Oslo", "La Infiltración de Busan"],
    answerIndex: 0
  },
  {
    id: 7,
    text: "¿De qué organización científica era miembro Moira O'Deorain antes de unirse a Blackwatch y Talon?",
    options: ["Oasis", "Helix Securities", "Corporación Vishkar", "Comisión de Robótica de Ginebra"],
    answerIndex: 0
  },
  {
    id: 8,
    text: "¿Cuál es la velocidad máxima de curación por segundo del disparo principal del Bastón Caduceo de Mercy?",
    options: ["55 PS/s", "60 PS/s", "50 PS/s", "65 PS/s"],
    answerIndex: 0
  },
  {
    id: 9,
    text: "¿Cómo se llama el prototipo de deslizador que Mercy diseñó y Pharah pilotea en su armadura Raptora?",
    options: ["Armadura de Combate Raptora Mark VI", "Proyecto de Vuelo Caduceo", "Traje de Propulsión Helios", "Proyecto Valquiria"],
    answerIndex: 3
  },
  {
    id: 10,
    text: "¿Qué oficial de Helix Security lideró la investigación tras el ataque de Doomfist al aeropuerto de Numbani?",
    options: ["Sojourn", "Ana Amari", "Khalid Al-Asad", "Helix no especificó el oficial (Fue Efe Oladele quien lo vio)"],
    answerIndex: 3
  },
  {
    id: 11,
    text: "¿Qué ómnico de Talon administra los fondos y operaciones financieras de la organización en Mónaco?",
    options: ["Maximilian", "Ramattra", "Skeith", "Mondatta"],
    answerIndex: 0
  },
  {
    id: 12,
    text: "¿Cómo se llama el clan criminal que lideraba la familia de Genji y Hanzo en Hanamura?",
    options: ["Clan Shimada", "Sindicato Hashimoto", "Clan Yamaguti", "La Garra del Dragón"],
    answerIndex: 0
  },
  {
    id: 13,
    text: "¿Cuánto daño base inflige el Golpe Directo del proyectil del Cañón de Fusión de D.Va (sin meca) al impactar?",
    options: ["14 puntos de daño", "18 puntos de daño", "22 puntos de daño", "26 puntos de daño"],
    answerIndex: 0
  },
  {
    id: 14,
    text: "¿Cuál es el nombre de la comandante de Overwatch que supervisó el arresto de Doomfist en Singapur?",
    options: ["Vivian Chase (Sojourn)", "Ana Amari", "Angela Ziegler", "Liao Min-Jung"],
    answerIndex: 0
  },
  {
    id: 15,
    text: "¿Qué personaje diseñó originalmente el módulo de regeneración biótica que Baptiste modificó?",
    options: ["Angela Ziegler (Mercy)", "Moira O'Deorain", "Torvald Lindholm", "Dr. Harold Winston"],
    answerIndex: 0
  },

  // --- DÍA 2 (Preguntas 16 - 30) ---
  {
    id: 16,
    text: "¿Cuál es el nombre del gorila científico líder en la Base Lunar Horizon que Winston consideraba su figura paterna?",
    options: ["Dr. Harold Winston", "Dr. Simon Winston", "Dr. Victor Orel", "Dr. Zhang Lijiang"],
    answerIndex: 0
  },
  {
    id: 17,
    text: "¿Cuál fue el primer mapa de tipo Escolta (Payload) introducido en Overwatch tras el lanzamiento original?",
    options: ["Ruta 66", "Observatorio: Gibraltar", "Eichenwalde", "Junkertown"],
    answerIndex: 2
  },
  {
    id: 18,
    text: "¿Qué compuesto químico utiliza Mei en su pistola endotérmica para congelar a los enemigos?",
    options: ["Super refrigerante criogénico líquido", "Nitrógeno líquido concentrado", "Helio-3 líquido", "Agua destilada presurizada"],
    answerIndex: 0
  },
  {
    id: 19,
    text: "¿Qué personaje es el responsable directo de la amputación del brazo izquierdo de Torbjörn?",
    options: ["Un Bastión rebelde en la Crisis Ómnica", "Un prototipo Titán en la Operación Domo", "Sombra tras descubrir su ubicación", "Nunca perdió el brazo, es un guantelete tecnológico"],
    answerIndex: 1
  },
  {
    id: 20,
    text: "¿Cuál es el nombre de la joven inventora genio de Numbani que creó a Orisa a partir de piezas de chatarra de OR15?",
    options: ["Efi Oladele", "Liao Min-Jung", "Symmetra", "Junker Queen"],
    answerIndex: 0
  },
  {
    id: 21,
    text: "¿Qué apodo tenía Jesse McCree / Cole Cassidy durante sus días de forajido en la Banda Deadlock?",
    options: ["La Bala Perdida", "El Pistolero de Santa Fe", "No tenía apodo oficial registrado en el lore", "El As del Desierto"],
    answerIndex: 2
  },
  {
    id: 22,
    text: "¿Cuál es el porcentaje máximo de reducción de daño pasivo que puede obtener Orisa usando su Fortificación?",
    options: ["45%", "50%", "30%", "35%"],
    answerIndex: 0
  },
  {
    id: 23,
    text: "¿Qué mapa de Overwatch está ubicado en las montañas de Escandinavia y sirve como el hogar y taller de Torbjörn?",
    options: ["Gotemburgo", "Eichenwalde", "King's Row", "Rialto"],
    answerIndex: 0
  },
  {
    id: 24,
    text: "¿Cuál es la afiliación política o corporativa original de Symmetra (Satya Vaswani)?",
    options: ["Corporación Vishkar", "Colectivo LumeriCo", "Industrias Volskaya", "Helix Securities"],
    answerIndex: 0
  },
  {
    id: 25,
    text: "¿Qué evento trágico causó que Zenyatta abandonara el Monasterio Shambali?",
    options: ["Divergencias filosóficas con Mondatta sobre cómo lograr la paz", "El asesinato de Mondatta", "El ataque de Null Sector al monasterio", "El exilio forzado por parte de los monjes mayores"],
    answerIndex: 0
  },
  {
    id: 26,
    text: "¿Cuál es el nombre del modelo robótico original del que provienen las unidades de defensa OR15 de Numbani?",
    options: ["OR14 'Idina'", "SST laboratories E54", "Bastión B73", "K-400 Titan"],
    answerIndex: 0
  },
  {
    id: 27,
    text: "¿Cuál es el nombre del festival mexicano donde Sombra saboteó la red de LumeriCo?",
    options: ["Festival de la Luz (Dorado)", "Día de los Muertos", "La Noche de los Ómnicos", "Grito de Dolores"],
    answerIndex: 0
  },
  {
    id: 28,
    text: "¿Quién fundó originalmente la sociedad secreta que gobierna Oasis junto a científicos de todo el mundo?",
    options: ["Los Ministerios de Oasis", "Moira O'Deorain", "La Corporación Vishkar", "La ONU"],
    answerIndex: 0
  },
  {
    id: 29,
    text: "¿Qué personaje Damage lleva incorporado el acelerador crónico en su pecho?",
    options: ["Tracer", "Genji", "Sombra", "Sojourn"],
    answerIndex: 0
  },
  {
    id: 30,
    text: "¿Qué elemento del lore de Zarya la motivó a abandonar la competición de halterofilia y unirse al ejército ruso?",
    options: ["El ataque del segundo Omnium siberiano a su aldea natal", "La muerte de su hermano mayor", "La llamada directa de Katya Volskaya", "Su deseo de derrotar al robot Bastion"],
    answerIndex: 0
  },

  // --- DÍA 3 (Preguntas 31 - 45) ---
  {
    id: 31,
    text: "¿Cuál es la duración exacta del aturdimiento del Dardo Sedante (Sleep Dart) de Ana en un héroe enemigo no tanque?",
    options: ["5 segundos", "4 segundos", "3.5 segundos", "6 segundos"],
    answerIndex: 0
  },
  {
    id: 32,
    text: "¿Qué personaje introdujo el concepto de 'Daño de Sangrado' pasivo en Overwatch 2?",
    options: ["Junker Queen", "Genji (en fase alfa)", "Roadhog", "Ashe"],
    answerIndex: 0
  },
  {
    id: 33,
    text: "¿Cómo se llama el rifle semiautomático que empuña Ashe?",
    options: ["La Víbora (The Viper)", "Cobra Mark II", "El Búho", "Rifle de Palanca Deadlock"],
    answerIndex: 0
  },
  {
    id: 34,
    text: "¿Qué ómnico de alto rango del lore fue capturado en Rialto por los agentes de Blackwatch?",
    options: ["Antonio Bartalotti", "Maximilian", "Tekhartha Mondatta", "Claudio Volskaya"],
    answerIndex: 0
  },
  {
    id: 35,
    text: "¿Qué mapa de control está ambientado en el centro científico aeroespacial de China?",
    options: ["Torre Lijiang", "Jardines de Busan", "Península de la Antártida", "Santuario de Nepal"],
    answerIndex: 0
  },
  {
    id: 36,
    text: "¿Cómo se llama el grupo paramilitar privado que defiende las instalaciones científicas de Oasis?",
    options: ["Helix Securities", "Talon", "El Ministerio de Seguridad", "Vishkar Security"],
    answerIndex: 0
  },
  {
    id: 37,
    text: "¿Qué habilidad de Lifeweaver le permite atraer a un aliado hacia él envolviéndolo en un escudo protector?",
    options: ["Agarre vital (Life Grip)", "Plataforma de pétalos", "Brote de sanación", "Escudo de clorofila"],
    answerIndex: 0
  },
  {
    id: 38,
    text: "¿Cuál es la nacionalidad de Brigitte Lindholm?",
    options: ["Sueca", "Alemana", "Austriaca", "Suiza"],
    answerIndex: 0
  },
  {
    id: 39,
    text: "¿Qué mapa de escolta de Overwatch 2 transcurre en la capital de Italia?",
    options: ["Coliseo", "Rialto", "Paraíso", "Esperança"],
    answerIndex: 0
  },
  {
    id: 40,
    text: "¿Cuál es el nombre del proyecto espacial secreto de la Base Lunar Horizon del cual Juno forma parte?",
    options: ["Proyecto Hermes / Proyecto de Colonización Marciana", "Proyecto Apolo II", "Operación Éxodo", "Horizonte Rojo"],
    answerIndex: 0
  },
  {
    id: 41,
    text: "¿Cuál es la cantidad de curación que otorga la Granada Biótica de Ana a los aliados al impactar directamente?",
    options: ["60 PS", "90 PS", "100 PS", "50 PS"],
    answerIndex: 1
  },
  {
    id: 42,
    text: "¿Qué heroína de Overwatch fue modificada genéticamente en las instalaciones de Industrias Volskaya?",
    options: ["Ninguna (Zarya fue reclutada directamente, no modificada genéticamente)", "Sombra", "Widowmaker", "Pharah"],
    answerIndex: 0
  },
  {
    id: 43,
    text: "¿Cuál es el nombre del software de visualización de luz sólida patentado por la Corporación Vishkar?",
    options: ["Luz sólida (Solid Light)", "Sintra-Mesh", "Lux-Matrix", "Arquitectura de fotones"],
    answerIndex: 0
  },
  {
    id: 44,
    text: "¿Qué personaje es el responsable de haber lavado el cerebro de Amélie Lacroix para asesinar a Gérard Lacroix?",
    options: ["Moira O'Deorain (a través del programa de Talon)", "Doomfist", "Reaper", "Sombra"],
    answerIndex: 0
  },
  {
    id: 45,
    text: "¿Cuál de las siguientes habilidades fue eliminada por completo del kit de Bastion al pasar de Overwatch a Overwatch 2?",
    options: ["Autorreparación (Self-Repair)", "Modo Centinela Estacionario", "Configuración Tanque", "Todas las opciones anteriores son correctas"],
    answerIndex: 3
  },

  // --- DÍA 4 (Preguntas 46 - 60) ---
  {
    id: 46,
    text: "¿Cuál es el tiempo de reutilización base del Campo de Inmortalidad de Baptiste en segundos?",
    options: ["25 segundos", "30 segundos", "20 segundos", "15 segundos"],
    answerIndex: 0
  },
  {
    id: 47,
    text: "¿Cuál es el nombre real de la heroína conocida como Junker Queen?",
    options: ["Odessa 'Dez' Stone", "Mako Rutledge", "Beatrix Vacker", "Sasha Lindholm"],
    answerIndex: 0
  },
  {
    id: 48,
    text: "¿De qué personaje es la voz en inglés que pronuncia la icónica frase 'Experience Tranquility'?",
    options: ["Feodor Chin (Zenyatta)", "Daradh Mondatta", "Gaku Space", "Paul Nakauchi"],
    answerIndex: 0
  },
  {
    id: 49,
    text: "¿Qué mapa clásico de Overwatch transcurre en un templo dedicado al dios egipcio de la muerte?",
    options: ["Templo de Anubis", "Ruinas de Ilios", "Oasis: Universidad", "El Cairo"],
    answerIndex: 0
  },
  {
    id: 50,
    text: "¿Cuál es el nombre del proyecto de supersoldados militares de EE.UU. en el que participaron Soldier: 76 y Reaper?",
    options: ["Programa de Mejora de Soldados (SEP)", "Proyecto Titán de Acero", "Iniciativa de Defensa Global", "Fuerza de Choque Vanguard"],
    answerIndex: 0
  },
  {
    id: 51,
    text: "¿Qué mapa de control de Overwatch 2 transcurre en la península helada del hemisferio sur?",
    options: ["Península de la Antártida", "Ecopunto: Antártida", "Estación de Investigación Lijiang", "Base Siberia II"],
    answerIndex: 0
  },
  {
    id: 52,
    text: "¿Cuál es la velocidad base de curación pasiva de los Supports de Overwatch 2 tras no recibir daño?",
    options: ["20 PS por segundo", "15 PS por segundo", "10 PS por segundo", "25 PS por segundo"],
    answerIndex: 0
  },
  {
    id: 53,
    text: "¿Cuál es el verdadero nombre de la heroína no binaria Venture?",
    options: ["Sloan Cameron", "Rowan Vance", "Devon Cole", "Morgan Reed"],
    answerIndex: 0
  },
  {
    id: 54,
    text: "¿Qué facción militar rusa lidera la defensa humana contra el Omnium siberiano?",
    options: ["Fuerzas de Defensa de Rusia (RDF)", "Fuerzas de Defensa de Volskaya", "Ejército Rojo Ómnico", "Frente de Hierro Siberiano"],
    answerIndex: 1
  },
  {
    id: 55,
    text: "¿Qué mapa de empuje (Push) transcurre en el hermoso entorno costero de Portugal?",
    options: ["Esperança", "Coliseo", "New Queen Street", "Rialto"],
    answerIndex: 0
  },
  {
    id: 56,
    text: "¿Cómo se llama el gorila modificado genéticamente que lideró la rebelión violenta en la Base Lunar Horizon?",
    options: ["Alpheus", "Hammond", "Simon", "Dr. Winston (El gorila no se llamaba así)"],
    answerIndex: 0
  },
  {
    id: 57,
    text: "¿Cuál es el límite máximo de armadura (Armor) adicional que Brigitte puede otorgar temporalmente con su definitiva Inspirar/Formación?",
    options: ["100 de armadura", "75 de armadura", "50 de armadura", "125 de armadura"],
    answerIndex: 0
  },
  {
    id: 58,
    text: "¿Qué personaje diseñó originalmente el reactor de fusión cinética que alimenta el meca de D.Va?",
    options: ["El equipo de ingeniería de MEKA", "Torvald Lindholm", "Dr. Harold Winston", "D.Va misma (Hana Song)"],
    answerIndex: 0
  },
  {
    id: 59,
    text: "¿Cuál es el nombre de la corporación minera ómnica que explota los recursos de la Península de la Antártida?",
    options: ["Industrias Volskaya", "Corporación Lucent", "Omnica Corp (el lore no especifica corporación minera activa en esa estación)", "Ninguna de las opciones es correcta"],
    answerIndex: 3
  },
  {
    id: 60,
    text: "¿Cuál es la velocidad de movimiento adicional que obtiene Genji de forma pasiva debido a su rol de Damage?",
    options: ["No tiene velocidad de movimiento adicional pasiva en Overwatch 2 tras el rediseño de pasivas", "5%", "10%", "15%"],
    answerIndex: 0
  },

  // --- DÍA 5 (Preguntas 61 - 75) ---
  {
    id: 61,
    text: "¿Cuál es el nombre del hermano menor de Torbjörn Lindholm mencionado en el lore extendido?",
    options: ["No tiene hermanos registrados en el lore", "Torvald Lindholm", "Gunnar Lindholm", "Sven Lindholm"],
    answerIndex: 0
  },
  {
    id: 62,
    text: "¿Qué mapa de Overwatch 2 transcurre en las calles céntricas de Toronto, Canadá?",
    options: ["New Queen Street", "Circuit Royal", "Esperança", "Midtown"],
    answerIndex: 0
  },
  {
    id: 63,
    text: "¿Qué personaje ómnico de Talon fue asesinado por Blackwatch durante la infame misión en Venecia?",
    options: ["Antonio Bartalotti (Era humano, no ómnico)", "Maximilian", "Tekhartha Mondatta", "Ninguno de los anteriores"],
    answerIndex: 0
  },
  {
    id: 64,
    text: "¿Cuál es el nombre de la madre biológica de Pharah (Fareeha Amari)?",
    options: ["Ana Amari", "Samara Amari", "Liao Min-Jung", "Angela Ziegler"],
    answerIndex: 0
  },
  {
    id: 65,
    text: "¿Qué sustancia líquida dorada contiene el disparo principal biótico de Moira?",
    options: ["Energía de regeneración celular / Nanobots curativos", "Gel de plasma de Mercy", "Fluido linfático ómnico", "Esencia solar purificada"],
    answerIndex: 0
  },
  {
    id: 66,
    text: "¿Qué personaje de Overwatch es capaz de infligir daño crítico a la cabeza con un disparo cargado de Cañón de Riel?",
    options: ["Sojourn", "Widowmaker", "Ashe", "Cassidy"],
    answerIndex: 0
  },
  {
    id: 67,
    text: "¿Cómo se llama el festival tradicional coreano que se celebra en el mapa de Busan?",
    options: ["Chuseok (Festival de la Cosecha)", "Seollal (Año Nuevo Coreano)", "Festival del Dragón", "Festival del Loto"],
    answerIndex: 0
  },
  {
    id: 68,
    text: "¿Cuál es el enfriamiento base en segundos de la habilidad Traslación (Blink) de Tracer?",
    options: ["3 segundos", "4 segundos", "5 segundos", "2.5 segundos"],
    answerIndex: 0
  },
  {
    id: 69,
    text: "¿Qué personaje de la Crisis Ómnica ayudó a fundar Overwatch junto a Morrison, Amari, Reinhardt y Lindholm?",
    options: ["Liao Min-Jung (Mina Liao)", "Gérard Lacroix", "Harold Winston", "Sojourn"],
    answerIndex: 0
  },
  {
    id: 70,
    text: "¿De qué nacionalidad es Sigma (Siebren de Kuiper)?",
    options: ["Neerlandés", "Alemán", "Belga", "Danés"],
    answerIndex: 0
  },
  {
    id: 71,
    text: "¿Qué dispositivo cinético gravitacional utiliza Sigma para absorber proyectiles enemigos y convertirlos en escudo?",
    options: ["Agarre cinético (Kinetic Grasp)", "Barrera experimental", "Acreción de masa", "Flujo gravitacional"],
    answerIndex: 0
  },
  {
    id: 72,
    text: "¿Cómo se llama el mapa híbrido situado en la capital de Alemania?",
    options: ["Eichenwalde", "Junkertown", "Rialto", "Coliseo"],
    answerIndex: 0
  },
  {
    id: 73,
    text: "¿Cuál es el verdadero nombre de la heroína conocida como Sombra?",
    options: ["Olivia Colomar", "Alejandra Salazar", "Sofia Ramirez", "Satya Vaswani"],
    answerIndex: 0
  },
  {
    id: 74,
    text: "¿Qué personaje de Overwatch es el fundador de la compañía armamentística Helix Securities?",
    options: ["El lore no especifica un fundador individual directo, sino que pertenece al holding Helix", "Jack Morrison", "Torvald Lindholm", "Ana Amari"],
    answerIndex: 0
  },
  {
    id: 75,
    text: "¿Qué mapa de control de Overwatch transcurre en un monasterio en lo alto del Himalaya?",
    options: ["Nepal", "Lijiang", "Busan", "Horizon"],
    answerIndex: 0
  },

  // --- DÍA 6 (Preguntas 76 - 90) ---
  {
    id: 76,
    text: "¿Cuál es el tiempo de duración base del efecto de Hackeo de Sombra sobre un kit de primeros auxilios (Medkit)?",
    options: ["30 segundos", "45 segundos", "60 segundos", "20 segundos"],
    answerIndex: 0
  },
  {
    id: 77,
    text: "¿De qué personaje ómnico se descubrió que poseía conciencia y personalidad propia tras el fin de la Crisis Ómnica?",
    options: ["Bastion (unidad SST E54)", "OR15-A", "Zenyatta", "Ramattra"],
    answerIndex: 0
  },
  {
    id: 78,
    text: "¿Cuál es el nombre de la investigadora climatóloga colega de Mei que falleció congelada en el Ecopunto: Antártida?",
    options: ["Oksana (mencionada en los registros criogénicos)", "Dr. Simon", "Liao", "Efi Oladele"],
    answerIndex: 0
  },
  {
    id: 79,
    text: "¿Cuál es el daño por segundo máximo que puede infligir el disparo principal del cañón de partículas de Zarya a máxima carga?",
    options: ["170 puntos de daño", "190 puntos de daño", "150 puntos de daño", "200 puntos de daño"],
    answerIndex: 0
  },
  {
    id: 80,
    text: "¿Qué personaje tiene una pasiva que le permite sanarse un porcentaje del daño infligido con sus habilidades de daño?",
    options: ["Reaper (Segador de almas)", "Doomfist", "Moira", "Junker Queen"],
    answerIndex: 0
  },
  {
    id: 81,
    text: "¿De qué nacionalidad es Roadhog (Mako Rutledge)?",
    options: ["Australiano", "Neozelandés", "Sudafricano", "Fiyiano"],
    answerIndex: 0
  },
  {
    id: 82,
    text: "¿Cómo se llama el festival anual que se celebra en Junkertown donde la Reina y los Junkers pelean en la arena?",
    options: ["El festival de la chatarra (Scrapyard fight / Carnage)", "Festival Junker", "El Gran Torneo de Acero", "Ninguno de los anteriores"],
    answerIndex: 3
  },
  {
    id: 83,
    text: "¿Cuál es el arma cuerpo a cuerpo secundaria que empuña Junker Queen y que puede lanzar?",
    options: ["Carnicera (Gracie)", "Martillo dentado", "Gancho oxidado", "Hacha de chatarra"],
    answerIndex: 0
  },
  {
    id: 84,
    text: "¿Cuál es el enfriamiento de la habilidad Campo de Inmortalidad de Baptiste en Overwatch 2?",
    options: ["25 segundos", "30 segundos", "18 segundos", "22 segundos"],
    answerIndex: 0
  },
  {
    id: 85,
    text: "¿Cómo se llama el hermano mayor de Genji Shimada?",
    options: ["Hanzo Shimada", "Zenyatta", "Sojourn", "Cole Cassidy"],
    answerIndex: 0
  },
  {
    id: 86,
    text: "¿Cuál es la pasiva única de Zenyatta en combate cuerpo a cuerpo?",
    options: ["Patada rápida (aumenta el empuje y daño en 50%)", "Meditación", "Flotar silencioso", "Orbe de protección"],
    answerIndex: 0
  },
  {
    id: 87,
    text: "¿Cuál es el enfriamiento base en segundos de la habilidad Regeneración Biótica de Moira?",
    options: ["No tiene enfriamiento (se recarga infligiendo daño con el haz biótico morado)", "6 segundos", "8 segundos", "10 segundos"],
    answerIndex: 0
  },
  {
    id: 88,
    text: "¿Qué mapa de control de Overwatch transcurre en la costa de Grecia?",
    options: ["Ilios", "Rialto", "Oasis", "Nepal"],
    answerIndex: 0
  },
  {
    id: 89,
    text: "¿Cuál es el verdadero nombre de la heroína conocida como Pharah?",
    options: ["Fareeha Amari", "Samara Amari", "Ana Amari", "Angela Ziegler"],
    answerIndex: 0
  },
  {
    id: 90,
    text: "¿Cuál es el nombre de la líder suprema de Industrias Volskaya, encargada de la defensa militar de Rusia?",
    options: ["Katya Volskaya", "Zarya", "Sombra", "Liao"],
    answerIndex: 0
  },

  // --- DÍA 7 (Preguntas 91 - 105) ---
  {
    id: 91,
    text: "¿Cuál es el nombre del proyecto espacial secreto de la Base Lunar Horizon del cual Winston y Hammond escaparon?",
    options: ["Proyecto Horizonte / Colonización", "Horizon Lunar Colony Program", "Iniciativa Éxodo", "Base Lunar Horizon"],
    answerIndex: 3
  },
  {
    id: 92,
    text: "¿Qué mapa de avance de Overwatch 2 transcurre en las calles del centro de Roma, Italia?",
    options: ["Coliseo", "Rialto", "Venecia", "Esperança"],
    answerIndex: 0
  },
  {
    id: 93,
    text: "¿Cómo se llama el rifle francotirador modificado de Ana Amari?",
    options: ["Rifle Biótico", "Rifle de Precisión Horus", "Rifle del Ojo de Horus", "Cañón Médico de Riel"],
    answerIndex: 0
  },
  {
    id: 94,
    text: "¿Qué organización ómnica terrorista atacó Londres (King's Row) en el lore clásico?",
    options: ["Null Sector", "Talon", "Crisis Ómnica", "Guerilla de Chatarra"],
    answerIndex: 0
  },
  {
    id: 95,
    text: "¿Cuál es el valor máximo de escudos (Shields) regenerables que tiene Symmetra por defecto?",
    options: ["125 escudos", "100 escudos", "150 escudos", "75 escudos"],
    answerIndex: 0
  },
  {
    id: 96,
    text: "¿Cuál es el enfriamiento de la habilidad Gancho (Chain Hook) de Roadhog en Overwatch 2?",
    options: ["6 segundos", "8 segundos", "7 segundos", "9 segundos"],
    answerIndex: 1
  },
  {
    id: 97,
    text: "¿Cómo se llama la inteligencia artificial secundaria del mapa Observatorio: Gibraltar?",
    options: ["Athena", "Juno", "Anubis", "Orisa"],
    answerIndex: 0
  },
  {
    id: 98,
    text: "¿De qué color es el rayo de amplificación de daño del Bastón Caduceo de Mercy?",
    options: ["Azul", "Amarillo", "Verde", "Morado"],
    answerIndex: 0
  },
  {
    id: 99,
    text: "¿Cuál es la pasiva del rol de Tanque en Overwatch 2?",
    options: ["Reducción de empuje recibido y menor generación de definitiva al recibir daño", "Inmunidad parcial a aturdimientos", "Regeneración de vida al no recibir daño", "Mayor velocidad de recarga"],
    answerIndex: 0
  },
  {
    id: 100,
    text: "¿Quién es el actor de doblaje original en inglés que da voz a Soldier: 76?",
    options: ["Fred Tatasciore", "Keith Ferguson", "Matthew Mercer", "Crispin Freeman"],
    answerIndex: 0
  },
  {
    id: 101,
    text: "¿Qué héroe tiene una habilidad pasiva llamada 'Segador de almas' (The Reaping)?",
    options: ["Reaper", "Junker Queen", "Roadhog", "Sigma"],
    answerIndex: 0
  },
  {
    id: 102,
    text: "¿Qué personaje ómnico de Overwatch es un experto en hackeo táctico y pertenece a Talon?",
    options: ["Sombra (Es humana, no ómnica)", "Maximilian", "Ramattra", "Ninguno de los anteriores"],
    answerIndex: 3
  },
  {
    id: 103,
    text: "¿De qué personaje es la frase de definitiva: '¡Apagando las luces!'?",
    options: ["Sombra", "Widowmaker", "Illari", "Juno"],
    answerIndex: 0
  },
  {
    id: 104,
    text: "¿Qué héroe de Overwatch se crió en los suburbios de Río de Janeiro?",
    options: ["Lúcio Correia dos Santos", "Baptiste", "Sombra", "Illari"],
    answerIndex: 0
  },
  {
    id: 105,
    text: "¿Cómo se llama el primer cómic oficial digital publicado por Blizzard para Overwatch?",
    options: ["Train Hopper (Cassidy)", "Dragon Slayer", "Going Legit", "Recall"],
    answerIndex: 0
  },

  // --- DÍA 8 (Preguntas 106 - 120) ---
  {
    id: 106,
    text: "¿Qué personaje del lore diseñó los visores tácticos que usa Soldier: 76?",
    options: ["Torvald Lindholm", "Angela Ziegler", "Mina Liao", "Helix Securities"],
    answerIndex: 0
  },
  {
    id: 107,
    text: "¿Cuál es el enfriamiento de la habilidad 'Autodestrucción' de D.Va tras llamar a un nuevo meca?",
    options: ["No tiene enfriamiento por tiempo (se carga con daño e impactos)", "45 segundos", "60 segundos", "30 segundos"],
    answerIndex: 0
  },
  {
    id: 108,
    text: "¿Cómo se llama la científica creadora de la tecnología de regeneración celular de Mercy?",
    options: ["Dra. Angela Ziegler (Ella misma)", "Dra. Mina Liao", "Dra. Moira O'Deorain", "Dra. Katya Volskaya"],
    answerIndex: 0
  },
  {
    id: 109,
    text: "¿De qué organización criminal de la ruta 66 formaba parte Ashe?",
    options: ["Banda Deadlock", "Los Junkers", "Talon", "Los Hashimoto"],
    answerIndex: 0
  },
  {
    id: 110,
    text: "¿Cuál es el daño máximo que realiza el disparo cargado principal de Illari a la cabeza?",
    options: ["112.5 puntos de daño (con multiplicador 1.5x)", "150 puntos de daño", "120 puntos de daño", "135 puntos de daño"],
    answerIndex: 0
  },
  {
    id: 111,
    text: "¿Qué personaje ómnico fundó el grupo terrorista Null Sector?",
    options: ["Ramattra", "Zenyatta", "Mondatta", "Maximilian"],
    answerIndex: 0
  },
  {
    id: 112,
    text: "¿Cuál de los siguientes mapas de Overwatch fue retirado por completo del modo competitivo estándar en Overwatch 2?",
    options: ["Hanamura (Mapa 2CP)", "Ruta 66", "Observatorio: Gibraltar", "Eichenwalde"],
    answerIndex: 0
  },
  {
    id: 113,
    text: "¿Qué personaje Support posee la habilidad pasiva de trepar paredes (Wall Climb) similar a Genji y Hanzo?",
    options: ["Kiriko", "Baptiste", "Lifeweaver", "Lúcio (Tiene Wall Ride, no Wall Climb)"],
    answerIndex: 0
  },
  {
    id: 114,
    text: "¿Cuál es el nombre del mineral altamente inestable que causó el accidente orbital de Sigma?",
    options: ["No fue un mineral, fue un experimento de contención de un agujero negro", "Uranio modificado", "Ómnium-3", "Luz sólida refractada"],
    answerIndex: 0
  },
  {
    id: 115,
    text: "¿Qué mapa transcurre en la azotea y rascacielos de una metrópolis futurista coreana?",
    options: ["Busan: Centro", "Busan: MEKA Base", "Torre Lijiang", "Seúl: Cielo"],
    answerIndex: 1
  },
  {
    id: 116,
    text: "¿Qué porcentaje de velocidad de movimiento otorga la habilidad 'Deslizarse' (Slide) de Sojourn?",
    options: ["No tiene un porcentaje fijo, es un impulso de distancia constante rápido", "30%", "50%", "70%"],
    answerIndex: 0
  },
  {
    id: 117,
    text: "¿Cuál es el apodo del ómnico escolta del payload en el mapa de Hollywood?",
    options: ["Hal-Fred Glitchbot", "Maximilian", "Sven", "Bob"],
    answerIndex: 0
  },
  {
    id: 118,
    text: "¿Cuál es el daño base del Martillo a Reacción de Reinhardt por golpe en Overwatch 2?",
    options: ["85 puntos de daño", "100 puntos de daño", "75 puntos de daño", "90 puntos de daño"],
    answerIndex: 0
  },
  {
    id: 119,
    text: "¿Qué personaje Support tiene un arma llamada 'Disparador Solar'?",
    options: ["Illari", "Juno", "Kiriko", "Moira"],
    answerIndex: 0
  },
  {
    id: 120,
    text: "¿Cuál es el nombre del cortometraje animado de Overwatch centrado en el despertar de Bastion?",
    options: ["The Last Bastion", "Recall", "Honor and Glory", "Rise and Shine"],
    answerIndex: 0
  },

  // --- DÍA 9 (Preguntas 121 - 135) ---
  {
    id: 121,
    text: "¿De qué país procede Roadhog según su biografía oficial del lore?",
    options: ["Australia", "Nueva Zelanda", "Sudáfrica", "Desconocido"],
    answerIndex: 0
  },
  {
    id: 122,
    text: "¿Cuál es el nombre de la mascota de Winston en su cubículo de la Base Lunar Horizon?",
    options: ["No tenía mascota (tenía un peluche y plátanos/mantequilla de cacahuete)", "Snowball", "Ganímedes", "Pepe"],
    answerIndex: 0
  },
  {
    id: 123,
    text: "¿Cuál es la definitiva de Cassidy?",
    options: ["Sin correlates (Deadeye)", "High Noon", "Bala de Plata", "Tiro Rápido"],
    answerIndex: 0
  },
  {
    id: 124,
    text: "¿Cómo se llama la corporación multinacional que controla el suministro de energía en Dorado, México?",
    options: ["LumeriCo", "Vishkar", "Talon", "Industrias Volskaya"],
    answerIndex: 0
  },
  {
    id: 125,
    text: "¿Cuál es la duración base de la habilidad definitiva de Mercy, Valquiria?",
    options: ["15 segundos", "20 segundos", "12 segundos", "18 segundos"],
    answerIndex: 0
  },
  {
    id: 126,
    text: "¿Qué héroe tiene una habilidad pasiva llamada 'Inspirar' (Inspire)?",
    options: ["Brigitte", "Lucio", "Mercy", "Zenyatta"],
    answerIndex: 0
  },
  {
    id: 127,
    text: "¿Cuál es la salud total de Wrecking Ball (Hammond) en partidas de rol de Tanque (con escudo base)?",
    options: ["700 PS (550 vida + 150 armadura)", "650 PS", "800 PS", "750 PS"],
    answerIndex: 0
  },
  {
    id: 128,
    text: "¿De qué color es la barrera de energía protectora de Winston?",
    options: ["Azul claro", "Rojo", "Verde", "Amarillo"],
    answerIndex: 0
  },
  {
    id: 129,
    text: "¿Qué personaje ómnico de Overwatch fue diseñado originalmente como un robot de minería?",
    options: ["Orisa (derivada del OR15 de defensa, que a su vez deriva del OR14 de combate)", "Bastion", "Zenyatta", "Ramattra"],
    answerIndex: 3
  },
  {
    id: 130,
    text: "¿Cuál es la nacionalidad de Moira O'Deorain?",
    options: ["Irlandesa", "Escocesa", "Inglesa", "Galesa"],
    answerIndex: 0
  },
  {
    id: 131,
    text: "¿Cuál es el enfriamiento de la habilidad 'Gancho de Agarre' de Widowmaker?",
    options: ["12 segundos", "10 segundos", "15 segundos", "8 segundos"],
    answerIndex: 0
  },
  {
    id: 132,
    text: "¿Cómo se llama la hija de Ana Amari?",
    options: ["Fareeha Amari (Pharah)", "Amélie", "Sombra", "Efi"],
    answerIndex: 0
  },
  {
    id: 133,
    text: "¿Qué mapa de tipo Híbrido se sitúa en la capital de Inglaterra?",
    options: ["King's Row", "Londres", "Midtown", "Rialto"],
    answerIndex: 0
  },
  {
    id: 134,
    text: "¿Qué arma utiliza Junker Queen como disparo principal?",
    options: ["Escopeta de corredera (Scattergun)", "Rifle de asalto", "Lanzagranadas", "Cañón de chatarra"],
    answerIndex: 0
  },
  {
    id: 135,
    text: "¿Cuál es la habilidad pasiva de Junkrat que suelta granadas al morir?",
    options: ["Caos total (Total Mayhem)", "Último aliento", "Regalo de despedida", "Explosión final"],
    answerIndex: 0
  },

  // --- DÍA 10 (Preguntas 136 - 150) ---
  {
    id: 136,
    text: "¿Quién es el creador del guantelete original de Doomfist según el lore?",
    options: ["La Fundación Adhabayo (el primer Doomfist)", "Industrias Scrapyard", "Talon", "Efi Oladele"],
    answerIndex: 0
  },
  {
    id: 137,
    text: "¿De qué personaje es la línea de voz: 'Justice rains from above!'?",
    options: ["Pharah", "Reinhardt", "Soldier: 76", "Mercy"],
    answerIndex: 0
  },
  {
    id: 138,
    text: "¿Cuál es el nombre del reactor ómnico inactivo situado en el mapa de Busan?",
    options: ["El Omnium del Mar del Este (East Sea Omnium)", "Core Omnium", "Busan Reactor", "MEKA Core"],
    answerIndex: 0
  },
  {
    id: 139,
    text: "¿Cuál es la velocidad máxima de proyectil de la flecha de Hanzo al cargarse por completo?",
    options: ["110 m/s", "80 m/s", "120 m/s", "95 m/s"],
    answerIndex: 0
  },
  {
    id: 140,
    text: "¿Cuál es el nombre de la líder del grupo criminal 'Deadlock Gang' en el que Cassidy solía estar?",
    options: ["Elizabeth Caledonia Ashe", "Junker Queen", "Sombra", "Olivia Colomar"],
    answerIndex: 0
  },
  {
    id: 141,
    text: "¿Qué personaje Support de Overwatch 2 cura disparando ráfagas de 3 proyectiles?",
    options: ["Baptiste", "Juno", "Ana", "Kiriko"],
    answerIndex: 0
  },
  {
    id: 142,
    text: "¿Cuál es el enfriamiento de la habilidad 'Campo de Fuerza' (Deflect) de Genji?",
    options: ["8 segundos", "10 segundos", "12 segundos", "6 segundos"],
    answerIndex: 0
  },
  {
    id: 143,
    text: "¿De qué color es la orbe de discordia de Zenyatta visualmente?",
    options: ["Morado oscuro", "Amarillo", "Rojo", "Verde"],
    answerIndex: 0
  },
  {
    id: 144,
    text: "¿Cuál es el mapa situado en una isla artificial ecológica de lujo en el golfo pérsico?",
    options: ["Oasis", "Ilios", "Dorado", "Paraíso"],
    answerIndex: 0
  },
  {
    id: 145,
    text: "¿Qué personaje Damage puede crear un clon de hielo criogénico para bloquear pasillos?",
    options: ["Mei", "Symmetra", "Torbjörn", "Bastion"],
    answerIndex: 0
  },
  {
    id: 146,
    text: "¿Cuál de estos personajes formó parte de la primera generación de agentes fundadores de Overwatch?",
    options: ["Ana Amari", "Cole Cassidy", "Genji Shimada", "Winston"],
    answerIndex: 0
  },
  {
    id: 147,
    text: "¿De qué personaje es la voz en inglés que dice 'Die, Die, Die!'?",
    options: ["Keith Ferguson (Reaper)", "Fred Tatasciore", "Matthew Mercer", "Crispin Freeman"],
    answerIndex: 0
  },
  {
    id: 148,
    text: "¿Cuál es la salud máxima del escudo de Reinhardt en Overwatch 2 actualmente?",
    options: ["1600 PS", "1200 PS", "1400 PS", "2000 PS"],
    answerIndex: 0
  },
  {
    id: 149,
    text: "¿Cuál es la nacionalidad del personaje Sigma?",
    options: ["Neerlandesa (Países Bajos)", "Alemana", "Belga", "Austriaca"],
    answerIndex: 0
  },
  {
    id: 150,
    text: "¿Qué ómnico espiritual fue asesinado por Widowmaker en el cortometraje 'Alive'?",
    options: ["Tekhartha Mondatta", "Zenyatta", "Ramattra", "Maximilian"],
    answerIndex: 0
  },

  // --- DÍA 11 (Preguntas 151 - 165) ---
  {
    id: 151,
    text: "¿Qué mapa transcurre en la base secreta de la organización terrorista Talon?",
    options: ["Rialto (Venecia / Base de operaciones)", "Circuit Royal", "esperança", "Dorado"],
    answerIndex: 0
  },
  {
    id: 152,
    text: "¿Cuál es el enfriamiento de la habilidad 'Vuelo' de D.Va?",
    options: ["4 segundos", "5 segundos", "3 segundos", "6 segundos"],
    answerIndex: 0
  },
  {
    id: 153,
    text: "¿Cuál es el verdadero nombre de Soldier: 76?",
    options: ["Jack Morrison", "Gabriel Reyes", "John Mac", "Cole Cassidy"],
    answerIndex: 0
  },
  {
    id: 154,
    text: "¿Qué personaje ómnico rebelde tiene la habilidad definitiva 'Aniquilación'?",
    options: ["Ramattra", "Bastion", "Zenyatta", "Orisa"],
    answerIndex: 0
  },
  {
    id: 155,
    text: "¿Cuál es el arma principal de Symmetra?",
    options: ["Proyector de Fotones", "Pistola Endotérmica", "Lanzador de Riel", "Disparador de plasma"],
    answerIndex: 0
  },
  {
    id: 156,
    text: "¿Cuál es el daño base del Golpe de Gracia (Quick Melee) en Overwatch 2 para héroes normales?",
    options: ["30 puntos de daño", "40 puntos de daño", "25 puntos de daño", "35 puntos de daño"],
    answerIndex: 0
  },
  {
    id: 157,
    text: "¿Cómo se llama el hámster genéticamente modificado de Overwatch?",
    options: ["Hammond (Wrecking Ball)", "Winston", "Snowball", "Pepe"],
    answerIndex: 0
  },
  {
    id: 158,
    text: "¿Qué mapa de escolta de Overwatch 2 transcurre en el circuito de carreras de Mónaco?",
    options: ["Circuit Royal", "Rialto", "Coliseo", "Paraíso"],
    answerIndex: 0
  },
  {
    id: 159,
    text: "¿Cuál es el enfriamiento de la habilidad 'Traslación' (Translocator) de Sombra en Overwatch 2?",
    options: ["6 segundos", "5 segundos", "7 segundos", "8 segundos"],
    answerIndex: 1
  },
  {
    id: 160,
    text: "¿Cuál de los siguientes personajes tiene una salud base compuesta al 100% de escudos?",
    options: ["Zenyatta (Tiene 50 de vida y 150 de escudo, no 100% escudo)", "Symmetra", "Sigma", "Ninguno de los anteriores"],
    answerIndex: 3
  },
  {
    id: 161,
    text: "¿Qué tipo de proyectiles dispara el arma principal de Zenyatta?",
    options: ["Orbes de energía destructiva", "Kunais", "Estrellas ninja", "Balas bióticas"],
    answerIndex: 0
  },
  {
    id: 162,
    text: "¿Cuál es el nombre de la inteligencia artificial de control de carga en King's Row?",
    options: ["No tiene nombre oficial de IA individual, es un dispositivo PEM", "Athena", "Anubis", "Juno"],
    answerIndex: 0
  },
  {
    id: 163,
    text: "¿Cuál es la nacionalidad de Brigitte Lindholm?",
    options: ["Sueca", "Alemana", "Noruega", "Suiza"],
    answerIndex: 0
  },
  {
    id: 164,
    text: "¿Qué habilidad de Baptiste le permite saltar extremadamente alto acumulando energía?",
    options: ["Exobotas (Exo Boots)", "Salto de Propulsión", "Impulso Biótico", "Botas cohete"],
    answerIndex: 0
  },
  {
    id: 165,
    text: "¿Cuál es la definitiva de Illari?",
    options: ["Sol Cautivo (Captive Sun)", "Sol Naciente", "Explosión Solar", "Luz de la Justicia"],
    answerIndex: 0
  },

  // --- DÍA 12 (Preguntas 166 - 180) ---
  {
    id: 166,
    text: "¿De qué personaje es la frase de definitiva: 'Cease your resistance!'?",
    options: ["Orisa", "Sigma", "Symmetra", "Zarya"],
    answerIndex: 0
  },
  {
    id: 167,
    text: "¿Cuál es la velocidad de recarga del cargador de Tracer en segundos?",
    options: ["1.15 segundos", "1 segundo", "1.5 segundos", "1.25 segundos"],
    answerIndex: 0
  },
  {
    id: 168,
    text: "¿Qué personaje Damage de Overwatch utiliza una escopeta de perdigones doble?",
    options: ["Reaper (Segador)", "Torbjörn", "Roadhog (Es tanque)", "Ashe"],
    answerIndex: 0
  },
  {
    id: 169,
    text: "¿Cuál es el enfriamiento de la habilidad 'Barrera Defensiva' de Zarya (Autoburbuja)?",
    options: ["10 segundos", "11 segundos", "12 segundos", "9 segundos"],
    answerIndex: 0
  },
  {
    id: 170,
    text: "¿Qué mapa transcurre en la costa mediterránea de Francia y es un castillo familiar?",
    options: ["Château Guillard", "Paris", "Rialto", "Circuit Royal"],
    answerIndex: 0
  },
  {
    id: 171,
    text: "¿Cuál es el verdadero nombre de la heroína conocida como Widowmaker?",
    options: ["Amélie Lacroix", "Olivia Colomar", "Satya Vaswani", "Fareeha Amari"],
    answerIndex: 0
  },
  {
    id: 172,
    text: "¿Qué Support tiene una habilidad definitiva que cura en un gran árbol de luz?",
    options: ["Lifeweaver (Árbol de la Vida)", "Zenyatta", "Lúcio", "Moira"],
    answerIndex: 0
  },
  {
    id: 173,
    text: "¿Cuál es el enfriamiento de la habilidad 'Regresión' (Recall) de Tracer?",
    options: ["12 segundos", "13 segundos", "15 segundos", "10 segundos"],
    answerIndex: 1
  },
  {
    id: 174,
    text: "¿Qué mapa de control de Overwatch transcurre en el centro de Grecia?",
    options: ["Ilios", "Atenas", "Oasis", "Nepal"],
    answerIndex: 0
  },
  {
    id: 175,
    text: "¿Cuál es la nacionalidad de Reinhardt Wilhelm?",
    options: ["Alemana", "Austriaca", "Suiza", "Belga"],
    answerIndex: 0
  },
  {
    id: 176,
    text: "¿Cuál es el enfriamiento de la habilidad 'Dardo Sedante' de Ana en Overwatch 2?",
    options: ["14 segundos", "15 segundos", "12 segundos", "16 segundos"],
    answerIndex: 0
  },
  {
    id: 177,
    text: "¿Qué ómnico rebelde fue creado por Mina Liao como el pináculo del diseño robótico adaptativo?",
    options: ["Echo", "Bastion", "Orisa", "Ramattra"],
    answerIndex: 0
  },
  {
    id: 178,
    text: "¿Qué mapa transcurre en un templo de las montañas nevadas de Nepal?",
    options: ["Santuario de Nepal", "Ecopunto: Antártida", "Hanamura", "Gibraltar"],
    answerIndex: 0
  },
  {
    id: 179,
    text: "¿Cuál es la duración máxima de la definitiva 'Visor Táctico' de Soldier: 76?",
    options: ["6 segundos", "5 segundos", "7 segundos", "8 segundos"],
    answerIndex: 0
  },
  {
    id: 180,
    text: "¿Qué personaje Tank es capaz de lanzar una roca gigante con la habilidad 'Acreción'?",
    options: ["Sigma", "Doomfist", "Winston", "Roadhog"],
    answerIndex: 0
  },

  // --- DÍA 13 (Preguntas 181 - 195) ---
  {
    id: 181,
    text: "¿Cuál es el enfriamiento base de la habilidad 'Campo Biótico' (Biotic Field) de Soldier: 76?",
    options: ["15 segundos", "18 segundos", "12 segundos", "20 segundos"],
    answerIndex: 0
  },
  {
    id: 182,
    text: "¿Cómo se llama la inteligencia artificial del dron de Mei?",
    options: ["Snowball", "Ganímedes", "Pepe", "Bob"],
    answerIndex: 0
  },
  {
    id: 183,
    text: "¿De qué personaje es la frase de definitiva: '¡Fuego en el hoyo!' (Fire in the hole!)?",
    options: ["Junkrat", "Torbjörn", "Ashe", "Bastion"],
    answerIndex: 0
  },
  {
    id: 184,
    text: "¿Cuál es la cantidad de curación por segundo que otorga la habilidad definitiva 'Trascendencia' de Zenyatta?",
    options: ["300 PS/s", "200 PS/s", "250 PS/s", "400 PS/s"],
    answerIndex: 0
  },
  {
    id: 185,
    text: "¿Qué mapa de escolta transcurre en una chatarrería del desierto australiano?",
    options: ["Junkertown", "Ruta 66", "Dorado", "Rialto"],
    answerIndex: 0
  },
  {
    id: 186,
    text: "¿De qué personaje es el arma principal: 'Remachadora' (Rivet Gun)?",
    options: ["Torbjörn", "D.Va", "Winston", "Brigitte"],
    answerIndex: 0
  },
  {
    id: 187,
    text: "¿Cuál es la salud máxima del escudo protector 'Barrera Cinética' de Sigma en su lanzamiento base de OW2?",
    options: ["700 PS", "600 PS", "800 PS", "500 PS"],
    answerIndex: 0
  },
  {
    id: 188,
    text: "¿Cuál es la nacionalidad de Genji y Hanzo Shimada?",
    options: ["Japonesa", "China", "Coreana", "Taiwanesa"],
    answerIndex: 0
  },
  {
    id: 189,
    text: "¿Qué habilidad permite a Sojourn deslizarse a alta velocidad y luego dar un gran salto?",
    options: ["Deslizarse (Power Slide)", "Impulso de Salto", "Traslación", "Propulsión"],
    answerIndex: 0
  },
  {
    id: 190,
    text: "¿Cuál es la definitiva de D.Va?",
    options: ["Autodestrucción (Self-Destruct)", "Llamar Meca", "Matriz de defensa", "Cañón de fusión"],
    answerIndex: 0
  },
  {
    id: 191,
    text: "¿Qué mapa híbrido de Overwatch transcurre en la capital de Alemania y cuenta con un gran castillo medieval?",
    options: ["Eichenwalde", "Essen", "Gotemburgo", "King's Row"],
    answerIndex: 0
  },
  {
    id: 192,
    text: "¿Cuál es el enfriamiento de la habilidad 'Plataforma de Pétalos' de Lifeweaver?",
    options: ["12 segundos", "10 segundos", "8 segundos", "14 segundos"],
    answerIndex: 0
  },
  {
    id: 193,
    text: "¿Cuál es el multiplicador de daño por disparo a la cabeza (Headshot) que tiene Widowmaker en su mira telescópica cargada?",
    options: ["2.5x", "2.0x", "1.5x", "3.0x"],
    answerIndex: 0
  },
  {
    id: 194,
    text: "¿Qué personaje tiene la pasiva 'Paso de la Sombra' (Shadow Step)?",
    options: ["Reaper (Es una habilidad activa, no pasiva, pero se asocia a su kit)", "Sombra", "Genji", "Ninguno de los anteriores (Es habilidad activa de Reaper)"],
    answerIndex: 3
  },
  {
    id: 195,
    text: "¿Cuál es el nombre del gorila modificado genéticamente que lideró a Overwatch en su llamada a la acción en OW2?",
    options: ["Winston", "Hammond", "Simon", "Dr. Harold"],
    answerIndex: 0
  },

  // --- DÍA 14 (Preguntas 196 - 210) ---
  {
    id: 196,
    text: "¿Cuál es el enfriamiento de la habilidad 'Lanza de Javalina' de Orisa en Overwatch 2?",
    options: ["6 segundos", "8 segundos", "7 segundos", "5 segundos"],
    answerIndex: 0
  },
  {
    id: 197,
    text: "¿De qué personaje es la frase de definitiva: '¡Ojo con mi definitiva!' (en inglés: 'Propaganda is useless!')?",
    options: ["Sombra (EMP)", "Symmetra", "Widowmaker", "Zarya"],
    answerIndex: 0
  },
  {
    id: 198,
    text: "¿Cuál es la nacionalidad de la heroína conocida como Kiriko?",
    options: ["Japonesa", "China", "Coreana", "Vietnamita"],
    answerIndex: 0
  },
  {
    id: 199,
    text: "¿Qué mapa transcurre en la capital científica del desierto de Arabia Saudí?",
    options: ["Oasis", "Dorado", "Ilios", "Rialto"],
    answerIndex: 0
  },
  {
    id: 200,
    text: "¿Cuál es el enfriamiento base de la habilidad 'Barrera Cinética' (Kinetic Barrier) de Sigma?",
    options: ["No tiene enfriamiento fijo (se puede retirar y desplegar con 2s de recarga)", "12 segundos", "8 segundos", "10 segundos"],
    answerIndex: 0
  },
  {
    id: 201,
    text: "¿Qué personaje Damage tiene la habilidad definitiva 'Ventisca' (Blizzard)?",
    options: ["Mei", "Genji", "Tracer", "Junkrat"],
    answerIndex: 0
  },
  {
    id: 202,
    text: "¿Cuál es el verdadero nombre del personaje conocido como Wrecking Ball?",
    options: ["Hammond", "Winston", "Sven", "Pepe"],
    answerIndex: 0
  },
  {
    id: 203,
    text: "¿Qué mapa transcurre en la ciudad natal y base de operaciones del personaje Lúcio?",
    options: ["Paraíso (Río de Janeiro)", "Esperança", "Dorado", "Rialto"],
    answerIndex: 0
  },
  {
    id: 204,
    text: "¿Cuál es el enfriamiento de la habilidad 'Suzu de Protección' de Kiriko?",
    options: ["15 segundos", "14 segundos", "12 segundos", "16 segundos"],
    answerIndex: 0
  },
  {
    id: 205,
    text: "¿De qué personaje es la frase de definitiva: '¡La justicia llueve del cielo!'?",
    options: ["Pharah", "Soldier: 76", "Ana", "Mercy"],
    answerIndex: 0
  },
  {
    id: 206,
    text: "¿Cuál es la salud máxima del meca de D.Va en Overwatch 2?",
    options: ["650 PS (350 vida + 300 armadura)", "600 PS", "700 PS", "550 PS"],
    answerIndex: 0
  },
  {
    id: 207,
    text: "¿Qué personaje Support utiliza un rifle llamado 'Disparador Solar' que cura de forma pasiva?",
    options: ["Illari (Su torreta cura pasivamente, ella dispara curación de corto alcance)", "Juno", "Kiriko", "Moira"],
    answerIndex: 0
  },
  {
    id: 208,
    text: "¿Cuál es el enfriamiento de la habilidad 'Grito de Batalla' de Junker Queen?",
    options: ["14 segundos", "15 segundos", "12 segundos", "16 segundos"],
    answerIndex: 0
  },
  {
    id: 209,
    text: "¿Cómo se llama la nave insignia y base de operaciones móvil de Overwatch?",
    options: ["El Hyperion (No, es de Starcraft)", "El Orca", "El Atlas", "El Titán"],
    answerIndex: 1
  },
  {
    id: 210,
    text: "¿Cuál es la nacionalidad de la heroína espacial Juno?",
    options: ["Marciana / Estadounidense (Nacida en el Proyecto Hermes en Marte)", "Coreana", "Japonesa", "China"],
    answerIndex: 0
  },

  // --- DÍA 15 (Preguntas 211 - 225) ---
  {
    id: 211,
    text: "¿Cuál es el enfriamiento de la habilidad 'Lanza de Javalina' de Orisa en su última actualización de OW2?",
    options: ["6 segundos", "8 segundos", "7 segundos", "5 segundos"],
    answerIndex: 0
  },
  {
    id: 212,
    text: "¿Qué personaje Support tiene la habilidad pasiva de flotar lentamente en el aire planeando?",
    options: ["Mercy (Descenso angélico)", "Zenyatta", "Lúcio", "Kiriko"],
    answerIndex: 0
  },
  {
    id: 213,
    text: "¿Cuál es el enfriamiento de la habilidad 'Gancho de Agarre' de Wrecking Ball (Hammond)?",
    options: ["5 segundos", "6 segundos", "4 segundos", "7 segundos"],
    answerIndex: 0
  },
  {
    id: 214,
    text: "¿Qué mapa transcurre en la capital de Portugal en Overwatch 2?",
    options: ["Esperança", "Coliseo", "Rialto", "Paraíso"],
    answerIndex: 0
  },
  {
    id: 215,
    text: "¿Cuál es el enfriamiento de la habilidad 'Dardo Sedante' de Ana en un personaje Tanque?",
    options: ["El dardo tiene el mismo enfriamiento (14s), pero el efecto dura menos (3s en lugar de 5s)", "El dardo no afecta a los tanques", "16 segundos", "18 segundos"],
    answerIndex: 0
  },
  {
    id: 216,
    text: "¿Qué personaje Damage es capaz de colocar una torreta que dispara ráfagas de lava?",
    options: ["Torbjörn (Su definitiva es Núcleo de Lava, no su torreta)", "Symmetra", "Bastion", "Ninguno de los anteriores"],
    answerIndex: 3
  },
  {
    id: 217,
    text: "¿Cuál es el verdadero nombre de la heroína conocida como Tracer?",
    options: ["Lena Oxton", "Olivia Colomar", "Amélie Lacroix", "Fareeha Amari"],
    answerIndex: 0
  },
  {
    id: 218,
    text: "¿Qué mapa de Overwatch transcurre en un castillo familiar cerca del mar en Francia?",
    options: ["Château Guillard", "Paris", "Rialto", "Esperança"],
    answerIndex: 0
  },
  {
    id: 219,
    text: "¿Cuál es el enfriamiento de la habilidad 'Traslación' (Blink) de Tracer?",
    options: ["3 segundos por carga", "4 segundos", "5 segundos", "2 segundos"],
    answerIndex: 0
  },
  {
    id: 220,
    text: "¿Qué personaje Support tiene una habilidad pasiva llamada 'Inspirar'?",
    options: ["Brigitte", "Lucio", "Mercy", "Zenyatta"],
    answerIndex: 0
  },
  {
    id: 221,
    text: "¿Cuál es la nacionalidad de la heroína conocida como Junker Queen?",
    options: ["Australiana", "Neozelandesa", "Sudafricana", "Fiyiana"],
    answerIndex: 0
  },
  {
    id: 222,
    text: "¿Cuál es el enfriamiento de la habilidad 'Campo de Inmortalidad' de Baptiste?",
    options: ["25 segundos", "30 segundos", "18 segundos", "22 segundos"],
    answerIndex: 0
  },
  {
    id: 223,
    text: "¿Cómo se llama el hermano mayor de Genji Shimada?",
    options: ["Hanzo Shimada", "Zenyatta", "Sojourn", "Cole Cassidy"],
    answerIndex: 0
  },
  {
    id: 224,
    text: "¿Cuál es la pasiva única de Zenyatta en combate cuerpo a cuerpo?",
    options: ["Patada rápida (aumenta el empuje y daño en 50%)", "Meditación", "Flotar silencioso", "Orbe de protección"],
    answerIndex: 0
  },
  {
    id: 225,
    text: "¿Cuál es el enfriamiento base en segundos de la habilidad Regeneración Biótica de Moira?",
    options: ["No tiene enfriamiento (se recarga infligiendo daño con el haz biótico morado)", "6 segundos", "8 segundos", "10 segundos"],
    answerIndex: 0
  },

  // --- DÍA 16 (Preguntas 226 - 240) ---
  {
    id: 226,
    text: "¿Cuál es el nombre del segundo Doomfist, conocido como 'El Azote'?",
    options: ["Akinjide Adeyemi", "Akande Ogundimu", "Efe Oladele", "Maximilian"],
    answerIndex: 0
  },
  {
    id: 227,
    text: "¿Cuál es el multiplicador de velocidad que aplica Lúcio con 'Subidón de Adrenalina' (Amp It Up) en modo velocidad?",
    options: ["60%", "50%", "70%", "45%"],
    answerIndex: 0
  },
  {
    id: 228,
    text: "¿Qué personaje del lore es el líder y comandante de las fuerzas ómnicas de Null Sector?",
    options: ["Ramattra", "Maximilian", "Mondatta", "Bastion"],
    answerIndex: 0
  },
  {
    id: 229,
    text: "¿Cuál es la duración exacta de la definitiva 'Bomba de Pulso' de Tracer clavada en el suelo antes de explotar?",
    options: ["1.0 segundo", "1.5 segundos", "2.0 segundos", "0.75 segundos"],
    answerIndex: 0
  },
  {
    id: 230,
    text: "¿Qué mapa transcurre en una lujosa propiedad costera en la costa azul de Francia?",
    options: ["Château Guillard", "Paris", "Rialto", "Circuit Royal"],
    answerIndex: 0
  },
  {
    id: 231,
    text: "¿Cuál es el cooldown en segundos de la habilidad 'Lanzamiento de Gancho' (Grappling Hook) de Widowmaker?",
    options: ["12 segundos", "15 segundos", "10 segundos", "14 segundos"],
    answerIndex: 0
  },
  {
    id: 232,
    text: "¿Qué Support tiene la pasiva 'Ángel de la Guarda'?",
    options: ["Mercy", "Lucio", "Kiriko", "Juno"],
    answerIndex: 0
  },
  {
    id: 233,
    text: "¿Cuál es el cooldown base de la habilidad 'Dardo Sedante' de Ana en Overwatch 2?",
    options: ["14 segundos", "15 segundos", "12 segundos", "16 segundos"],
    answerIndex: 0
  },
  {
    id: 234,
    text: "¿Qué mapa de control de Overwatch transcurre en la costa de Grecia?",
    options: ["Ilios", "Rialto", "Oasis", "Nepal"],
    answerIndex: 0
  },
  {
    id: 235,
    text: "¿Cuál es la nacionalidad de Reinhardt Wilhelm?",
    options: ["Alemana", "Austriaca", "Suiza", "Belga"],
    answerIndex: 0
  },
  {
    id: 236,
    text: "¿Cuál es el cooldown de la habilidad 'Campo de Inmortalidad' de Baptiste?",
    options: ["25 segundos", "30 segundos", "18 segundos", "22 segundos"],
    answerIndex: 0
  },
  {
    id: 237,
    text: "¿Qué ómnico rebelde fue creado por Mina Liao como el pináculo del diseño robótico adaptativo?",
    options: ["Echo", "Bastion", "Orisa", "Ramattra"],
    answerIndex: 0
  },
  {
    id: 238,
    text: "¿Qué mapa transcurre en un templo de las montañas nevadas de Nepal?",
    options: ["Santuario de Nepal", "Ecopunto: Antártida", "Hanamura", "Gibraltar"],
    answerIndex: 0
  },
  {
    id: 239,
    text: "¿Cuál es la duración máxima de la definitiva 'Visor Táctico' de Soldier: 76?",
    options: ["6 segundos", "5 segundos", "7 segundos", "8 segundos"],
    answerIndex: 0
  },
  {
    id: 240,
    text: "¿Qué personaje Tank es capaz de lanzar una roca gigante con la habilidad 'Acreción'?",
    options: ["Sigma", "Doomfist", "Winston", "Roadhog"],
    answerIndex: 0
  },

  // --- DÍA 17 (Preguntas 241 - 255) ---
  {
    id: 241,
    text: "¿Cuál es el nombre del proyecto espacial secreto de la Base Lunar Horizon del cual Winston y Hammond escaparon?",
    options: ["Proyecto Horizonte / Colonización", "Horizon Lunar Colony Program", "Iniciativa Éxodo", "Base Lunar Horizon"],
    answerIndex: 3
  },
  {
    id: 242,
    text: "¿Qué mapa de avance de Overwatch 2 transcurre en las calles del centro de Roma, Italia?",
    options: ["Coliseo", "Rialto", "Venecia", "Esperança"],
    answerIndex: 0
  },
  {
    id: 243,
    text: "¿Cómo se llama el rifle francotirador modificado de Ana Amari?",
    options: ["Rifle Biótico", "Rifle de Precisión Horus", "Rifle del Ojo de Horus", "Cañón Médico de Riel"],
    answerIndex: 0
  },
  {
    id: 244,
    text: "¿Qué organización ómnica terrorista atacó Londres (King's Row) en el lore clásico?",
    options: ["Null Sector", "Talon", "Crisis Ómnica", "Guerilla de Chatarra"],
    answerIndex: 0
  },
  {
    id: 245,
    text: "¿Cuál es el valor máximo de escudos (Shields) regenerables que tiene Symmetra por defecto?",
    options: ["125 escudos", "100 escudos", "150 escudos", "75 escudos"],
    answerIndex: 0
  },
  {
    id: 246,
    text: "¿Cuál es el enfriamiento de la habilidad Gancho (Chain Hook) de Roadhog en Overwatch 2?",
    options: ["6 segundos", "8 segundos", "7 segundos", "9 segundos"],
    answerIndex: 1
  },
  {
    id: 247,
    text: "¿Cómo se llama la inteligencia artificial secundaria del mapa Observatorio: Gibraltar?",
    options: ["Athena", "Juno", "Anubis", "Orisa"],
    answerIndex: 0
  },
  {
    id: 248,
    text: "¿De qué color es el rayo de amplificación de daño del Bastón Caduceo de Mercy?",
    options: ["Azul", "Amarillo", "Verde", "Morado"],
    answerIndex: 0
  },
  {
    id: 249,
    text: "¿Cuál es la pasiva del rol de Tanque en Overwatch 2?",
    options: ["Reducción de empuje recibido y menor generación de definitiva al recibir daño", "Inmunidad parcial a aturdimientos", "Regeneración de vida al no recibir daño", "Mayor velocidad de recarga"],
    answerIndex: 0
  },
  {
    id: 250,
    text: "¿Quién es el actor de doblaje original en inglés que da voz a Soldier: 76?",
    options: ["Fred Tatasciore", "Keith Ferguson", "Matthew Mercer", "Crispin Freeman"],
    answerIndex: 0
  },
  {
    id: 251,
    text: "¿Qué héroe tiene una habilidad pasiva llamada 'Segador de almas' (The Reaping)?",
    options: ["Reaper", "Junker Queen", "Roadhog", "Sigma"],
    answerIndex: 0
  },
  {
    id: 252,
    text: "¿Qué personaje ómnico de Overwatch es un experto en hackeo táctico y pertenece a Talon?",
    options: ["Sombra (Es humana, no ómnica)", "Maximilian", "Ramattra", "Ninguno de los anteriores"],
    answerIndex: 3
  },
  {
    id: 253,
    text: "¿De qué personaje es la frase de definitiva: '¡Apagando las luces!'?",
    options: ["Sombra", "Widowmaker", "Illari", "Juno"],
    answerIndex: 0
  },
  {
    id: 254,
    text: "¿Qué héroe de Overwatch se crió en los suburbios de Río de Janeiro?",
    options: ["Lúcio Correia dos Santos", "Baptiste", "Sombra", "Illari"],
    answerIndex: 0
  },
  {
    id: 255,
    text: "¿Cómo se llama el primer cómic oficial digital publicado por Blizzard para Overwatch?",
    options: ["Train Hopper (Cassidy)", "Dragon Slayer", "Going Legit", "Recall"],
    answerIndex: 0
  },

  // --- DÍA 18 (Preguntas 256 - 270) ---
  {
    id: 256,
    text: "¿Qué personaje del lore diseñó los visores tácticos que usa Soldier: 76?",
    options: ["Torvald Lindholm", "Angela Ziegler", "Mina Liao", "Helix Securities"],
    answerIndex: 0
  },
  {
    id: 257,
    text: "¿Cuál es el enfriamiento de la habilidad 'Autodestrucción' de D.Va tras llamar a un nuevo meca?",
    options: ["No tiene enfriamiento por tiempo (se carga con daño e impactos)", "45 segundos", "60 segundos", "30 segundos"],
    answerIndex: 0
  },
  {
    id: 258,
    text: "¿Cómo se llama la científica creadora de la tecnología de regeneración celular de Mercy?",
    options: ["Dra. Angela Ziegler (Ella misma)", "Dra. Mina Liao", "Dra. Moira O'Deorain", "Dra. Katya Volskaya"],
    answerIndex: 0
  },
  {
    id: 259,
    text: "¿De qué organización criminal de la ruta 66 formaba parte Ashe?",
    options: ["Banda Deadlock", "Los Junkers", "Talon", "Los Hashimoto"],
    answerIndex: 0
  },
  {
    id: 260,
    text: "¿Cuál es el daño máximo que realiza el disparo cargado principal de Illari a la cabeza?",
    options: ["112.5 puntos de daño (con multiplicador 1.5x)", "150 puntos de daño", "120 puntos de daño", "135 puntos de daño"],
    answerIndex: 0
  },
  {
    id: 261,
    text: "¿Qué personaje ómnico fundó el grupo terrorista Null Sector?",
    options: ["Ramattra", "Zenyatta", "Mondatta", "Maximilian"],
    answerIndex: 0
  },
  {
    id: 262,
    text: "¿Cuál de los siguientes mapas de Overwatch fue retirado por completo del modo competitivo estándar en Overwatch 2?",
    options: ["Hanamura (Mapa 2CP)", "Ruta 66", "Observatorio: Gibraltar", "Eichenwalde"],
    answerIndex: 0
  },
  {
    id: 263,
    text: "¿Qué personaje Support posee la habilidad pasiva de trepar paredes (Wall Climb) similar a Genji y Hanzo?",
    options: ["Kiriko", "Baptiste", "Lifeweaver", "Lúcio (Tiene Wall Ride, no Wall Climb)"],
    answerIndex: 0
  },
  {
    id: 264,
    text: "¿Cuál es el nombre del mineral altamente inestable que causó el accidente orbital de Sigma?",
    options: ["No fue un mineral, fue un experimento de contención de un agujero negro", "Uranio modificado", "Ómnium-3", "Luz sólida refractada"],
    answerIndex: 0
  },
  {
    id: 265,
    text: "¿Qué mapa transcurre en la azotea y rascacielos de una metrópolis futurista coreana?",
    options: ["Busan: Centro", "Busan: MEKA Base", "Torre Lijiang", "Seúl: Cielo"],
    answerIndex: 1
  },
  {
    id: 266,
    text: "¿Qué porcentaje de velocidad de movimiento otorga la habilidad 'Deslizarse' (Slide) de Sojourn?",
    options: ["No tiene un porcentaje fijo, es un impulso de distancia constante rápido", "30%", "50%", "70%"],
    answerIndex: 0
  },
  {
    id: 267,
    text: "¿Cuál es el apodo del ómnico escolta del payload en el mapa de Hollywood?",
    options: ["Hal-Fred Glitchbot", "Maximilian", "Sven", "Bob"],
    answerIndex: 0
  },
  {
    id: 268,
    text: "¿Cuál es el daño base del Martillo a Reacción de Reinhardt por golpe en Overwatch 2?",
    options: ["85 puntos de daño", "100 puntos de daño", "75 puntos de daño", "90 puntos de daño"],
    answerIndex: 0
  },
  {
    id: 269,
    text: "¿Qué personaje Support tiene un arma llamada 'Disparador Solar'?",
    options: ["Illari", "Juno", "Kiriko", "Moira"],
    answerIndex: 0
  },
  {
    id: 270,
    text: "¿Cuál es el nombre del cortometraje animado de Overwatch centrado en el despertar de Bastion?",
    options: ["The Last Bastion", "Recall", "Honor and Glory", "Rise and Shine"],
    answerIndex: 0
  },

  // --- DÍA 19 (Preguntas 271 - 285) ---
  {
    id: 271,
    text: "¿De qué país procede Roadhog según su biografía oficial del lore?",
    options: ["Australia", "Nueva Zelanda", "Sudáfrica", "Desconocido"],
    answerIndex: 0
  },
  {
    id: 272,
    text: "¿Cuál es el nombre de la mascota de Winston en su cubículo de la Base Lunar Horizon?",
    options: ["No tenía mascota (tenía un peluche y plátanos/mantequilla de cacahuete)", "Snowball", "Ganímedes", "Pepe"],
    answerIndex: 0
  },
  {
    id: 273,
    text: "¿Cuál es la definitiva de Cassidy?",
    options: ["Sin correlates (Deadeye)", "High Noon", "Bala de Plata", "Tiro Rápido"],
    answerIndex: 0
  },
  {
    id: 274,
    text: "¿Cómo se llama la corporación multinacional que controla el suministro de energía en Dorado, México?",
    options: ["LumeriCo", "Vishkar", "Talon", "Industrias Volskaya"],
    answerIndex: 0
  },
  {
    id: 275,
    text: "¿Cuál es la duración base de la habilidad definitiva de Mercy, Valquiria?",
    options: ["15 segundos", "20 segundos", "12 segundos", "18 segundos"],
    answerIndex: 0
  },
  {
    id: 276,
    text: "¿Qué héroe tiene una habilidad pasiva llamada 'Inspirar' (Inspire)?",
    options: ["Brigitte", "Lucio", "Mercy", "Zenyatta"],
    answerIndex: 0
  },
  {
    id: 277,
    text: "¿Cuál es la salud total de Wrecking Ball (Hammond) en partidas de rol de Tanque (con escudo base)?",
    options: ["700 PS (550 vida + 150 armadura)", "650 PS", "800 PS", "750 PS"],
    answerIndex: 0
  },
  {
    id: 278,
    text: "¿De qué color es la barrera de energía protectora de Winston?",
    options: ["Azul claro", "Rojo", "Verde", "Amarillo"],
    answerIndex: 0
  },
  {
    id: 279,
    text: "¿Qué personaje ómnico de Overwatch fue diseñado originalmente como un robot de minería?",
    options: ["Orisa (derivada del OR15 de defensa, que a su vez deriva del OR14 de combate)", "Bastion", "Zenyatta", "Ramattra"],
    answerIndex: 3
  },
  {
    id: 280,
    text: "¿Cuál es la nacionalidad de Moira O'Deorain?",
    options: ["Irlandesa", "Escocesa", "Inglesa", "Galesa"],
    answerIndex: 0
  },
  {
    id: 281,
    text: "¿Cuál es el enfriamiento de la habilidad 'Gancho de Agarre' de Widowmaker?",
    options: ["12 segundos", "10 segundos", "15 segundos", "8 segundos"],
    answerIndex: 0
  },
  {
    id: 282,
    text: "¿Cómo se llama la hija de Ana Amari?",
    options: ["Fareeha Amari (Pharah)", "Amélie", "Sombra", "Efi"],
    answerIndex: 0
  },
  {
    id: 283,
    text: "¿Qué mapa de tipo Híbrido se sitúa en la capital de Inglaterra?",
    options: ["King's Row", "Londres", "Midtown", "Rialto"],
    answerIndex: 0
  },
  {
    id: 284,
    text: "¿Qué arma utiliza Junker Queen como disparo principal?",
    options: ["Escopeta de corredera (Scattergun)", "Rifle de asalto", "Lanzagranadas", "Cañón de chatarra"],
    answerIndex: 0
  },
  {
    id: 285,
    text: "¿Cuál es la habilidad pasiva de Junkrat que suelta granadas al morir?",
    options: ["Caos total (Total Mayhem)", "Último aliento", "Regalo de despedida", "Explosión final"],
    answerIndex: 0
  },

  // --- DÍA 20 (Preguntas 286 - 300) ---
  {
    id: 286,
    text: "¿Quién es el creador del guantelete original de Doomfist según el lore?",
    options: ["La Fundación Adhabayo (el primer Doomfist)", "Industrias Scrapyard", "Talon", "Efi Oladele"],
    answerIndex: 0
  },
  {
    id: 287,
    text: "¿De qué personaje es la línea de voz: 'Justice rains from above!'?",
    options: ["Pharah", "Reinhardt", "Soldier: 76", "Mercy"],
    answerIndex: 0
  },
  {
    id: 288,
    text: "¿Cuál es el nombre del reactor ómnico inactivo situado en el mapa de Busan?",
    options: ["El Omnium del Mar del Este (East Sea Omnium)", "Core Omnium", "Busan Reactor", "MEKA Core"],
    answerIndex: 0
  },
  {
    id: 289,
    text: "¿Cuál es la velocidad máxima de proyectil de la flecha de Hanzo al cargarse por completo?",
    options: ["110 m/s", "80 m/s", "120 m/s", "95 m/s"],
    answerIndex: 0
  },
  {
    id: 290,
    text: "¿Cuál es el nombre de la líder del grupo criminal 'Deadlock Gang' en el que Cassidy solía estar?",
    options: ["Elizabeth Caledonia Ashe", "Junker Queen", "Sombra", "Olivia Colomar"],
    answerIndex: 0
  },
  {
    id: 291,
    text: "¿Qué personaje Support de Overwatch 2 cura disparando ráfagas de 3 proyectiles?",
    options: ["Baptiste", "Juno", "Ana", "Kiriko"],
    answerIndex: 0
  },
  {
    id: 292,
    text: "¿Cuál es el enfriamiento de la habilidad 'Campo de Fuerza' (Deflect) de Genji?",
    options: ["8 segundos", "10 segundos", "12 segundos", "6 segundos"],
    answerIndex: 0
  },
  {
    id: 293,
    text: "¿De qué color es la orbe de discordia de Zenyatta visualmente?",
    options: ["Morado oscuro", "Amarillo", "Rojo", "Verde"],
    answerIndex: 0
  },
  {
    id: 294,
    text: "¿Cuál es el mapa situado en una isla artificial ecológica de lujo en el golfo pérsico?",
    options: ["Oasis", "Ilios", "Dorado", "Paraíso"],
    answerIndex: 0
  },
  {
    id: 295,
    text: "¿Qué personaje Damage puede crear un clon de hielo criogénico para bloquear pasillos?",
    options: ["Mei", "Symmetra", "Torbjörn", "Bastion"],
    answerIndex: 0
  },
  {
    id: 296,
    text: "¿Cuál de estos personajes formó parte de la primera generación de agentes fundadores de Overwatch?",
    options: ["Ana Amari", "Cole Cassidy", "Genji Shimada", "Winston"],
    answerIndex: 0
  },
  {
    id: 297,
    text: "¿De qué personaje es la voz en inglés que dice 'Die, Die, Die!'?",
    options: ["Keith Ferguson (Reaper)", "Fred Tatasciore", "Matthew Mercer", "Crispin Freeman"],
    answerIndex: 0
  },
  {
    id: 298,
    text: "¿Cuál es la salud máxima del escudo de Reinhardt en Overwatch 2 actualmente?",
    options: ["1600 PS", "1200 PS", "1400 PS", "2000 PS"],
    answerIndex: 0
  },
  {
    id: 299,
    text: "¿Cuál es la nacionalidad del personaje Sigma?",
    options: ["Neerlandesa (Países Bajos)", "Alemana", "Belga", "Austriaca"],
    answerIndex: 0
  },
  {
    id: 300,
    text: "¿Qué ómnico espiritual fue asesinado por Widowmaker en el cortometraje 'Alive'?",
    options: ["Tekhartha Mondatta", "Zenyatta", "Ramattra", "Maximilian"],
    answerIndex: 0
  },

  // --- DÍA 21 (Preguntas 301 - 315) ---
  {
    id: 301,
    text: "¿Qué mapa transcurre en la base secreta de la organización terrorista Talon?",
    options: ["Rialto (Venecia / Base de operaciones)", "Circuit Royal", "esperança", "Dorado"],
    answerIndex: 0
  },
  {
    id: 302,
    text: "¿Cuál es el enfriamiento de la habilidad 'Vuelo' de D.Va?",
    options: ["4 segundos", "5 segundos", "3 segundos", "6 segundos"],
    answerIndex: 0
  },
  {
    id: 303,
    text: "¿Cuál es el verdadero nombre de Soldier: 76?",
    options: ["Jack Morrison", "Gabriel Reyes", "John Mac", "Cole Cassidy"],
    answerIndex: 0
  },
  {
    id: 304,
    text: "¿Qué personaje ómnico rebelde tiene la habilidad definitiva 'Aniquilación'?",
    options: ["Ramattra", "Bastion", "Zenyatta", "Orisa"],
    answerIndex: 0
  },
  {
    id: 305,
    text: "¿Cuál es el arma principal de Symmetra?",
    options: ["Proyector de Fotones", "Pistola Endotérmica", "Lanzador de Riel", "Disparador de plasma"],
    answerIndex: 0
  },
  {
    id: 306,
    text: "¿Cuál es el daño base del Golpe de Gracia (Quick Melee) en Overwatch 2 para héroes normales?",
    options: ["30 puntos de daño", "40 puntos de daño", "25 puntos de daño", "35 puntos de daño"],
    answerIndex: 0
  },
  {
    id: 307,
    text: "¿Cómo se llama el hámster genéticamente modificado de Overwatch?",
    options: ["Hammond (Wrecking Ball)", "Winston", "Snowball", "Pepe"],
    answerIndex: 0
  },
  {
    id: 308,
    text: "¿Qué mapa de escolta de Overwatch 2 transcurre en el circuito de carreras de Mónaco?",
    options: ["Circuit Royal", "Rialto", "Coliseo", "Paraíso"],
    answerIndex: 0
  },
  {
    id: 309,
    text: "¿Cuál es el enfriamiento de la habilidad 'Traslación' (Translocator) de Sombra en Overwatch 2?",
    options: ["6 segundos", "5 segundos", "7 segundos", "8 segundos"],
    answerIndex: 1
  },
  {
    id: 310,
    text: "¿Cuál de los siguientes personajes tiene una salud base compuesta al 100% de escudos?",
    options: ["Zenyatta (Tiene 50 de vida y 150 de escudo, no 100% escudo)", "Symmetra", "Sigma", "Ninguno de los anteriores"],
    answerIndex: 3
  },
  {
    id: 311,
    text: "¿Qué tipo de proyectiles dispara el arma principal de Zenyatta?",
    options: ["Orbes de energía destructiva", "Kunais", "Estrellas ninja", "Balas bióticas"],
    answerIndex: 0
  },
  {
    id: 312,
    text: "¿Cuál es el nombre de la inteligencia artificial de control de carga en King's Row?",
    options: ["No tiene nombre oficial de IA individual, es un dispositivo PEM", "Athena", "Anubis", "Juno"],
    answerIndex: 0
  },
  {
    id: 313,
    text: "¿Cuál es la nacionalidad de Brigitte Lindholm?",
    options: ["Sueca", "Alemana", "Noruega", "Suiza"],
    answerIndex: 0
  },
  {
    id: 314,
    text: "¿Qué habilidad de Baptiste le permite saltar extremadamente alto acumulando energía?",
    options: ["Exobotas (Exo Boots)", "Salto de Propulsión", "Impulso Biótico", "Botas cohete"],
    answerIndex: 0
  },
  {
    id: 315,
    text: "¿Cuál es la definitiva de Illari?",
    options: ["Sol Cautivo (Captive Sun)", "Sol Naciente", "Explosión Solar", "Luz de la Justicia"],
    answerIndex: 0
  },

  // --- DÍA 22 (Preguntas 316 - 330) ---
  {
    id: 316,
    text: "¿De qué personaje es la frase de definitiva: 'Cease your resistance!'?",
    options: ["Orisa", "Sigma", "Symmetra", "Zarya"],
    answerIndex: 0
  },
  {
    id: 317,
    text: "¿Cuál es la velocidad de recarga del cargador de Tracer en segundos?",
    options: ["1.15 segundos", "1 segundo", "1.5 segundos", "1.25 segundos"],
    answerIndex: 0
  },
  {
    id: 318,
    text: "¿Qué personaje Damage de Overwatch utiliza una escopeta de perdigones doble?",
    options: ["Reaper (Segador)", "Torbjörn", "Roadhog (Es tanque)", "Ashe"],
    answerIndex: 0
  },
  {
    id: 319,
    text: "¿Cuál es el enfriamiento de la habilidad 'Barrera Defensiva' de Zarya (Autoburbuja)?",
    options: ["10 segundos", "11 segundos", "12 segundos", "9 segundos"],
    answerIndex: 0
  },
  {
    id: 320,
    text: "¿Qué mapa transcurre en la costa mediterránea de Francia y es un castillo familiar?",
    options: ["Château Guillard", "Paris", "Rialto", "Circuit Royal"],
    answerIndex: 0
  },
  {
    id: 321,
    text: "¿Cuál es el verdadero nombre de la heroína conocida como Widowmaker?",
    options: ["Amélie Lacroix", "Olivia Colomar", "Satya Vaswani", "Fareeha Amari"],
    answerIndex: 0
  },
  {
    id: 322,
    text: "¿Qué Support tiene una habilidad definitiva que cura en un gran árbol de luz?",
    options: ["Lifeweaver (Árbol de la Vida)", "Zenyatta", "Lúcio", "Moira"],
    answerIndex: 0
  },
  {
    id: 323,
    text: "¿Cuál es el enfriamiento de la habilidad 'Regresión' (Recall) de Tracer?",
    options: ["12 segundos", "13 segundos", "15 segundos", "10 segundos"],
    answerIndex: 1
  },
  {
    id: 324,
    text: "¿Qué mapa de control de Overwatch transcurre en el centro de Grecia?",
    options: ["Ilios", "Atenas", "Oasis", "Nepal"],
    answerIndex: 0
  },
  {
    id: 325,
    text: "¿Cuál es la nacionalidad de Reinhardt Wilhelm?",
    options: ["Alemana", "Austriaca", "Suiza", "Belga"],
    answerIndex: 0
  },
  {
    id: 326,
    text: "¿Cuál es el enfriamiento de la habilidad 'Dardo Sedante' de Ana en Overwatch 2?",
    options: ["14 segundos", "15 segundos", "12 segundos", "16 segundos"],
    answerIndex: 0
  },
  {
    id: 327,
    text: "¿Qué ómnico rebelde fue creado por Mina Liao como el pináculo del diseño robótico adaptativo?",
    options: ["Echo", "Bastion", "Orisa", "Ramattra"],
    answerIndex: 0
  },
  {
    id: 328,
    text: "¿Qué mapa transcurre en un templo de las montañas nevadas de Nepal?",
    options: ["Santuario de Nepal", "Ecopunto: Antártida", "Hanamura", "Gibraltar"],
    answerIndex: 0
  },
  {
    id: 329,
    text: "¿Cuál es la duración máxima de la definitiva 'Visor Táctico' de Soldier: 76?",
    options: ["6 segundos", "5 segundos", "7 segundos", "8 segundos"],
    answerIndex: 0
  },
  {
    id: 330,
    text: "¿Qué personaje Tank es capaz de lanzar una roca gigante con la habilidad 'Acreción'?",
    options: ["Sigma", "Doomfist", "Winston", "Roadhog"],
    answerIndex: 0
  },

  // --- DÍA 23 (Preguntas 331 - 345) ---
  {
    id: 331,
    text: "¿Cuál es el enfriamiento base de la habilidad 'Campo Biótico' (Biotic Field) de Soldier: 76?",
    options: ["15 segundos", "18 segundos", "12 segundos", "20 segundos"],
    answerIndex: 0
  },
  {
    id: 332,
    text: "¿Cómo se llama la inteligencia artificial del dron de Mei?",
    options: ["Snowball", "Ganímedes", "Pepe", "Bob"],
    answerIndex: 0
  },
  {
    id: 333,
    text: "¿De qué personaje es la frase de definitiva: '¡Fuego en el hoyo!' (Fire in the hole!)?",
    options: ["Junkrat", "Torbjörn", "Ashe", "Bastion"],
    answerIndex: 0
  },
  {
    id: 334,
    text: "¿Cuál es la cantidad de curación por segundo que otorga la habilidad definitiva 'Trascendencia' de Zenyatta?",
    options: ["300 PS/s", "200 PS/s", "250 PS/s", "400 PS/s"],
    answerIndex: 0
  },
  {
    id: 335,
    text: "¿Qué mapa de escolta transcurre en una chatarrería del desierto australiano?",
    options: ["Junkertown", "Ruta 66", "Dorado", "Rialto"],
    answerIndex: 0
  },
  {
    id: 336,
    text: "¿De qué personaje es el arma principal: 'Remachadora' (Rivet Gun)?",
    options: ["Torbjörn", "D.Va", "Winston", "Brigitte"],
    answerIndex: 0
  },
  {
    id: 337,
    text: "¿Cuál es la salud máxima del escudo protector 'Barrera Cinética' de Sigma en su lanzamiento base de OW2?",
    options: ["700 PS", "600 PS", "800 PS", "500 PS"],
    answerIndex: 0
  },
  {
    id: 338,
    text: "¿Cuál es la nacionalidad de Genji y Hanzo Shimada?",
    options: ["Japonesa", "China", "Coreana", "Taiwanesa"],
    answerIndex: 0
  },
  {
    id: 339,
    text: "¿Qué habilidad permite a Sojourn deslizarse a alta velocidad y luego dar un gran salto?",
    options: ["Deslizarse (Power Slide)", "Impulso de Salto", "Traslación", "Propulsión"],
    answerIndex: 0
  },
  {
    id: 340,
    text: "¿Cuál es la definitiva de D.Va?",
    options: ["Autodestrucción (Self-Destruct)", "Llamar Meca", "Matriz de defensa", "Cañón de fusión"],
    answerIndex: 0
  },
  {
    id: 341,
    text: "¿Qué mapa híbrido de Overwatch transcurre en la capital de Alemania y cuenta con un gran castillo medieval?",
    options: ["Eichenwalde", "Essen", "Gotemburgo", "King's Row"],
    answerIndex: 0
  },
  {
    id: 342,
    text: "¿Cuál es el enfriamiento de la habilidad 'Plataforma de Pétalos' de Lifeweaver?",
    options: ["12 segundos", "10 segundos", "8 segundos", "14 segundos"],
    answerIndex: 0
  },
  {
    id: 343,
    text: "¿Cuál es el multiplicador de daño por disparo a la cabeza (Headshot) que tiene Widowmaker en su mira telescópica cargada?",
    options: ["2.5x", "2.0x", "1.5x", "3.0x"],
    answerIndex: 0
  },
  {
    id: 344,
    text: "¿Qué personaje tiene la pasiva 'Paso de la Sombra' (Shadow Step)?",
    options: ["Reaper (Es una habilidad activa, no pasiva, pero se asocia a su kit)", "Sombra", "Genji", "Ninguno de los anteriores (Es habilidad activa de Reaper)"],
    answerIndex: 3
  },
  {
    id: 345,
    text: "¿Cuál es el nombre del gorila modificado genéticamente que lideró a Overwatch en su llamada a la acción en OW2?",
    options: ["Winston", "Hammond", "Simon", "Dr. Harold"],
    answerIndex: 0
  },

  // --- DÍA 24 (Preguntas 346 - 360) ---
  {
    id: 346,
    text: "¿Cuál es el enfriamiento de la habilidad 'Lanza de Javalina' de Orisa en Overwatch 2?",
    options: ["6 segundos", "8 segundos", "7 segundos", "5 segundos"],
    answerIndex: 0
  },
  {
    id: 347,
    text: "¿De qué personaje es la frase de definitiva: '¡Ojo con mi definitiva!' (en inglés: 'Propaganda is useless!')?",
    options: ["Sombra (EMP)", "Symmetra", "Widowmaker", "Zarya"],
    answerIndex: 0
  },
  {
    id: 348,
    text: "¿Cuál es la nacionalidad de la heroína conocida como Kiriko?",
    options: ["Japonesa", "China", "Coreana", "Vietnamita"],
    answerIndex: 0
  },
  {
    id: 349,
    text: "¿Qué mapa transcurre en la capital científica del desierto de Arabia Saudí?",
    options: ["Oasis", "Dorado", "Ilios", "Rialto"],
    answerIndex: 0
  },
  {
    id: 350,
    text: "¿Cuál es el enfriamiento base de la habilidad 'Barrera Cinética' (Kinetic Barrier) de Sigma?",
    options: ["No tiene enfriamiento fijo (se puede retirar y desplegar con 2s de recarga)", "12 segundos", "8 segundos", "10 segundos"],
    answerIndex: 0
  },
  {
    id: 351,
    text: "¿Qué personaje Damage tiene la habilidad definitiva 'Ventisca' (Blizzard)?",
    options: ["Mei", "Genji", "Tracer", "Junkrat"],
    answerIndex: 0
  },
  {
    id: 352,
    text: "¿Cuál es el verdadero nombre del personaje conocido como Wrecking Ball?",
    options: ["Hammond", "Winston", "Sven", "Pepe"],
    answerIndex: 0
  },
  {
    id: 353,
    text: "¿Qué mapa transcurre en la ciudad natal y base de operaciones del personaje Lúcio?",
    options: ["Paraíso (Río de Janeiro)", "Esperança", "Dorado", "Rialto"],
    answerIndex: 0
  },
  {
    id: 354,
    text: "¿Cuál es el enfriamiento de la habilidad 'Suzu de Protección' de Kiriko?",
    options: ["15 segundos", "14 segundos", "12 segundos", "16 segundos"],
    answerIndex: 0
  },
  {
    id: 355,
    text: "¿De qué personaje es la frase de definitiva: '¡La justicia llueve del cielo!'?",
    options: ["Pharah", "Soldier: 76", "Ana", "Mercy"],
    answerIndex: 0
  },
  {
    id: 356,
    text: "¿Cuál es la salud máxima del meca de D.Va en Overwatch 2?",
    options: ["650 PS (350 vida + 300 armadura)", "600 PS", "700 PS", "550 PS"],
    answerIndex: 0
  },
  {
    id: 357,
    text: "¿Qué personaje Support utiliza un rifle llamado 'Disparador Solar' que cura de forma pasiva?",
    options: ["Illari (Su torreta cura pasivamente, ella dispara curación de corto alcance)", "Juno", "Kiriko", "Moira"],
    answerIndex: 0
  },
  {
    id: 358,
    text: "¿Cuál es el enfriamiento de la habilidad 'Grito de Batalla' de Junker Queen?",
    options: ["14 segundos", "15 segundos", "12 segundos", "16 segundos"],
    answerIndex: 0
  },
  {
    id: 359,
    text: "¿Cómo se llama la nave insignia y base de operaciones móvil de Overwatch?",
    options: ["El Hyperion (No, es de Starcraft)", "El Orca", "El Atlas", "El Titán"],
    answerIndex: 1
  },
  {
    id: 360,
    text: "¿Cuál es la nacionalidad de la heroína espacial Juno?",
    options: ["Marciana / Estadounidense (Nacida en el Proyecto Hermes en Marte)", "Coreana", "Japonesa", "China"],
    answerIndex: 0
  },

  // --- DÍA 25 (Preguntas 361 - 375) ---
  {
    id: 361,
    text: "¿Cuál es el enfriamiento de la habilidad 'Lanza de Javalina' de Orisa en su última actualización de OW2?",
    options: ["6 segundos", "8 segundos", "7 segundos", "5 segundos"],
    answerIndex: 0
  },
  {
    id: 362,
    text: "¿Qué personaje Support tiene la habilidad pasiva de flotar lentamente en el aire planeando?",
    options: ["Mercy (Descenso angélico)", "Zenyatta", "Lúcio", "Kiriko"],
    answerIndex: 0
  },
  {
    id: 363,
    text: "¿Cuál es el enfriamiento de la habilidad 'Gancho de Agarre' de Wrecking Ball (Hammond)?",
    options: ["5 segundos", "6 segundos", "4 segundos", "7 segundos"],
    answerIndex: 0
  },
  {
    id: 364,
    text: "¿Qué mapa transcurre en la capital de Portugal en Overwatch 2?",
    options: ["Esperança", "Coliseo", "Rialto", "Paraíso"],
    answerIndex: 0
  },
  {
    id: 365,
    text: "¿Cuál es el enfriamiento de la habilidad 'Dardo Sedante' de Ana en un personaje Tanque?",
    options: ["El dardo tiene el mismo enfriamiento (14s), pero el efecto dura menos (3s en lugar de 5s)", "El dardo no afecta a los tanques", "16 segundos", "18 segundos"],
    answerIndex: 0
  },
  {
    id: 366,
    text: "¿Qué personaje Damage es capaz de colocar una torreta que dispara ráfagas de lava?",
    options: ["Torbjörn (Su definitiva es Núcleo de Lava, no su torreta)", "Symmetra", "Bastion", "Ninguno de los anteriores"],
    answerIndex: 3
  },
  {
    id: 367,
    text: "¿Cuál es el verdadero nombre de la heroína conocida como Tracer?",
    options: ["Lena Oxton", "Olivia Colomar", "Amélie Lacroix", "Fareeha Amari"],
    answerIndex: 0
  },
  {
    id: 368,
    text: "¿Qué mapa de Overwatch transcurre en un castillo familiar cerca del mar en Francia?",
    options: ["Château Guillard", "Paris", "Rialto", "Esperança"],
    answerIndex: 0
  },
  {
    id: 369,
    text: "¿Cuál es el enfriamiento de la habilidad 'Traslación' (Blink) de Tracer?",
    options: ["3 segundos por carga", "4 segundos", "5 segundos", "2 segundos"],
    answerIndex: 0
  },
  {
    id: 370,
    text: "¿Qué personaje Support tiene una habilidad pasiva llamada 'Inspirar'?",
    options: ["Brigitte", "Lucio", "Mercy", "Zenyatta"],
    answerIndex: 0
  },
  {
    id: 371,
    text: "¿Cuál es la nacionalidad de la heroína conocida como Junker Queen?",
    options: ["Australiana", "Neozelandesa", "Sudafricana", "Fiyiano"],
    answerIndex: 0
  },
  {
    id: 372,
    text: "¿Cuál es el enfriamiento de la habilidad 'Campo de Inmortalidad' de Baptiste?",
    options: ["25 segundos", "30 segundos", "18 segundos", "22 segundos"],
    answerIndex: 0
  },
  {
    id: 373,
    text: "¿Cómo se llama el hermano mayor de Genji Shimada?",
    options: ["Hanzo Shimada", "Zenyatta", "Sojourn", "Cole Cassidy"],
    answerIndex: 0
  },
  {
    id: 374,
    text: "¿Cuál es la pasiva única de Zenyatta en combate cuerpo a cuerpo?",
    options: ["Patada rápida (aumenta el empuje y daño en 50%)", "Meditación", "Flotar silencioso", "Orbe de protección"],
    answerIndex: 0
  },
  {
    id: 375,
    text: "¿Cuál es el enfriamiento base en segundos de la habilidad Regeneración Biótica de Moira?",
    options: ["No tiene enfriamiento (se recarga infligiendo daño con el haz biótico morado)", "6 segundos", "8 segundos", "10 segundos"],
    answerIndex: 0
  },

  // --- DÍA 26 (Preguntas 376 - 390) ---
  {
    id: 376,
    text: "¿Qué héroe posee la pasiva 'Línea de Visión' para revivir aliados caídos con Mercy?",
    options: ["No es una pasiva, Mercy debe estar en rango de 5 metros de la marca de muerte", "Reinhardt", "Lucio", "Zenyatta"],
    answerIndex: 0
  },
  {
    id: 377,
    text: "¿Cuál es la velocidad máxima que puede alcanzar Wrecking Ball con el cable de agarre cargado al máximo?",
    options: ["22 m/s (Velocidad de embestida)", "18 m/s", "25 m/s", "15 m/s"],
    answerIndex: 0
  },
  {
    id: 378,
    text: "¿Cuál es el nombre del compuesto químico que produce la niebla de congelación de Mei?",
    options: ["Super refrigerante endotérmico criogénico", "Nitrógeno líquido puro", "Helio inestable", "Gas freón purificado"],
    answerIndex: 0
  },
  {
    id: 379,
    text: "¿Cuál de las siguientes habilidades activas de Genji se restablece inmediatamente al conseguir una eliminación?",
    options: ["Corte Veloz (Swift Strike)", "Desvío (Deflect)", "Doble Salto", "Ninguna de las anteriores"],
    answerIndex: 0
  },
  {
    id: 380,
    text: "¿Qué mapa transcurre en una lujosa propiedad costera en la costa de Mónaco en Overwatch 2?",
    options: ["Circuit Royal", "Rialto", "esperança", "Coliseo"],
    answerIndex: 0
  },
  {
    id: 381,
    text: "¿Cuál es el cooldown en segundos de la habilidad 'Disparo de Disrupción' de Sojourn?",
    options: ["15 segundos", "12 segundos", "10 segundos", "18 segundos"],
    answerIndex: 0
  },
  {
    id: 382,
    text: "¿Qué Support tiene la pasiva 'Planear' usando propulsores en sus botas?",
    options: ["Juno (Planeo dinámico / Botas propulsoras)", "Mercy", "Pharah", "Lúcio"],
    answerIndex: 0
  },
  {
    id: 383,
    text: "¿Cuál es el cooldown base de la habilidad 'Campo de Inmortalidad' de Baptiste?",
    options: ["25 segundos", "30 segundos", "20 segundos", "15 segundos"],
    answerIndex: 0
  },
  {
    id: 384,
    text: "¿Qué mapa de control de Overwatch transcurre en la base científica de China?",
    options: ["Torre Lijiang", "Busan", "Nepal", "Gibraltar"],
    answerIndex: 0
  },
  {
    id: 385,
    text: "¿Cuál es la nacionalidad de la heroína Zarya?",
    options: ["Rusa", "Siberiana (Rusia)", "Ucraniana", "Polaca"],
    answerIndex: 1
  },
  {
    id: 386,
    text: "¿Cuál es el cooldown de la habilidad 'Plataforma de Pétalo' de Lifeweaver en su lanzamiento de OW2?",
    options: ["12 segundos", "10 segundos", "8 segundos", "15 segundos"],
    answerIndex: 0
  },
  {
    id: 387,
    text: "¿Qué personaje Damage tiene la habilidad definitiva 'Núcleo de Lava'?",
    options: ["Torbjörn", "Bastion", "Mei", "Junkrat"],
    answerIndex: 0
  },
  {
    id: 388,
    text: "¿Qué mapa transcurre en un hermoso templo antiguo rodeado de cerezos en flor en Japón?",
    options: ["Hanamura", "Kanezaka", "Santuario Shambali", "Busan"],
    answerIndex: 0
  },
  {
    id: 389,
    text: "¿Cuál es la duración máxima de la definitiva 'Aniquilación' de Ramattra si hay enemigos cerca?",
    options: ["Ilimitada (Mientras inflija daño continuo a enemigos en Overwatch 2 originalmente, luego limitada a 20s)", "20 segundos", "15 segundos", "10 segundos"],
    answerIndex: 0
  },
  {
    id: 390,
    text: "¿Qué personaje Tank utiliza dos escopetas automáticas integradas en sus brazos?",
    options: ["Mauga (Cañones de cadena dobles 'Gunny' y 'Cha-Cha')", "D.Va", "Winston", "Doomfist"],
    answerIndex: 0
  },

  // --- DÍA 27 (Preguntas 391 - 405) ---
  {
    id: 391,
    text: "¿Cuál es el nombre del reactor ómnico inactivo situado en el mapa de Busan?",
    options: ["El Omnium del Mar del Este (East Sea Omnium)", "Core Omnium", "Busan Reactor", "MEKA Core"],
    answerIndex: 0
  },
  {
    id: 392,
    text: "¿Qué mapa de avance de Overwatch 2 transcurre en las calles del centro de Roma, Italia?",
    options: ["Coliseo", "Rialto", "Venecia", "Esperança"],
    answerIndex: 0
  },
  {
    id: 393,
    text: "¿Cómo se llama el rifle francotirador modificado de Ana Amari?",
    options: ["Rifle Biótico", "Rifle de Precisión Horus", "Rifle del Ojo de Horus", "Cañón Médico de Riel"],
    answerIndex: 0
  },
  {
    id: 394,
    text: "¿Qué organización ómnica terrorista atacó Londres (King's Row) en el lore clásico?",
    options: ["Null Sector", "Talon", "Crisis Ómnica", "Guerilla de Chatarra"],
    answerIndex: 0
  },
  {
    id: 395,
    text: "¿Cuál es el valor máximo de escudos (Shields) regenerables que tiene Symmetra por defecto?",
    options: ["125 escudos", "100 escudos", "150 escudos", "75 escudos"],
    answerIndex: 0
  },
  {
    id: 396,
    text: "¿Cuál es el enfriamiento de la habilidad Gancho (Chain Hook) de Roadhog en Overwatch 2?",
    options: ["6 segundos", "8 segundos", "7 segundos", "9 segundos"],
    answerIndex: 1
  },
  {
    id: 397,
    text: "¿Cómo se llama la inteligencia artificial secundaria del mapa Observatorio: Gibraltar?",
    options: ["Athena", "Juno", "Anubis", "Orisa"],
    answerIndex: 0
  },
  {
    id: 398,
    text: "¿De qué color es el rayo de amplificación de daño del Bastón Caduceo de Mercy?",
    options: ["Azul", "Amarillo", "Verde", "Morado"],
    answerIndex: 0
  },
  {
    id: 399,
    text: "¿Cuál es la pasiva del rol de Tanque en Overwatch 2?",
    options: ["Reducción de empuje recibido y menor generación de definitiva al recibir daño", "Inmunidad parcial a aturdimientos", "Regeneración de vida al no recibir daño", "Mayor velocidad de recarga"],
    answerIndex: 0
  },
  {
    id: 400,
    text: "¿Quién es el actor de doblaje original en inglés que da voz a Soldier: 76?",
    options: ["Fred Tatasciore", "Keith Ferguson", "Matthew Mercer", "Crispin Freeman"],
    answerIndex: 0
  },
  {
    id: 401,
    text: "¿Qué héroe tiene una habilidad pasiva llamada 'Segador de almas' (The Reaping)?",
    options: ["Reaper", "Junker Queen", "Roadhog", "Sigma"],
    answerIndex: 0
  },
  {
    id: 402,
    text: "¿Qué personaje ómnico de Overwatch es un experto en hackeo táctico y pertenece a Talon?",
    options: ["Sombra (Es humana, no ómnica)", "Maximilian", "Ramattra", "Ninguno de los anteriores"],
    answerIndex: 3
  },
  {
    id: 403,
    text: "¿De qué personaje es la frase de definitiva: '¡Apagando las luces!'?",
    options: ["Sombra", "Widowmaker", "Illari", "Juno"],
    answerIndex: 0
  },
  {
    id: 404,
    text: "¿Qué héroe de Overwatch se crió en los suburbios de Río de Janeiro?",
    options: ["Lúcio Correia dos Santos", "Baptiste", "Sombra", "Illari"],
    answerIndex: 0
  },
  {
    id: 405,
    text: "¿Cómo se llama el primer cómic oficial digital publicado por Blizzard para Overwatch?",
    options: ["Train Hopper (Cassidy)", "Dragon Slayer", "Going Legit", "Recall"],
    answerIndex: 0
  },

  // --- DÍA 28 (Preguntas 406 - 420) ---
  {
    id: 406,
    text: "¿Qué personaje del lore diseñó los visores tácticos que usa Soldier: 76?",
    options: ["Torvald Lindholm", "Angela Ziegler", "Mina Liao", "Helix Securities"],
    answerIndex: 0
  },
  {
    id: 407,
    text: "¿Cuál es el enfriamiento de la habilidad 'Autodestrucción' de D.Va tras llamar a un nuevo meca?",
    options: ["No tiene enfriamiento por tiempo (se carga con daño e impactos)", "45 segundos", "60 segundos", "30 segundos"],
    answerIndex: 0
  },
  {
    id: 408,
    text: "¿Cómo se llama la científica creadora de la tecnología de regeneración celular de Mercy?",
    options: ["Dra. Angela Ziegler (Ella misma)", "Dra. Mina Liao", "Dra. Moira O'Deorain", "Dra. Katya Volskaya"],
    answerIndex: 0
  },
  {
    id: 409,
    text: "¿De qué organización criminal de la ruta 66 formaba parte Ashe?",
    options: ["Banda Deadlock", "Los Junkers", "Talon", "Los Hashimoto"],
    answerIndex: 0
  },
  {
    id: 410,
    text: "¿Cuál es el daño máximo que realiza el disparo cargado principal de Illari a la cabeza?",
    options: ["112.5 puntos de daño (con multiplicador 1.5x)", "150 puntos de daño", "120 puntos de daño", "135 puntos de daño"],
    answerIndex: 0
  },
  {
    id: 411,
    text: "¿Qué personaje ómnico fundó el grupo terrorista Null Sector?",
    options: ["Ramattra", "Zenyatta", "Mondatta", "Maximilian"],
    answerIndex: 0
  },
  {
    id: 412,
    text: "¿Cuál de los siguientes mapas de Overwatch fue retirado por completo del modo competitivo estándar en Overwatch 2?",
    options: ["Hanamura (Mapa 2CP)", "Ruta 66", "Observatorio: Gibraltar", "Eichenwalde"],
    answerIndex: 0
  },
  {
    id: 413,
    text: "¿Qué personaje Support posee la habilidad pasiva de trepar paredes (Wall Climb) similar a Genji y Hanzo?",
    options: ["Kiriko", "Baptiste", "Lifeweaver", "Lúcio (Tiene Wall Ride, no Wall Climb)"],
    answerIndex: 0
  },
  {
    id: 414,
    text: "¿Cuál es el nombre del mineral altamente inestable que causó el accidente orbital de Sigma?",
    options: ["No fue un mineral, fue un experimento de contención de un agujero negro", "Uranio modificado", "Ómnium-3", "Luz sólida refractada"],
    answerIndex: 0
  },
  {
    id: 415,
    text: "¿Qué mapa transcurre en la azotea y rascacielos de una metrópolis futurista coreana?",
    options: ["Busan: Centro", "Busan: MEKA Base", "Torre Lijiang", "Seúl: Cielo"],
    answerIndex: 1
  },
  {
    id: 416,
    text: "¿Qué porcentaje de velocidad de movimiento otorga la habilidad 'Deslizarse' (Slide) de Sojourn?",
    options: ["No tiene un porcentaje fijo, es un impulso de distancia constante rápido", "30%", "50%", "70%"],
    answerIndex: 0
  },
  {
    id: 417,
    text: "¿Cuál es el apodo del ómnico escolta del payload en el mapa de Hollywood?",
    options: ["Hal-Fred Glitchbot", "Maximilian", "Sven", "Bob"],
    answerIndex: 0
  },
  {
    id: 418,
    text: "¿Cuál es el daño base del Martillo a Reacción de Reinhardt por golpe en Overwatch 2?",
    options: ["85 puntos de daño", "100 puntos de daño", "75 puntos de daño", "90 puntos de daño"],
    answerIndex: 0
  },
  {
    id: 419,
    text: "¿Qué personaje Support tiene un arma llamada 'Disparador Solar'?",
    options: ["Illari", "Juno", "Kiriko", "Moira"],
    answerIndex: 0
  },
  {
    id: 420,
    text: "¿Cuál es el nombre del cortometraje animado de Overwatch centrado en el despertar de Bastion?",
    options: ["The Last Bastion", "Recall", "Honor and Glory", "Rise and Shine"],
    answerIndex: 0
  },

  // --- DÍA 29 (Preguntas 421 - 435) ---
  {
    id: 421,
    text: "¿De qué país procede Roadhog según su biografía oficial del lore?",
    options: ["Australia", "Nueva Zelanda", "Sudáfrica", "Desconocido"],
    answerIndex: 0
  },
  {
    id: 422,
    text: "¿Cuál es el nombre de la mascota de Winston en su cubículo de la Base Lunar Horizon?",
    options: ["No tenía mascota (tenía un peluche y plátanos/mantequilla de cacahuete)", "Snowball", "Ganímedes", "Pepe"],
    answerIndex: 0
  },
  {
    id: 423,
    text: "¿Cuál es la definitiva de Cassidy?",
    options: ["Sin correlates (Deadeye)", "High Noon", "Bala de Plata", "Tiro Rápido"],
    answerIndex: 0
  },
  {
    id: 424,
    text: "¿Cómo se llama la corporación multinacional que controla el suministro de energía en Dorado, México?",
    options: ["LumeriCo", "Vishkar", "Talon", "Industrias Volskaya"],
    answerIndex: 0
  },
  {
    id: 425,
    text: "¿Cuál es la duración base de la habilidad definitiva de Mercy, Valquiria?",
    options: ["15 segundos", "20 segundos", "12 segundos", "18 segundos"],
    answerIndex: 0
  },
  {
    id: 426,
    text: "¿Qué héroe tiene una habilidad pasiva llamada 'Inspirar' (Inspire)?",
    options: ["Brigitte", "Lucio", "Mercy", "Zenyatta"],
    answerIndex: 0
  },
  {
    id: 427,
    text: "¿Cuál es la salud total de Wrecking Ball (Hammond) en partidas de rol de Tanque (con escudo base)?",
    options: ["700 PS (550 vida + 150 armadura)", "650 PS", "800 PS", "750 PS"],
    answerIndex: 0
  },
  {
    id: 428,
    text: "¿De qué color es la barrera de energía protectora de Winston?",
    options: ["Azul claro", "Rojo", "Verde", "Amarillo"],
    answerIndex: 0
  },
  {
    id: 429,
    text: "¿Qué personaje ómnico de Overwatch fue diseñado originalmente como un robot de minería?",
    options: ["Orisa (derivada del OR15 de defensa, que a su vez deriva del OR14 de combate)", "Bastion", "Zenyatta", "Ramattra"],
    answerIndex: 3
  },
  {
    id: 430,
    text: "¿Cuál es la nacionalidad de Moira O'Deorain?",
    options: ["Irlandesa", "Escocesa", "Inglesa", "Galesa"],
    answerIndex: 0
  },
  {
    id: 431,
    text: "¿Cuál es el enfriamiento de la habilidad 'Gancho de Agarre' de Widowmaker?",
    options: ["12 segundos", "10 segundos", "15 segundos", "8 segundos"],
    answerIndex: 0
  },
  {
    id: 432,
    text: "¿Cómo se llama la hija de Ana Amari?",
    options: ["Fareeha Amari (Pharah)", "Amélie", "Sombra", "Efi"],
    answerIndex: 0
  },
  {
    id: 433,
    text: "¿Qué mapa de tipo Híbrido se sitúa en la capital de Inglaterra?",
    options: ["King's Row", "Londres", "Midtown", "Rialto"],
    answerIndex: 0
  },
  {
    id: 434,
    text: "¿Qué arma utiliza Junker Queen como disparo principal?",
    options: ["Escopeta de corredera (Scattergun)", "Rifle de asalto", "Lanzagranadas", "Cañón de chatarra"],
    answerIndex: 0
  },
  {
    id: 435,
    text: "¿Cuál es la habilidad pasiva de Junkrat que suelta granadas al morir?",
    options: ["Caos total (Total Mayhem)", "Último aliento", "Regalo de despedida", "Explosión final"],
    answerIndex: 0
  },

  // --- DÍA 30 (Preguntas 436 - 450) ---
  {
    id: 436,
    text: "¿Quién es el creador del guantelete original de Doomfist según el lore?",
    options: ["La Fundación Adhabayo (el primer Doomfist)", "Industrias Scrapyard", "Talon", "Efi Oladele"],
    answerIndex: 0
  },
  {
    id: 437,
    text: "¿De qué personaje es la línea de voz: 'Justice rains from above!'?",
    options: ["Pharah", "Reinhardt", "Soldier: 76", "Mercy"],
    answerIndex: 0
  },
  {
    id: 438,
    text: "¿Cuál es el nombre del reactor ómnico inactivo situado en el mapa de Busan?",
    options: ["El Omnium del Mar del Este (East Sea Omnium)", "Core Omnium", "Busan Reactor", "MEKA Core"],
    answerIndex: 0
  },
  {
    id: 439,
    text: "¿Cuál es la velocidad máxima de proyectil de la flecha de Hanzo al cargarse por completo?",
    options: ["110 m/s", "80 m/s", "120 m/s", "95 m/s"],
    answerIndex: 0
  },
  {
    id: 440,
    text: "¿Cuál es el nombre de la líder del grupo criminal 'Deadlock Gang' en el que Cassidy solía estar?",
    options: ["Elizabeth Caledonia Ashe", "Junker Queen", "Sombra", "Olivia Colomar"],
    answerIndex: 0
  },
  {
    id: 441,
    text: "¿Qué personaje Support de Overwatch 2 cura disparando ráfagas de 3 proyectiles?",
    options: ["Baptiste", "Juno", "Ana", "Kiriko"],
    answerIndex: 0
  },
  {
    id: 442,
    text: "¿Cuál es el enfriamiento de la habilidad 'Campo de Fuerza' (Deflect) de Genji?",
    options: ["8 segundos", "10 segundos", "12 segundos", "6 segundos"],
    answerIndex: 0
  },
  {
    id: 443,
    text: "¿De qué color es la orbe de discordia de Zenyatta visualmente?",
    options: ["Morado oscuro", "Amarillo", "Rojo", "Verde"],
    answerIndex: 0
  },
  {
    id: 444,
    text: "¿Cuál es el mapa situado en una isla artificial ecológica de lujo en el golfo pérsico?",
    options: ["Oasis", "Ilios", "Dorado", "Paraíso"],
    answerIndex: 0
  },
  {
    id: 445,
    text: "¿Qué personaje Damage puede crear un clon de hielo criogénico para bloquear pasillos?",
    options: ["Mei", "Symmetra", "Torbjörn", "Bastion"],
    answerIndex: 0
  },
  {
    id: 446,
    text: "¿Cuál de estos personajes formó parte de la primera generación de agentes fundadores de Overwatch?",
    options: ["Ana Amari", "Cole Cassidy", "Genji Shimada", "Winston"],
    answerIndex: 0
  },
  {
    id: 447,
    text: "¿De qué personaje es la voz en inglés que dice 'Die, Die, Die!'?",
    options: ["Keith Ferguson (Reaper)", "Fred Tatasciore", "Matthew Mercer", "Crispin Freeman"],
    answerIndex: 0
  },
  {
    id: 448,
    text: "¿Cuál es la salud máxima del escudo de Reinhardt en Overwatch 2 actualmente?",
    options: ["1600 PS", "1200 PS", "1400 PS", "2000 PS"],
    answerIndex: 0
  },
  {
    id: 449,
    text: "¿Cuál es la nacionalidad del personaje Sigma?",
    options: ["Neerlandesa (Países Bajos)", "Alemana", "Belga", "Austriaca"],
    answerIndex: 0
  },
  {
    id: 450,
    text: "¿Qué ómnico espiritual fue asesinado por Widowmaker en el cortometraje 'Alive'?",
    options: ["Tekhartha Mondatta", "Zenyatta", "Ramattra", "Maximilian"],
    answerIndex: 0
  }
];
