export interface PokemonQuestion {
  id: number;
  pokemonImage: string;
  options: string[];
  answerIndex: number;
}

// 450 Pokemon questions. Divided into 30 blocks of 15 questions.
// Daily quiz will cycle through these blocks so Pokemon do not repeat for 30 days.
export const POKEMON_QUESTIONS: PokemonQuestion[] = [
  {
    "id": 1,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/311.png",
    "options": [
      "Plusle",
      "Glalie",
      "Minior-red-meteor",
      "Skiddo"
    ],
    "answerIndex": 0
  },
  {
    "id": 2,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/948.png",
    "options": [
      "Toedscool",
      "Blacephalon",
      "Pinsir",
      "Wingull"
    ],
    "answerIndex": 0
  },
  {
    "id": 3,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/995.png",
    "options": [
      "Copperajah",
      "Cinderace",
      "Dragalge",
      "Iron-thorns"
    ],
    "answerIndex": 3
  },
  {
    "id": 4,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/309.png",
    "options": [
      "Chingling",
      "Whimsicott",
      "Electrike",
      "Skwovet"
    ],
    "answerIndex": 2
  },
  {
    "id": 5,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/41.png",
    "options": [
      "Rayquaza",
      "Toxapex",
      "Teddiursa",
      "Zubat"
    ],
    "answerIndex": 3
  },
  {
    "id": 6,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/589.png",
    "options": [
      "Iron-crown",
      "Escavalier",
      "Iron-valiant",
      "Inkay"
    ],
    "answerIndex": 1
  },
  {
    "id": 7,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/611.png",
    "options": [
      "Axew",
      "Shaymin-land",
      "Charmander",
      "Fraxure"
    ],
    "answerIndex": 3
  },
  {
    "id": 8,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/879.png",
    "options": [
      "Xurkitree",
      "Munna",
      "Copperajah",
      "Ariados"
    ],
    "answerIndex": 2
  },
  {
    "id": 9,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/537.png",
    "options": [
      "Wingull",
      "Munkidori",
      "Seismitoad",
      "Iron-treads"
    ],
    "answerIndex": 2
  },
  {
    "id": 10,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/560.png",
    "options": [
      "Scrafty",
      "Scizor",
      "Sinistcha",
      "Cosmoem"
    ],
    "answerIndex": 0
  },
  {
    "id": 11,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/885.png",
    "options": [
      "Gothita",
      "Celebi",
      "Dreepy",
      "Necrozma"
    ],
    "answerIndex": 2
  },
  {
    "id": 12,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/863.png",
    "options": [
      "Perrserker",
      "Eevee",
      "Togedemaru",
      "Sneasel"
    ],
    "answerIndex": 0
  },
  {
    "id": 13,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/630.png",
    "options": [
      "Cherubi",
      "Zoroark",
      "Raboot",
      "Mandibuzz"
    ],
    "answerIndex": 3
  },
  {
    "id": 14,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/713.png",
    "options": [
      "Dustox",
      "Eiscue-ice",
      "Avalugg",
      "Froslass"
    ],
    "answerIndex": 2
  },
  {
    "id": 15,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/106.png",
    "options": [
      "Hitmonlee",
      "Polteageist",
      "Dracovish",
      "Tapu-koko"
    ],
    "answerIndex": 0
  },
  {
    "id": 16,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1007.png",
    "options": [
      "Croconaw",
      "Toxapex",
      "Glimmora",
      "Koraidon"
    ],
    "answerIndex": 3
  },
  {
    "id": 17,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/579.png",
    "options": [
      "Exeggutor",
      "Orthworm",
      "Reuniclus",
      "Raichu"
    ],
    "answerIndex": 2
  },
  {
    "id": 18,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/669.png",
    "options": [
      "Tarountula",
      "Tauros",
      "Flabebe",
      "Stunfisk"
    ],
    "answerIndex": 2
  },
  {
    "id": 19,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/272.png",
    "options": [
      "Ludicolo",
      "Delphox",
      "Spoink",
      "Magcargo"
    ],
    "answerIndex": 0
  },
  {
    "id": 20,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/169.png",
    "options": [
      "Blacephalon",
      "Toxel",
      "Crobat",
      "Revavroom"
    ],
    "answerIndex": 2
  },
  {
    "id": 21,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/502.png",
    "options": [
      "Dewott",
      "Alomomola",
      "Seviper",
      "Spinda"
    ],
    "answerIndex": 0
  },
  {
    "id": 22,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/581.png",
    "options": [
      "Squawkabilly-green-plumage",
      "Heracross",
      "Swanna",
      "Bombirdier"
    ],
    "answerIndex": 2
  },
  {
    "id": 23,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
    "options": [
      "Obstagoon",
      "Hoothoot",
      "Muk",
      "Charmander"
    ],
    "answerIndex": 3
  },
  {
    "id": 24,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/899.png",
    "options": [
      "Raticate",
      "Wyrdeer",
      "Floette",
      "Sinistea"
    ],
    "answerIndex": 1
  },
  {
    "id": 25,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/531.png",
    "options": [
      "Gyarados",
      "Noivern",
      "Mienshao",
      "Audino"
    ],
    "answerIndex": 3
  },
  {
    "id": 26,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/784.png",
    "options": [
      "Skwovet",
      "Sandy-shocks",
      "Kommo-o",
      "Hoopa"
    ],
    "answerIndex": 2
  },
  {
    "id": 27,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/573.png",
    "options": [
      "Charjabug",
      "Metapod",
      "Swoobat",
      "Cinccino"
    ],
    "answerIndex": 3
  },
  {
    "id": 28,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/631.png",
    "options": [
      "Sneasler",
      "Heatmor",
      "Ekans",
      "Grapploct"
    ],
    "answerIndex": 1
  },
  {
    "id": 29,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/850.png",
    "options": [
      "Wormadam-plant",
      "Drakloak",
      "Sizzlipede",
      "Gothitelle"
    ],
    "answerIndex": 2
  },
  {
    "id": 30,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/411.png",
    "options": [
      "Uxie",
      "Slowpoke",
      "Shedinja",
      "Bastiodon"
    ],
    "answerIndex": 3
  },
  {
    "id": 31,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/877.png",
    "options": [
      "Morpeko-full-belly",
      "Drowzee",
      "Glimmora",
      "Fezandipiti"
    ],
    "answerIndex": 0
  },
  {
    "id": 32,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/127.png",
    "options": [
      "Electrode",
      "Koraidon",
      "Pinsir",
      "Scizor"
    ],
    "answerIndex": 2
  },
  {
    "id": 33,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/48.png",
    "options": [
      "Noivern",
      "Brambleghast",
      "Venonat",
      "Tapu-koko"
    ],
    "answerIndex": 2
  },
  {
    "id": 34,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/727.png",
    "options": [
      "Probopass",
      "Furret",
      "Incineroar",
      "Haunter"
    ],
    "answerIndex": 2
  },
  {
    "id": 35,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/356.png",
    "options": [
      "Dusclops",
      "Luxio",
      "Sudowoodo",
      "Medicham"
    ],
    "answerIndex": 0
  },
  {
    "id": 36,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/931.png",
    "options": [
      "Sinistea",
      "Lucario",
      "Celebi",
      "Squawkabilly-green-plumage"
    ],
    "answerIndex": 3
  },
  {
    "id": 37,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1010.png",
    "options": [
      "Shellder",
      "Iron-leaves",
      "Shedinja",
      "Gossifleur"
    ],
    "answerIndex": 1
  },
  {
    "id": 38,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1002.png",
    "options": [
      "Cherubi",
      "Chien-pao",
      "Primeape",
      "Sandshrew"
    ],
    "answerIndex": 1
  },
  {
    "id": 39,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/978.png",
    "options": [
      "Dusknoir",
      "Tatsugiri-curly",
      "Plusle",
      "Slowbro"
    ],
    "answerIndex": 1
  },
  {
    "id": 40,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/373.png",
    "options": [
      "Spidops",
      "Eldegoss",
      "Furret",
      "Salamence"
    ],
    "answerIndex": 3
  },
  {
    "id": 41,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/66.png",
    "options": [
      "Machop",
      "Magnezone",
      "Braixen",
      "Incineroar"
    ],
    "answerIndex": 0
  },
  {
    "id": 42,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/124.png",
    "options": [
      "Noctowl",
      "Aggron",
      "Jynx",
      "Sableye"
    ],
    "answerIndex": 2
  },
  {
    "id": 43,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/379.png",
    "options": [
      "Registeel",
      "Barraskewda",
      "Scizor",
      "Type-null"
    ],
    "answerIndex": 0
  },
  {
    "id": 44,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/104.png",
    "options": [
      "Mudbray",
      "Shuckle",
      "Wingull",
      "Cubone"
    ],
    "answerIndex": 3
  },
  {
    "id": 45,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/749.png",
    "options": [
      "Dhelmise",
      "Mudbray",
      "Purrloin",
      "Mothim"
    ],
    "answerIndex": 1
  },
  {
    "id": 46,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/868.png",
    "options": [
      "Heatran",
      "Buzzwole",
      "Copperajah",
      "Milcery"
    ],
    "answerIndex": 3
  },
  {
    "id": 47,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/682.png",
    "options": [
      "Orthworm",
      "Spritzee",
      "Terapagos",
      "Sobble"
    ],
    "answerIndex": 1
  },
  {
    "id": 48,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/818.png",
    "options": [
      "Bronzong",
      "Trubbish",
      "Snom",
      "Inteleon"
    ],
    "answerIndex": 3
  },
  {
    "id": 49,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/790.png",
    "options": [
      "Rookidee",
      "Okidogi",
      "Wugtrio",
      "Cosmoem"
    ],
    "answerIndex": 3
  },
  {
    "id": 50,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/542.png",
    "options": [
      "Palafin-zero",
      "Houndstone",
      "Leavanny",
      "Bastiodon"
    ],
    "answerIndex": 2
  },
  {
    "id": 51,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/967.png",
    "options": [
      "Flutter-mane",
      "Tornadus-incarnate",
      "Cyclizar",
      "Magmar"
    ],
    "answerIndex": 2
  },
  {
    "id": 52,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/348.png",
    "options": [
      "Armaldo",
      "Surskit",
      "Espathra",
      "Zarude"
    ],
    "answerIndex": 0
  },
  {
    "id": 53,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/441.png",
    "options": [
      "Electabuzz",
      "Ogerpon",
      "Arboliva",
      "Chatot"
    ],
    "answerIndex": 3
  },
  {
    "id": 54,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/404.png",
    "options": [
      "Flaaffy",
      "Luxio",
      "Totodile",
      "Zarude"
    ],
    "answerIndex": 1
  },
  {
    "id": 55,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/167.png",
    "options": [
      "Phantump",
      "Braviary",
      "Spinarak",
      "Tapu-koko"
    ],
    "answerIndex": 2
  },
  {
    "id": 56,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/539.png",
    "options": [
      "Grubbin",
      "Bisharp",
      "Eiscue-ice",
      "Sawk"
    ],
    "answerIndex": 3
  },
  {
    "id": 57,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/466.png",
    "options": [
      "Electivire",
      "Sandy-shocks",
      "Yamask",
      "Luxray"
    ],
    "answerIndex": 0
  },
  {
    "id": 58,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/405.png",
    "options": [
      "Sceptile",
      "Meganium",
      "Mimikyu-disguised",
      "Luxray"
    ],
    "answerIndex": 3
  },
  {
    "id": 59,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/273.png",
    "options": [
      "Fuecoco",
      "Pelipper",
      "Sizzlipede",
      "Seedot"
    ],
    "answerIndex": 3
  },
  {
    "id": 60,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/751.png",
    "options": [
      "Sandshrew",
      "Relicanth",
      "Purrloin",
      "Dewpider"
    ],
    "answerIndex": 3
  },
  {
    "id": 61,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1004.png",
    "options": [
      "Mudsdale",
      "Chi-yu",
      "Delibird",
      "Meowth"
    ],
    "answerIndex": 1
  },
  {
    "id": 62,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/644.png",
    "options": [
      "Durant",
      "Purugly",
      "Boldore",
      "Zekrom"
    ],
    "answerIndex": 3
  },
  {
    "id": 63,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/393.png",
    "options": [
      "Slakoth",
      "Piplup",
      "Drednaw",
      "Poipole"
    ],
    "answerIndex": 1
  },
  {
    "id": 64,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/543.png",
    "options": [
      "Drapion",
      "Venipede",
      "Lechonk",
      "Bruxish"
    ],
    "answerIndex": 1
  },
  {
    "id": 65,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/914.png",
    "options": [
      "Mareep",
      "Lanturn",
      "Quaquaval",
      "Fuecoco"
    ],
    "answerIndex": 2
  },
  {
    "id": 66,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/63.png",
    "options": [
      "Abra",
      "Lampent",
      "Blastoise",
      "Thwackey"
    ],
    "answerIndex": 0
  },
  {
    "id": 67,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/737.png",
    "options": [
      "Primeape",
      "Rapidash",
      "Copperajah",
      "Charjabug"
    ],
    "answerIndex": 3
  },
  {
    "id": 68,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/475.png",
    "options": [
      "Vanillite",
      "Yveltal",
      "Gallade",
      "Morpeko-full-belly"
    ],
    "answerIndex": 2
  },
  {
    "id": 69,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/945.png",
    "options": [
      "Toxicroak",
      "Grafaiai",
      "Golbat",
      "Ralts"
    ],
    "answerIndex": 1
  },
  {
    "id": 70,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/214.png",
    "options": [
      "Heracross",
      "Chatot",
      "Mr-mime",
      "Centiskorch"
    ],
    "answerIndex": 0
  },
  {
    "id": 71,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/162.png",
    "options": [
      "Beldum",
      "Steelix",
      "Escavalier",
      "Furret"
    ],
    "answerIndex": 3
  },
  {
    "id": 72,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/358.png",
    "options": [
      "Corphish",
      "Chimecho",
      "Thundurus-incarnate",
      "Woobat"
    ],
    "answerIndex": 1
  },
  {
    "id": 73,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/230.png",
    "options": [
      "Kingdra",
      "Hatenna",
      "Whiscash",
      "Spewpa"
    ],
    "answerIndex": 0
  },
  {
    "id": 74,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/852.png",
    "options": [
      "Dusclops",
      "Kyogre",
      "Golurk",
      "Clobbopus"
    ],
    "answerIndex": 3
  },
  {
    "id": 75,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/785.png",
    "options": [
      "Gothorita",
      "Cacturne",
      "Tapu-koko",
      "Pyukumuku"
    ],
    "answerIndex": 2
  },
  {
    "id": 76,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/704.png",
    "options": [
      "Goomy",
      "Kadabra",
      "Meditite",
      "Armaldo"
    ],
    "answerIndex": 0
  },
  {
    "id": 77,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/525.png",
    "options": [
      "Boldore",
      "Phanpy",
      "Reshiram",
      "Vigoroth"
    ],
    "answerIndex": 0
  },
  {
    "id": 78,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/771.png",
    "options": [
      "Magby",
      "Pyukumuku",
      "Skitty",
      "Gastrodon"
    ],
    "answerIndex": 1
  },
  {
    "id": 79,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/277.png",
    "options": [
      "Munna",
      "Lilligant",
      "Swellow",
      "Ferrothorn"
    ],
    "answerIndex": 2
  },
  {
    "id": 80,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/129.png",
    "options": [
      "Kadabra",
      "Magikarp",
      "Drampa",
      "Camerupt"
    ],
    "answerIndex": 1
  },
  {
    "id": 81,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/894.png",
    "options": [
      "Glimmet",
      "Regieleki",
      "Skuntank",
      "Jangmo-o"
    ],
    "answerIndex": 1
  },
  {
    "id": 82,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/717.png",
    "options": [
      "Frigibax",
      "Yveltal",
      "Cofagrigus",
      "Masquerain"
    ],
    "answerIndex": 1
  },
  {
    "id": 83,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/844.png",
    "options": [
      "Simisage",
      "Ludicolo",
      "Sandaconda",
      "Toxel"
    ],
    "answerIndex": 2
  },
  {
    "id": 84,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/426.png",
    "options": [
      "Drifblim",
      "Wormadam-plant",
      "Vulpix",
      "Mothim"
    ],
    "answerIndex": 0
  },
  {
    "id": 85,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/346.png",
    "options": [
      "Mantyke",
      "Sableye",
      "Cradily",
      "Yveltal"
    ],
    "answerIndex": 2
  },
  {
    "id": 86,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/735.png",
    "options": [
      "Drilbur",
      "Elekid",
      "Gumshoos",
      "Nymble"
    ],
    "answerIndex": 2
  },
  {
    "id": 87,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/353.png",
    "options": [
      "Banette",
      "Pangoro",
      "Shuppet",
      "Hydrapple"
    ],
    "answerIndex": 2
  },
  {
    "id": 88,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/937.png",
    "options": [
      "Eternatus",
      "Ceruledge",
      "Mabosstiff",
      "Veluza"
    ],
    "answerIndex": 1
  },
  {
    "id": 89,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/369.png",
    "options": [
      "Dragonair",
      "Darmanitan-standard",
      "Houndour",
      "Relicanth"
    ],
    "answerIndex": 3
  },
  {
    "id": 90,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/662.png",
    "options": [
      "Garchomp",
      "Brute-bonnet",
      "Seismitoad",
      "Fletchinder"
    ],
    "answerIndex": 3
  },
  {
    "id": 91,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/471.png",
    "options": [
      "Glaceon",
      "Trevenant",
      "Delcatty",
      "Oinkologne-male"
    ],
    "answerIndex": 0
  },
  {
    "id": 92,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/817.png",
    "options": [
      "Drizzile",
      "Jirachi",
      "Growlithe",
      "Feraligatr"
    ],
    "answerIndex": 0
  },
  {
    "id": 93,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/614.png",
    "options": [
      "Eldegoss",
      "Noibat",
      "Beartic",
      "Mewtwo"
    ],
    "answerIndex": 2
  },
  {
    "id": 94,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/260.png",
    "options": [
      "Mew",
      "Spectrier",
      "Swampert",
      "Chansey"
    ],
    "answerIndex": 2
  },
  {
    "id": 95,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/507.png",
    "options": [
      "Fomantis",
      "Herdier",
      "Liepard",
      "Articuno"
    ],
    "answerIndex": 1
  },
  {
    "id": 96,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/190.png",
    "options": [
      "Azurill",
      "Litten",
      "Aipom",
      "Jangmo-o"
    ],
    "answerIndex": 2
  },
  {
    "id": 97,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/558.png",
    "options": [
      "Piloswine",
      "Duskull",
      "Dudunsparce-two-segment",
      "Crustle"
    ],
    "answerIndex": 3
  },
  {
    "id": 98,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/112.png",
    "options": [
      "Flareon",
      "Hatenna",
      "Rhydon",
      "Sinistcha"
    ],
    "answerIndex": 2
  },
  {
    "id": 99,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/220.png",
    "options": [
      "Exeggutor",
      "Tatsugiri-curly",
      "Swinub",
      "Slither-wing"
    ],
    "answerIndex": 2
  },
  {
    "id": 100,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png",
    "options": [
      "Venusaur",
      "Capsakid",
      "Spinarak",
      "Basculegion-male"
    ],
    "answerIndex": 0
  },
  {
    "id": 101,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/566.png",
    "options": [
      "Houndour",
      "Archen",
      "Conkeldurr",
      "Kingler"
    ],
    "answerIndex": 1
  },
  {
    "id": 102,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/114.png",
    "options": [
      "Woobat",
      "Servine",
      "Tangela",
      "Falinks"
    ],
    "answerIndex": 2
  },
  {
    "id": 103,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/779.png",
    "options": [
      "Cottonee",
      "Bruxish",
      "Flittle",
      "Ariados"
    ],
    "answerIndex": 1
  },
  {
    "id": 104,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/401.png",
    "options": [
      "Emolga",
      "Zubat",
      "Kricketot",
      "Throh"
    ],
    "answerIndex": 2
  },
  {
    "id": 105,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/74.png",
    "options": [
      "Geodude",
      "Litten",
      "Araquanid",
      "Rockruff"
    ],
    "answerIndex": 0
  },
  {
    "id": 106,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/668.png",
    "options": [
      "Great-tusk",
      "Pyroar-male",
      "Excadrill",
      "Stantler"
    ],
    "answerIndex": 1
  },
  {
    "id": 107,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/746.png",
    "options": [
      "Shiinotic",
      "Fletchinder",
      "Wingull",
      "Wishiwashi-solo"
    ],
    "answerIndex": 3
  },
  {
    "id": 108,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/431.png",
    "options": [
      "Slugma",
      "Pawmot",
      "Reuniclus",
      "Glameow"
    ],
    "answerIndex": 3
  },
  {
    "id": 109,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/394.png",
    "options": [
      "Swadloon",
      "Mismagius",
      "Infernape",
      "Prinplup"
    ],
    "answerIndex": 3
  },
  {
    "id": 110,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/845.png",
    "options": [
      "Scolipede",
      "Frogadier",
      "Cramorant",
      "Sawsbuck"
    ],
    "answerIndex": 2
  },
  {
    "id": 111,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1014.png",
    "options": [
      "Dreepy",
      "Hatterene",
      "Okidogi",
      "Nidoqueen"
    ],
    "answerIndex": 2
  },
  {
    "id": 112,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/416.png",
    "options": [
      "Persian",
      "Trumbeak",
      "Donphan",
      "Vespiquen"
    ],
    "answerIndex": 3
  },
  {
    "id": 113,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/636.png",
    "options": [
      "Larvesta",
      "Doduo",
      "Ferrothorn",
      "Eldegoss"
    ],
    "answerIndex": 0
  },
  {
    "id": 114,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/724.png",
    "options": [
      "Golbat",
      "Decidueye",
      "Seviper",
      "Centiskorch"
    ],
    "answerIndex": 1
  },
  {
    "id": 115,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/607.png",
    "options": [
      "Metang",
      "Litwick",
      "Wurmple",
      "Swellow"
    ],
    "answerIndex": 1
  },
  {
    "id": 116,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/642.png",
    "options": [
      "Arctibax",
      "Thundurus-incarnate",
      "Brute-bonnet",
      "Clauncher"
    ],
    "answerIndex": 1
  },
  {
    "id": 117,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/470.png",
    "options": [
      "Iron-moth",
      "Leafeon",
      "Swellow",
      "Slaking"
    ],
    "answerIndex": 1
  },
  {
    "id": 118,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/917.png",
    "options": [
      "Tarountula",
      "Marshtomp",
      "Marill",
      "Froslass"
    ],
    "answerIndex": 0
  },
  {
    "id": 119,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/154.png",
    "options": [
      "Iron-crown",
      "Grubbin",
      "Meganium",
      "Zapdos"
    ],
    "answerIndex": 2
  },
  {
    "id": 120,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/422.png",
    "options": [
      "Sewaddle",
      "Archaludon",
      "Gliscor",
      "Shellos"
    ],
    "answerIndex": 3
  },
  {
    "id": 121,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/476.png",
    "options": [
      "Probopass",
      "Grovyle",
      "Parasect",
      "Absol"
    ],
    "answerIndex": 0
  },
  {
    "id": 122,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/626.png",
    "options": [
      "Vespiquen",
      "Raboot",
      "Bouffalant",
      "Igglybuff"
    ],
    "answerIndex": 2
  },
  {
    "id": 123,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/641.png",
    "options": [
      "Kirlia",
      "Dratini",
      "Tornadus-incarnate",
      "Genesect"
    ],
    "answerIndex": 2
  },
  {
    "id": 124,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/780.png",
    "options": [
      "Spritzee",
      "Ampharos",
      "Lechonk",
      "Drampa"
    ],
    "answerIndex": 3
  },
  {
    "id": 125,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png",
    "options": [
      "Lycanroc-midday",
      "Talonflame",
      "Kakuna",
      "Jigglypuff"
    ],
    "answerIndex": 3
  },
  {
    "id": 126,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/218.png",
    "options": [
      "Smoliv",
      "Slugma",
      "Golbat",
      "Calyrex"
    ],
    "answerIndex": 1
  },
  {
    "id": 127,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/512.png",
    "options": [
      "Dreepy",
      "Shelgon",
      "Simisage",
      "Carnivine"
    ],
    "answerIndex": 2
  },
  {
    "id": 128,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/564.png",
    "options": [
      "Camerupt",
      "Dragapult",
      "Fennekin",
      "Tirtouga"
    ],
    "answerIndex": 3
  },
  {
    "id": 129,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/419.png",
    "options": [
      "Klefki",
      "Pidgeot",
      "Floatzel",
      "Yanma"
    ],
    "answerIndex": 2
  },
  {
    "id": 130,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/14.png",
    "options": [
      "Kakuna",
      "Floragato",
      "Mabosstiff",
      "Torracat"
    ],
    "answerIndex": 0
  },
  {
    "id": 131,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/548.png",
    "options": [
      "Spritzee",
      "Magmortar",
      "Greavard",
      "Petilil"
    ],
    "answerIndex": 3
  },
  {
    "id": 132,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png",
    "options": [
      "Mewtwo",
      "Cloyster",
      "Tinkaton",
      "Omanyte"
    ],
    "answerIndex": 0
  },
  {
    "id": 133,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/705.png",
    "options": [
      "Gastly",
      "Skorupi",
      "Sliggoo",
      "Beheeyem"
    ],
    "answerIndex": 2
  },
  {
    "id": 134,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/757.png",
    "options": [
      "Voltorb",
      "Wormadam-plant",
      "Mr-mime",
      "Salandit"
    ],
    "answerIndex": 3
  },
  {
    "id": 135,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1021.png",
    "options": [
      "Farfetchd",
      "Raging-bolt",
      "Iron-bundle",
      "Stantler"
    ],
    "answerIndex": 1
  },
  {
    "id": 136,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/217.png",
    "options": [
      "Archaludon",
      "Sobble",
      "Ursaring",
      "Whismur"
    ],
    "answerIndex": 2
  },
  {
    "id": 137,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/339.png",
    "options": [
      "Barboach",
      "Staraptor",
      "Loudred",
      "Golbat"
    ],
    "answerIndex": 0
  },
  {
    "id": 138,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/440.png",
    "options": [
      "Happiny",
      "Raticate",
      "Dondozo",
      "Pupitar"
    ],
    "answerIndex": 0
  },
  {
    "id": 139,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/761.png",
    "options": [
      "Bounsweet",
      "Fennekin",
      "Doduo",
      "Pangoro"
    ],
    "answerIndex": 0
  },
  {
    "id": 140,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/833.png",
    "options": [
      "Kangaskhan",
      "Magikarp",
      "Vulpix",
      "Chewtle"
    ],
    "answerIndex": 3
  },
  {
    "id": 141,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/317.png",
    "options": [
      "Swalot",
      "Beautifly",
      "Marshtomp",
      "Capsakid"
    ],
    "answerIndex": 0
  },
  {
    "id": 142,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/206.png",
    "options": [
      "Larvitar",
      "Clobbopus",
      "Dunsparce",
      "Simisear"
    ],
    "answerIndex": 2
  },
  {
    "id": 143,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/874.png",
    "options": [
      "Tinkaton",
      "Rabsca",
      "Stonjourner",
      "Cetitan"
    ],
    "answerIndex": 2
  },
  {
    "id": 144,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/304.png",
    "options": [
      "Tarountula",
      "Gogoat",
      "Arrokuda",
      "Aron"
    ],
    "answerIndex": 3
  },
  {
    "id": 145,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/350.png",
    "options": [
      "Mime-jr",
      "Combusken",
      "Milotic",
      "Solrock"
    ],
    "answerIndex": 2
  },
  {
    "id": 146,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/873.png",
    "options": [
      "Luvdisc",
      "Wooloo",
      "Nymble",
      "Frosmoth"
    ],
    "answerIndex": 3
  },
  {
    "id": 147,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/841.png",
    "options": [
      "Darumaka",
      "Flapple",
      "Shellos",
      "Hitmonlee"
    ],
    "answerIndex": 1
  },
  {
    "id": 148,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/325.png",
    "options": [
      "Spoink",
      "Spearow",
      "Honedge",
      "Maschiff"
    ],
    "answerIndex": 0
  },
  {
    "id": 149,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/935.png",
    "options": [
      "Charcadet",
      "Sewaddle",
      "Whimsicott",
      "Panpour"
    ],
    "answerIndex": 0
  },
  {
    "id": 150,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/893.png",
    "options": [
      "Stunky",
      "Pangoro",
      "Gengar",
      "Zarude"
    ],
    "answerIndex": 3
  },
  {
    "id": 151,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/541.png",
    "options": [
      "Snover",
      "Dragalge",
      "Exeggutor",
      "Swadloon"
    ],
    "answerIndex": 3
  },
  {
    "id": 152,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/182.png",
    "options": [
      "Chinchou",
      "Cradily",
      "Beautifly",
      "Bellossom"
    ],
    "answerIndex": 3
  },
  {
    "id": 153,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/910.png",
    "options": [
      "Magneton",
      "Skeledirge",
      "Crocalor",
      "Omastar"
    ],
    "answerIndex": 2
  },
  {
    "id": 154,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/830.png",
    "options": [
      "Dugtrio",
      "Ferrothorn",
      "Eldegoss",
      "Pawmot"
    ],
    "answerIndex": 2
  },
  {
    "id": 155,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/126.png",
    "options": [
      "Noibat",
      "Farfetchd",
      "Torracat",
      "Magmar"
    ],
    "answerIndex": 3
  },
  {
    "id": 156,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/13.png",
    "options": [
      "Sewaddle",
      "Weedle",
      "Klawf",
      "Camerupt"
    ],
    "answerIndex": 1
  },
  {
    "id": 157,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/463.png",
    "options": [
      "Lickilicky",
      "Tarountula",
      "Zoroark",
      "Charjabug"
    ],
    "answerIndex": 0
  },
  {
    "id": 158,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/60.png",
    "options": [
      "Hoppip",
      "Smoochum",
      "Tentacool",
      "Poliwag"
    ],
    "answerIndex": 3
  },
  {
    "id": 159,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/774.png",
    "options": [
      "Minior-red-meteor",
      "Aerodactyl",
      "Charizard",
      "Stakataka"
    ],
    "answerIndex": 0
  },
  {
    "id": 160,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/134.png",
    "options": [
      "Brute-bonnet",
      "Regidrago",
      "Wailord",
      "Vaporeon"
    ],
    "answerIndex": 3
  },
  {
    "id": 161,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/488.png",
    "options": [
      "Budew",
      "Litwick",
      "Floatzel",
      "Cresselia"
    ],
    "answerIndex": 3
  },
  {
    "id": 162,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/884.png",
    "options": [
      "Snorunt",
      "Duraludon",
      "Spoink",
      "Staravia"
    ],
    "answerIndex": 1
  },
  {
    "id": 163,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/268.png",
    "options": [
      "Orthworm",
      "Quaxwell",
      "Cascoon",
      "Tsareena"
    ],
    "answerIndex": 2
  },
  {
    "id": 164,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1024.png",
    "options": [
      "Nacli",
      "Terapagos",
      "Dottler",
      "Hypno"
    ],
    "answerIndex": 1
  },
  {
    "id": 165,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/949.png",
    "options": [
      "Froakie",
      "Crawdaunt",
      "Toedscruel",
      "Aromatisse"
    ],
    "answerIndex": 2
  },
  {
    "id": 166,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/594.png",
    "options": [
      "Paras",
      "Iron-leaves",
      "Slakoth",
      "Alomomola"
    ],
    "answerIndex": 3
  },
  {
    "id": 167,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/721.png",
    "options": [
      "Golduck",
      "Greninja",
      "Volcanion",
      "Simisear"
    ],
    "answerIndex": 2
  },
  {
    "id": 168,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/697.png",
    "options": [
      "Gastrodon",
      "Tyrantrum",
      "Cloyster",
      "Registeel"
    ],
    "answerIndex": 1
  },
  {
    "id": 169,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/469.png",
    "options": [
      "Alakazam",
      "Poochyena",
      "Arceus",
      "Yanmega"
    ],
    "answerIndex": 3
  },
  {
    "id": 170,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/322.png",
    "options": [
      "Heatmor",
      "Numel",
      "Mareanie",
      "Manectric"
    ],
    "answerIndex": 1
  },
  {
    "id": 171,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/266.png",
    "options": [
      "Silcoon",
      "Mamoswine",
      "Clamperl",
      "Hippowdon"
    ],
    "answerIndex": 0
  },
  {
    "id": 172,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/263.png",
    "options": [
      "Zigzagoon",
      "Togekiss",
      "Talonflame",
      "Greavard"
    ],
    "answerIndex": 0
  },
  {
    "id": 173,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/153.png",
    "options": [
      "Bayleef",
      "Hydreigon",
      "Klawf",
      "Pumpkaboo-average"
    ],
    "answerIndex": 0
  },
  {
    "id": 174,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/921.png",
    "options": [
      "Gloom",
      "Pawmi",
      "Stonjourner",
      "Flutter-mane"
    ],
    "answerIndex": 1
  },
  {
    "id": 175,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/105.png",
    "options": [
      "Milcery",
      "Type-null",
      "Deerling",
      "Marowak"
    ],
    "answerIndex": 3
  },
  {
    "id": 176,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/997.png",
    "options": [
      "Bruxish",
      "Tirtouga",
      "Necrozma",
      "Arctibax"
    ],
    "answerIndex": 3
  },
  {
    "id": 177,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/102.png",
    "options": [
      "Meganium",
      "Trapinch",
      "Exeggcute",
      "Xurkitree"
    ],
    "answerIndex": 2
  },
  {
    "id": 178,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1003.png",
    "options": [
      "Heatran",
      "Ting-lu",
      "Jirachi",
      "Budew"
    ],
    "answerIndex": 1
  },
  {
    "id": 179,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/175.png",
    "options": [
      "Aipom",
      "Pumpkaboo-average",
      "Ambipom",
      "Togepi"
    ],
    "answerIndex": 3
  },
  {
    "id": 180,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/534.png",
    "options": [
      "Ducklett",
      "Tinkaton",
      "Conkeldurr",
      "Elgyem"
    ],
    "answerIndex": 2
  },
  {
    "id": 181,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/655.png",
    "options": [
      "Delphox",
      "Electrode",
      "Escavalier",
      "Cosmog"
    ],
    "answerIndex": 0
  },
  {
    "id": 182,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/69.png",
    "options": [
      "Bellsprout",
      "Pawmot",
      "Scorbunny",
      "Orbeetle"
    ],
    "answerIndex": 0
  },
  {
    "id": 183,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/172.png",
    "options": [
      "Solgaleo",
      "Drowzee",
      "Pichu",
      "Electrike"
    ],
    "answerIndex": 2
  },
  {
    "id": 184,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/598.png",
    "options": [
      "Chimecho",
      "Cherrim",
      "Ferrothorn",
      "Magneton"
    ],
    "answerIndex": 2
  },
  {
    "id": 185,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/334.png",
    "options": [
      "Tauros",
      "Overqwil",
      "Altaria",
      "Donphan"
    ],
    "answerIndex": 2
  },
  {
    "id": 186,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/702.png",
    "options": [
      "Dedenne",
      "Skarmory",
      "Camerupt",
      "Magmar"
    ],
    "answerIndex": 0
  },
  {
    "id": 187,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/601.png",
    "options": [
      "Cubchoo",
      "Incineroar",
      "Kabutops",
      "Klinklang"
    ],
    "answerIndex": 3
  },
  {
    "id": 188,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/159.png",
    "options": [
      "Phanpy",
      "Croconaw",
      "Alomomola",
      "Lileep"
    ],
    "answerIndex": 1
  },
  {
    "id": 189,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/755.png",
    "options": [
      "Groudon",
      "Floatzel",
      "Morelull",
      "Wugtrio"
    ],
    "answerIndex": 2
  },
  {
    "id": 190,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/928.png",
    "options": [
      "Salamence",
      "Pincurchin",
      "Excadrill",
      "Smoliv"
    ],
    "answerIndex": 3
  },
  {
    "id": 191,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/854.png",
    "options": [
      "Dusknoir",
      "Sinistea",
      "Roaring-moon",
      "Blastoise"
    ],
    "answerIndex": 1
  },
  {
    "id": 192,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/262.png",
    "options": [
      "Toedscool",
      "Mightyena",
      "Gurdurr",
      "Mesprit"
    ],
    "answerIndex": 1
  },
  {
    "id": 193,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/305.png",
    "options": [
      "Cottonee",
      "Munna",
      "Chatot",
      "Lairon"
    ],
    "answerIndex": 3
  },
  {
    "id": 194,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/654.png",
    "options": [
      "Landorus-incarnate",
      "Braixen",
      "Zubat",
      "Grafaiai"
    ],
    "answerIndex": 1
  },
  {
    "id": 195,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/128.png",
    "options": [
      "Regidrago",
      "Tapu-fini",
      "Tauros",
      "Raging-bolt"
    ],
    "answerIndex": 2
  },
  {
    "id": 196,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png",
    "options": [
      "Nickit",
      "Feebas",
      "Togetic",
      "Gyarados"
    ],
    "answerIndex": 3
  },
  {
    "id": 197,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/747.png",
    "options": [
      "Nincada",
      "Baxcalibur",
      "Gyarados",
      "Mareanie"
    ],
    "answerIndex": 3
  },
  {
    "id": 198,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/36.png",
    "options": [
      "Clefable",
      "Crawdaunt",
      "Zygarde-50",
      "Lugia"
    ],
    "answerIndex": 0
  },
  {
    "id": 199,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/834.png",
    "options": [
      "Drednaw",
      "Lugia",
      "Tornadus-incarnate",
      "Machoke"
    ],
    "answerIndex": 0
  },
  {
    "id": 200,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/728.png",
    "options": [
      "Darkrai",
      "Popplio",
      "Marowak",
      "Bronzong"
    ],
    "answerIndex": 1
  },
  {
    "id": 201,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/902.png",
    "options": [
      "Basculegion-male",
      "Gulpin",
      "Zarude",
      "Mantine"
    ],
    "answerIndex": 0
  },
  {
    "id": 202,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/675.png",
    "options": [
      "Politoed",
      "Hakamo-o",
      "Snubbull",
      "Pangoro"
    ],
    "answerIndex": 3
  },
  {
    "id": 203,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/674.png",
    "options": [
      "Pancham",
      "Electrode",
      "Urshifu-single-strike",
      "Starmie"
    ],
    "answerIndex": 0
  },
  {
    "id": 204,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/367.png",
    "options": [
      "Wimpod",
      "Carnivine",
      "Huntail",
      "Tyranitar"
    ],
    "answerIndex": 2
  },
  {
    "id": 205,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/388.png",
    "options": [
      "Grotle",
      "Seel",
      "Omastar",
      "Aurorus"
    ],
    "answerIndex": 0
  },
  {
    "id": 206,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/803.png",
    "options": [
      "Araquanid",
      "Feebas",
      "Poipole",
      "Blaziken"
    ],
    "answerIndex": 2
  },
  {
    "id": 207,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/660.png",
    "options": [
      "Mr-mime",
      "Ambipom",
      "Bruxish",
      "Diggersby"
    ],
    "answerIndex": 3
  },
  {
    "id": 208,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png",
    "options": [
      "Palossand",
      "Greninja",
      "Varoom",
      "Drizzile"
    ],
    "answerIndex": 1
  },
  {
    "id": 209,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/530.png",
    "options": [
      "Excadrill",
      "Aipom",
      "Electivire",
      "Regice"
    ],
    "answerIndex": 0
  },
  {
    "id": 210,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/752.png",
    "options": [
      "Araquanid",
      "Noctowl",
      "Fennekin",
      "Sandaconda"
    ],
    "answerIndex": 0
  },
  {
    "id": 211,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/900.png",
    "options": [
      "Igglybuff",
      "Pyroar-male",
      "Type-null",
      "Kleavor"
    ],
    "answerIndex": 3
  },
  {
    "id": 212,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/836.png",
    "options": [
      "Boltund",
      "Magmar",
      "Copperajah",
      "Cherrim"
    ],
    "answerIndex": 0
  },
  {
    "id": 213,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/80.png",
    "options": [
      "Slowbro",
      "Giratina-altered",
      "Chi-yu",
      "Beartic"
    ],
    "answerIndex": 0
  },
  {
    "id": 214,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/939.png",
    "options": [
      "Frogadier",
      "Golem",
      "Bellibolt",
      "Flygon"
    ],
    "answerIndex": 2
  },
  {
    "id": 215,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/473.png",
    "options": [
      "Mamoswine",
      "Garchomp",
      "Altaria",
      "Sinistea"
    ],
    "answerIndex": 0
  },
  {
    "id": 216,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/522.png",
    "options": [
      "Exeggcute",
      "Hoothoot",
      "Quilladin",
      "Blitzle"
    ],
    "answerIndex": 3
  },
  {
    "id": 217,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/911.png",
    "options": [
      "Skeledirge",
      "Staryu",
      "Zorua",
      "Magearna"
    ],
    "answerIndex": 0
  },
  {
    "id": 218,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/561.png",
    "options": [
      "Sigilyph",
      "Pikipek",
      "Dedenne",
      "Stonjourner"
    ],
    "answerIndex": 0
  },
  {
    "id": 219,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/450.png",
    "options": [
      "Kartana",
      "Machamp",
      "Palkia",
      "Hippowdon"
    ],
    "answerIndex": 3
  },
  {
    "id": 220,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/760.png",
    "options": [
      "Silcoon",
      "Vanillish",
      "Bewear",
      "Miraidon"
    ],
    "answerIndex": 2
  },
  {
    "id": 221,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/867.png",
    "options": [
      "Gourgeist-average",
      "Runerigus",
      "Donphan",
      "Riolu"
    ],
    "answerIndex": 1
  },
  {
    "id": 222,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/685.png",
    "options": [
      "Inteleon",
      "Togetic",
      "Nidorino",
      "Slurpuff"
    ],
    "answerIndex": 3
  },
  {
    "id": 223,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/835.png",
    "options": [
      "Totodile",
      "Yamper",
      "Iron-jugulis",
      "Archaludon"
    ],
    "answerIndex": 1
  },
  {
    "id": 224,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/267.png",
    "options": [
      "Meloetta-aria",
      "Chansey",
      "Palpitoad",
      "Beautifly"
    ],
    "answerIndex": 3
  },
  {
    "id": 225,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/882.png",
    "options": [
      "Enamorus-incarnate",
      "Vivillon",
      "Dracovish",
      "Scorbunny"
    ],
    "answerIndex": 2
  },
  {
    "id": 226,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/861.png",
    "options": [
      "Grimmsnarl",
      "Lanturn",
      "Yveltal",
      "Iron-hands"
    ],
    "answerIndex": 0
  },
  {
    "id": 227,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/726.png",
    "options": [
      "Victini",
      "Palafin-zero",
      "Torracat",
      "Bidoof"
    ],
    "answerIndex": 2
  },
  {
    "id": 228,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1022.png",
    "options": [
      "Tapu-fini",
      "Quilladin",
      "Rufflet",
      "Iron-boulder"
    ],
    "answerIndex": 3
  },
  {
    "id": 229,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/498.png",
    "options": [
      "Bewear",
      "Entei",
      "Pansage",
      "Tepig"
    ],
    "answerIndex": 3
  },
  {
    "id": 230,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/118.png",
    "options": [
      "Hoothoot",
      "Articuno",
      "Goldeen",
      "Guzzlord"
    ],
    "answerIndex": 2
  },
  {
    "id": 231,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/684.png",
    "options": [
      "Dachsbun",
      "Swirlix",
      "Avalugg",
      "Audino"
    ],
    "answerIndex": 1
  },
  {
    "id": 232,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/95.png",
    "options": [
      "Dragalge",
      "Nacli",
      "Onix",
      "Gengar"
    ],
    "answerIndex": 2
  },
  {
    "id": 233,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/563.png",
    "options": [
      "Cofagrigus",
      "Feraligatr",
      "Ducklett",
      "Zoroark"
    ],
    "answerIndex": 0
  },
  {
    "id": 234,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/364.png",
    "options": [
      "Mime-jr",
      "Igglybuff",
      "Swirlix",
      "Sealeo"
    ],
    "answerIndex": 3
  },
  {
    "id": 235,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/247.png",
    "options": [
      "Great-tusk",
      "Pupitar",
      "Aromatisse",
      "Sewaddle"
    ],
    "answerIndex": 1
  },
  {
    "id": 236,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/157.png",
    "options": [
      "Typhlosion",
      "Golurk",
      "Drapion",
      "Froakie"
    ],
    "answerIndex": 0
  },
  {
    "id": 237,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/527.png",
    "options": [
      "Skiddo",
      "Basculin-red-striped",
      "Woobat",
      "Wigglytuff"
    ],
    "answerIndex": 2
  },
  {
    "id": 238,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/693.png",
    "options": [
      "Iron-valiant",
      "Clawitzer",
      "Finizen",
      "Volbeat"
    ],
    "answerIndex": 1
  },
  {
    "id": 239,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/418.png",
    "options": [
      "Kleavor",
      "Kirlia",
      "Mr-rime",
      "Buizel"
    ],
    "answerIndex": 3
  },
  {
    "id": 240,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/282.png",
    "options": [
      "Gardevoir",
      "Fletchinder",
      "Meditite",
      "Oshawott"
    ],
    "answerIndex": 0
  },
  {
    "id": 241,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/838.png",
    "options": [
      "Kangaskhan",
      "Shinx",
      "Carkol",
      "Hypno"
    ],
    "answerIndex": 2
  },
  {
    "id": 242,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/896.png",
    "options": [
      "Gabite",
      "Iron-bundle",
      "Spewpa",
      "Glastrier"
    ],
    "answerIndex": 3
  },
  {
    "id": 243,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/587.png",
    "options": [
      "Torchic",
      "Emolga",
      "Houndoom",
      "Drifloon"
    ],
    "answerIndex": 1
  },
  {
    "id": 244,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/775.png",
    "options": [
      "Crabominable",
      "Komala",
      "Iron-hands",
      "Seel"
    ],
    "answerIndex": 1
  },
  {
    "id": 245,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/799.png",
    "options": [
      "Kingdra",
      "Mr-rime",
      "Squawkabilly-green-plumage",
      "Guzzlord"
    ],
    "answerIndex": 3
  },
  {
    "id": 246,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/335.png",
    "options": [
      "Ribombee",
      "Sunflora",
      "Sinistea",
      "Zangoose"
    ],
    "answerIndex": 3
  },
  {
    "id": 247,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/829.png",
    "options": [
      "Mothim",
      "Gossifleur",
      "Cyclizar",
      "Heatmor"
    ],
    "answerIndex": 1
  },
  {
    "id": 248,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/337.png",
    "options": [
      "Growlithe",
      "Tangrowth",
      "Lunatone",
      "Purrloin"
    ],
    "answerIndex": 2
  },
  {
    "id": 249,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/671.png",
    "options": [
      "Pawmot",
      "Sylveon",
      "Solosis",
      "Florges"
    ],
    "answerIndex": 3
  },
  {
    "id": 250,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/889.png",
    "options": [
      "Zamazenta",
      "Clefairy",
      "Froakie",
      "Kingambit"
    ],
    "answerIndex": 0
  },
  {
    "id": 251,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/853.png",
    "options": [
      "Lotad",
      "Machoke",
      "Grapploct",
      "Hatenna"
    ],
    "answerIndex": 2
  },
  {
    "id": 252,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/116.png",
    "options": [
      "Horsea",
      "Rufflet",
      "Hatenna",
      "Trevenant"
    ],
    "answerIndex": 0
  },
  {
    "id": 253,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/983.png",
    "options": [
      "Kingambit",
      "Wormadam-plant",
      "Frigibax",
      "Beartic"
    ],
    "answerIndex": 0
  },
  {
    "id": 254,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/361.png",
    "options": [
      "Snorunt",
      "Pinsir",
      "Heracross",
      "Grimer"
    ],
    "answerIndex": 0
  },
  {
    "id": 255,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/485.png",
    "options": [
      "Dewott",
      "Heatran",
      "Venomoth",
      "Darumaka"
    ],
    "answerIndex": 1
  },
  {
    "id": 256,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/85.png",
    "options": [
      "Dodrio",
      "Monferno",
      "Qwilfish",
      "Sirfetchd"
    ],
    "answerIndex": 0
  },
  {
    "id": 257,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/819.png",
    "options": [
      "Lickilicky",
      "Skwovet",
      "Arctozolt",
      "Krookodile"
    ],
    "answerIndex": 1
  },
  {
    "id": 258,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/657.png",
    "options": [
      "Frogadier",
      "Dartrix",
      "Kingambit",
      "Froakie"
    ],
    "answerIndex": 0
  },
  {
    "id": 259,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/283.png",
    "options": [
      "Grumpig",
      "Surskit",
      "Raticate",
      "Charcadet"
    ],
    "answerIndex": 1
  },
  {
    "id": 260,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/856.png",
    "options": [
      "Tinkaton",
      "Steenee",
      "Hatenna",
      "Flamigo"
    ],
    "answerIndex": 2
  },
  {
    "id": 261,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/163.png",
    "options": [
      "Hoothoot",
      "Quilladin",
      "Morgrem",
      "Cloyster"
    ],
    "answerIndex": 0
  },
  {
    "id": 262,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/15.png",
    "options": [
      "Lapras",
      "Beedrill",
      "Rampardos",
      "Oddish"
    ],
    "answerIndex": 1
  },
  {
    "id": 263,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png",
    "options": [
      "Mudsdale",
      "Loudred",
      "Meowth",
      "Cleffa"
    ],
    "answerIndex": 2
  },
  {
    "id": 264,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/506.png",
    "options": [
      "Lillipup",
      "Lapras",
      "Glastrier",
      "Roserade"
    ],
    "answerIndex": 0
  },
  {
    "id": 265,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/952.png",
    "options": [
      "Diglett",
      "Spinarak",
      "Mamoswine",
      "Scovillain"
    ],
    "answerIndex": 3
  },
  {
    "id": 266,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/142.png",
    "options": [
      "Clobbopus",
      "Aerodactyl",
      "Sandshrew",
      "Staravia"
    ],
    "answerIndex": 1
  },
  {
    "id": 267,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/297.png",
    "options": [
      "Dragonite",
      "Hariyama",
      "Leafeon",
      "Delibird"
    ],
    "answerIndex": 1
  },
  {
    "id": 268,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/351.png",
    "options": [
      "Aggron",
      "Glaceon",
      "Castform",
      "Wynaut"
    ],
    "answerIndex": 2
  },
  {
    "id": 269,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/398.png",
    "options": [
      "Primarina",
      "Staraptor",
      "Roggenrola",
      "Tornadus-incarnate"
    ],
    "answerIndex": 1
  },
  {
    "id": 270,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/229.png",
    "options": [
      "Houndoom",
      "Gogoat",
      "Staravia",
      "Maushold-family-of-four"
    ],
    "answerIndex": 0
  },
  {
    "id": 271,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/811.png",
    "options": [
      "Archen",
      "Lugia",
      "Thwackey",
      "Staravia"
    ],
    "answerIndex": 2
  },
  {
    "id": 272,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/804.png",
    "options": [
      "Naganadel",
      "Wishiwashi-solo",
      "Nidoking",
      "Gallade"
    ],
    "answerIndex": 0
  },
  {
    "id": 273,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/676.png",
    "options": [
      "Furfrou",
      "Latios",
      "Porygon2",
      "Sobble"
    ],
    "answerIndex": 0
  },
  {
    "id": 274,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/119.png",
    "options": [
      "Petilil",
      "Revavroom",
      "Seaking",
      "Espurr"
    ],
    "answerIndex": 2
  },
  {
    "id": 275,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/901.png",
    "options": [
      "Shellos",
      "Capsakid",
      "Escavalier",
      "Ursaluna"
    ],
    "answerIndex": 3
  },
  {
    "id": 276,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/984.png",
    "options": [
      "Pinsir",
      "Great-tusk",
      "Kabutops",
      "Carnivine"
    ],
    "answerIndex": 1
  },
  {
    "id": 277,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/971.png",
    "options": [
      "Tympole",
      "Seismitoad",
      "Psyduck",
      "Greavard"
    ],
    "answerIndex": 3
  },
  {
    "id": 278,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/180.png",
    "options": [
      "Toucannon",
      "Meowscarada",
      "Flaaffy",
      "Roserade"
    ],
    "answerIndex": 2
  },
  {
    "id": 279,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/820.png",
    "options": [
      "Cobalion",
      "Greedent",
      "Magmar",
      "Reshiram"
    ],
    "answerIndex": 1
  },
  {
    "id": 280,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/934.png",
    "options": [
      "Naclstack",
      "Slugma",
      "Magikarp",
      "Garganacl"
    ],
    "answerIndex": 3
  },
  {
    "id": 281,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/869.png",
    "options": [
      "Togekiss",
      "Alcremie",
      "Turtonator",
      "Munna"
    ],
    "answerIndex": 1
  },
  {
    "id": 282,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/846.png",
    "options": [
      "Blitzle",
      "Diggersby",
      "Cloyster",
      "Arrokuda"
    ],
    "answerIndex": 3
  },
  {
    "id": 283,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/391.png",
    "options": [
      "Monferno",
      "Sewaddle",
      "Flittle",
      "Seviper"
    ],
    "answerIndex": 0
  },
  {
    "id": 284,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/298.png",
    "options": [
      "Wugtrio",
      "Phione",
      "Raticate",
      "Azurill"
    ],
    "answerIndex": 3
  },
  {
    "id": 285,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/252.png",
    "options": [
      "Iron-boulder",
      "Ursaluna",
      "Marill",
      "Treecko"
    ],
    "answerIndex": 3
  },
  {
    "id": 286,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/245.png",
    "options": [
      "Metagross",
      "Sneasler",
      "Oinkologne-male",
      "Suicune"
    ],
    "answerIndex": 3
  },
  {
    "id": 287,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/145.png",
    "options": [
      "Audino",
      "Zapdos",
      "Tauros",
      "Slakoth"
    ],
    "answerIndex": 1
  },
  {
    "id": 288,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/732.png",
    "options": [
      "Iron-moth",
      "Carkol",
      "Squirtle",
      "Trumbeak"
    ],
    "answerIndex": 3
  },
  {
    "id": 289,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/603.png",
    "options": [
      "Eelektrik",
      "Flutter-mane",
      "Shelmet",
      "Floatzel"
    ],
    "answerIndex": 0
  },
  {
    "id": 290,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/314.png",
    "options": [
      "Centiskorch",
      "Drilbur",
      "Nincada",
      "Illumise"
    ],
    "answerIndex": 3
  },
  {
    "id": 291,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/815.png",
    "options": [
      "Cinderace",
      "Darkrai",
      "Nickit",
      "Honchkrow"
    ],
    "answerIndex": 0
  },
  {
    "id": 292,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/84.png",
    "options": [
      "Heliolisk",
      "Corvisquire",
      "Ninetales",
      "Doduo"
    ],
    "answerIndex": 3
  },
  {
    "id": 293,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/778.png",
    "options": [
      "Weavile",
      "Mimikyu-disguised",
      "Meowstic-male",
      "Swanna"
    ],
    "answerIndex": 1
  },
  {
    "id": 294,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1013.png",
    "options": [
      "Cutiefly",
      "Keldeo-ordinary",
      "Chandelure",
      "Sinistcha"
    ],
    "answerIndex": 3
  },
  {
    "id": 295,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/891.png",
    "options": [
      "Kubfu",
      "Munna",
      "Ralts",
      "Thievul"
    ],
    "answerIndex": 0
  },
  {
    "id": 296,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/101.png",
    "options": [
      "Spritzee",
      "Electrode",
      "Koffing",
      "Baltoy"
    ],
    "answerIndex": 1
  },
  {
    "id": 297,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/905.png",
    "options": [
      "Golduck",
      "Necrozma",
      "Quilladin",
      "Enamorus-incarnate"
    ],
    "answerIndex": 3
  },
  {
    "id": 298,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/248.png",
    "options": [
      "Boltund",
      "Rockruff",
      "Ralts",
      "Tyranitar"
    ],
    "answerIndex": 3
  },
  {
    "id": 299,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/256.png",
    "options": [
      "Flamigo",
      "Dialga",
      "Sobble",
      "Combusken"
    ],
    "answerIndex": 3
  },
  {
    "id": 300,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/452.png",
    "options": [
      "Whimsicott",
      "Virizion",
      "Hitmonchan",
      "Drapion"
    ],
    "answerIndex": 3
  },
  {
    "id": 301,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/103.png",
    "options": [
      "Vileplume",
      "Exeggutor",
      "Flabebe",
      "Oshawott"
    ],
    "answerIndex": 1
  },
  {
    "id": 302,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/559.png",
    "options": [
      "Ceruledge",
      "Gliscor",
      "Scraggy",
      "Shelmet"
    ],
    "answerIndex": 2
  },
  {
    "id": 303,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/504.png",
    "options": [
      "Heliolisk",
      "Patrat",
      "Infernape",
      "Foongus"
    ],
    "answerIndex": 1
  },
  {
    "id": 304,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/381.png",
    "options": [
      "Latios",
      "Octillery",
      "Delphox",
      "Dratini"
    ],
    "answerIndex": 0
  },
  {
    "id": 305,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1012.png",
    "options": [
      "Polteageist",
      "Nihilego",
      "Poltchageist",
      "Chimchar"
    ],
    "answerIndex": 2
  },
  {
    "id": 306,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/608.png",
    "options": [
      "Lampent",
      "Tapu-koko",
      "Charjabug",
      "Venusaur"
    ],
    "answerIndex": 0
  },
  {
    "id": 307,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/908.png",
    "options": [
      "Meowscarada",
      "Trevenant",
      "Munkidori",
      "Aegislash-shield"
    ],
    "answerIndex": 0
  },
  {
    "id": 308,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/956.png",
    "options": [
      "Espathra",
      "Staryu",
      "Regirock",
      "Beheeyem"
    ],
    "answerIndex": 0
  },
  {
    "id": 309,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/423.png",
    "options": [
      "Roselia",
      "Growlithe",
      "Gastrodon",
      "Chandelure"
    ],
    "answerIndex": 2
  },
  {
    "id": 310,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/347.png",
    "options": [
      "Darumaka",
      "Anorith",
      "Haunter",
      "Leavanny"
    ],
    "answerIndex": 1
  },
  {
    "id": 311,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/740.png",
    "options": [
      "Crabominable",
      "Stantler",
      "Wartortle",
      "Falinks"
    ],
    "answerIndex": 0
  },
  {
    "id": 312,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/478.png",
    "options": [
      "Wishiwashi-solo",
      "Froslass",
      "Jellicent-male",
      "Lanturn"
    ],
    "answerIndex": 1
  },
  {
    "id": 313,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/742.png",
    "options": [
      "Swampert",
      "Wyrdeer",
      "Cutiefly",
      "Flamigo"
    ],
    "answerIndex": 2
  },
  {
    "id": 314,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/109.png",
    "options": [
      "Koffing",
      "Zapdos",
      "Simisage",
      "Orbeetle"
    ],
    "answerIndex": 0
  },
  {
    "id": 315,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/370.png",
    "options": [
      "Slowking",
      "Kricketot",
      "Brute-bonnet",
      "Luvdisc"
    ],
    "answerIndex": 3
  },
  {
    "id": 316,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/264.png",
    "options": [
      "Leafeon",
      "Bouffalant",
      "Jigglypuff",
      "Linoone"
    ],
    "answerIndex": 3
  },
  {
    "id": 317,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/121.png",
    "options": [
      "Starmie",
      "Farfetchd",
      "Appletun",
      "Umbreon"
    ],
    "answerIndex": 0
  },
  {
    "id": 318,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/295.png",
    "options": [
      "Fennekin",
      "Raging-bolt",
      "Azelf",
      "Exploud"
    ],
    "answerIndex": 3
  },
  {
    "id": 319,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/284.png",
    "options": [
      "Masquerain",
      "Moltres",
      "Elgyem",
      "Zoroark"
    ],
    "answerIndex": 0
  },
  {
    "id": 320,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/826.png",
    "options": [
      "Mr-rime",
      "Orbeetle",
      "Tropius",
      "Deino"
    ],
    "answerIndex": 1
  },
  {
    "id": 321,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/386.png",
    "options": [
      "Swablu",
      "Polteageist",
      "Deoxys-normal",
      "Milotic"
    ],
    "answerIndex": 2
  },
  {
    "id": 322,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/972.png",
    "options": [
      "Exeggcute",
      "Houndstone",
      "Wigglytuff",
      "Teddiursa"
    ],
    "answerIndex": 1
  },
  {
    "id": 323,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/700.png",
    "options": [
      "Sylveon",
      "Necrozma",
      "Sandshrew",
      "Rhydon"
    ],
    "answerIndex": 0
  },
  {
    "id": 324,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png",
    "options": [
      "Blitzle",
      "Walrein",
      "Snorlax",
      "Seismitoad"
    ],
    "answerIndex": 2
  },
  {
    "id": 325,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/577.png",
    "options": [
      "Mamoswine",
      "Solosis",
      "Kricketot",
      "Sceptile"
    ],
    "answerIndex": 1
  },
  {
    "id": 326,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/420.png",
    "options": [
      "Cherubi",
      "Sudowoodo",
      "Mewtwo",
      "Iron-thorns"
    ],
    "answerIndex": 0
  },
  {
    "id": 327,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/881.png",
    "options": [
      "Arctozolt",
      "Cyclizar",
      "Huntail",
      "Milotic"
    ],
    "answerIndex": 0
  },
  {
    "id": 328,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/832.png",
    "options": [
      "Larvitar",
      "Tadbulb",
      "Zorua",
      "Dubwool"
    ],
    "answerIndex": 3
  },
  {
    "id": 329,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/985.png",
    "options": [
      "Hattrem",
      "Relicanth",
      "Scream-tail",
      "Dudunsparce-two-segment"
    ],
    "answerIndex": 2
  },
  {
    "id": 330,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/580.png",
    "options": [
      "Great-tusk",
      "Ducklett",
      "Whimsicott",
      "Dottler"
    ],
    "answerIndex": 1
  },
  {
    "id": 331,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/840.png",
    "options": [
      "Scovillain",
      "Applin",
      "Glalie",
      "Dewott"
    ],
    "answerIndex": 1
  },
  {
    "id": 332,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/82.png",
    "options": [
      "Magneton",
      "Drapion",
      "Wurmple",
      "Fletchinder"
    ],
    "answerIndex": 0
  },
  {
    "id": 333,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/673.png",
    "options": [
      "Grumpig",
      "Wo-chien",
      "Gogoat",
      "Iron-moth"
    ],
    "answerIndex": 2
  },
  {
    "id": 334,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/825.png",
    "options": [
      "Venipede",
      "Rellor",
      "Dottler",
      "Pincurchin"
    ],
    "answerIndex": 2
  },
  {
    "id": 335,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/28.png",
    "options": [
      "Poochyena",
      "Sandslash",
      "Psyduck",
      "Dewpider"
    ],
    "answerIndex": 1
  },
  {
    "id": 336,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/354.png",
    "options": [
      "Fennekin",
      "Toxapex",
      "Banette",
      "Eelektross"
    ],
    "answerIndex": 2
  },
  {
    "id": 337,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/691.png",
    "options": [
      "Lillipup",
      "Lurantis",
      "Forretress",
      "Dragalge"
    ],
    "answerIndex": 3
  },
  {
    "id": 338,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
    "options": [
      "Carbink",
      "Archaludon",
      "Iron-boulder",
      "Charizard"
    ],
    "answerIndex": 3
  },
  {
    "id": 339,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/823.png",
    "options": [
      "Tinkatink",
      "Ralts",
      "Blitzle",
      "Corviknight"
    ],
    "answerIndex": 3
  },
  {
    "id": 340,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/883.png",
    "options": [
      "Klinklang",
      "Arctovish",
      "Darkrai",
      "Oddish"
    ],
    "answerIndex": 1
  },
  {
    "id": 341,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/503.png",
    "options": [
      "Eternatus",
      "Conkeldurr",
      "Samurott",
      "Rapidash"
    ],
    "answerIndex": 2
  },
  {
    "id": 342,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/518.png",
    "options": [
      "Hippowdon",
      "Nincada",
      "Musharna",
      "Yungoos"
    ],
    "answerIndex": 2
  },
  {
    "id": 343,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/196.png",
    "options": [
      "Kakuna",
      "Gastly",
      "Espeon",
      "Snover"
    ],
    "answerIndex": 2
  },
  {
    "id": 344,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/969.png",
    "options": [
      "Leafeon",
      "Glimmet",
      "Maractus",
      "Leavanny"
    ],
    "answerIndex": 1
  },
  {
    "id": 345,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/227.png",
    "options": [
      "Aegislash-shield",
      "Skarmory",
      "Nihilego",
      "Wobbuffet"
    ],
    "answerIndex": 1
  },
  {
    "id": 346,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/254.png",
    "options": [
      "Unfezant",
      "Hoopa",
      "Sceptile",
      "Purugly"
    ],
    "answerIndex": 2
  },
  {
    "id": 347,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/439.png",
    "options": [
      "Mime-jr",
      "Druddigon",
      "Zubat",
      "Nincada"
    ],
    "answerIndex": 0
  },
  {
    "id": 348,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/940.png",
    "options": [
      "Glaceon",
      "Squawkabilly-green-plumage",
      "Latias",
      "Wattrel"
    ],
    "answerIndex": 3
  },
  {
    "id": 349,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/734.png",
    "options": [
      "Palpitoad",
      "Yungoos",
      "Drednaw",
      "Heatran"
    ],
    "answerIndex": 1
  },
  {
    "id": 350,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/71.png",
    "options": [
      "Thievul",
      "Litleo",
      "Victreebel",
      "Heliolisk"
    ],
    "answerIndex": 2
  },
  {
    "id": 351,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/741.png",
    "options": [
      "Oricorio-baile",
      "Meltan",
      "Deino",
      "Mantyke"
    ],
    "answerIndex": 0
  },
  {
    "id": 352,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/588.png",
    "options": [
      "Mabosstiff",
      "Zubat",
      "Bunnelby",
      "Karrablast"
    ],
    "answerIndex": 3
  },
  {
    "id": 353,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/926.png",
    "options": [
      "Dewgong",
      "Fidough",
      "Chien-pao",
      "Oshawott"
    ],
    "answerIndex": 1
  },
  {
    "id": 354,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/446.png",
    "options": [
      "Drednaw",
      "Cyclizar",
      "Munchlax",
      "Amoonguss"
    ],
    "answerIndex": 2
  },
  {
    "id": 355,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/986.png",
    "options": [
      "Froslass",
      "Brute-bonnet",
      "Wartortle",
      "Scolipede"
    ],
    "answerIndex": 1
  },
  {
    "id": 356,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/648.png",
    "options": [
      "Thievul",
      "Meloetta-aria",
      "Raticate",
      "Oddish"
    ],
    "answerIndex": 1
  },
  {
    "id": 357,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/766.png",
    "options": [
      "Typhlosion",
      "Machop",
      "Sprigatito",
      "Passimian"
    ],
    "answerIndex": 3
  },
  {
    "id": 358,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/505.png",
    "options": [
      "Snorlax",
      "Meowstic-male",
      "Watchog",
      "Tauros"
    ],
    "answerIndex": 2
  },
  {
    "id": 359,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/520.png",
    "options": [
      "Thwackey",
      "Palpitoad",
      "Tranquill",
      "Bonsly"
    ],
    "answerIndex": 2
  },
  {
    "id": 360,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/98.png",
    "options": [
      "Nihilego",
      "Weedle",
      "Krabby",
      "Latias"
    ],
    "answerIndex": 2
  },
  {
    "id": 361,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/745.png",
    "options": [
      "Archen",
      "Pangoro",
      "Lycanroc-midday",
      "Corsola"
    ],
    "answerIndex": 2
  },
  {
    "id": 362,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/625.png",
    "options": [
      "Arcanine",
      "Meltan",
      "Bisharp",
      "Watchog"
    ],
    "answerIndex": 2
  },
  {
    "id": 363,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png",
    "options": [
      "Kadabra",
      "Rayquaza",
      "Vanillite",
      "Bulbasaur"
    ],
    "answerIndex": 1
  },
  {
    "id": 364,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/802.png",
    "options": [
      "Marshadow",
      "Bibarel",
      "Togepi",
      "Skuntank"
    ],
    "answerIndex": 0
  },
  {
    "id": 365,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/634.png",
    "options": [
      "Nidoking",
      "Umbreon",
      "Zweilous",
      "Cufant"
    ],
    "answerIndex": 2
  },
  {
    "id": 366,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/50.png",
    "options": [
      "Diglett",
      "Goomy",
      "Marill",
      "Pidgeotto"
    ],
    "answerIndex": 0
  },
  {
    "id": 367,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
    "options": [
      "Golett",
      "Skarmory",
      "Fezandipiti",
      "Bulbasaur"
    ],
    "answerIndex": 3
  },
  {
    "id": 368,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/805.png",
    "options": [
      "Throh",
      "Stakataka",
      "Comfey",
      "Heatran"
    ],
    "answerIndex": 1
  },
  {
    "id": 369,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/821.png",
    "options": [
      "Turtwig",
      "Rookidee",
      "Magneton",
      "Pangoro"
    ],
    "answerIndex": 1
  },
  {
    "id": 370,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/996.png",
    "options": [
      "Whimsicott",
      "Klefki",
      "Frigibax",
      "Meowscarada"
    ],
    "answerIndex": 2
  },
  {
    "id": 371,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/226.png",
    "options": [
      "Mantine",
      "Durant",
      "Eelektross",
      "Talonflame"
    ],
    "answerIndex": 0
  },
  {
    "id": 372,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/377.png",
    "options": [
      "Paras",
      "Ninjask",
      "Regirock",
      "Groudon"
    ],
    "answerIndex": 2
  },
  {
    "id": 373,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/366.png",
    "options": [
      "Pachirisu",
      "Pelipper",
      "Natu",
      "Clamperl"
    ],
    "answerIndex": 3
  },
  {
    "id": 374,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/55.png",
    "options": [
      "Keldeo-ordinary",
      "Poipole",
      "Magneton",
      "Golduck"
    ],
    "answerIndex": 3
  },
  {
    "id": 375,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/974.png",
    "options": [
      "Serperior",
      "Muk",
      "Exeggcute",
      "Cetoddle"
    ],
    "answerIndex": 3
  },
  {
    "id": 376,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/329.png",
    "options": [
      "Iron-hands",
      "Vibrava",
      "Greninja",
      "Nosepass"
    ],
    "answerIndex": 1
  },
  {
    "id": 377,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/807.png",
    "options": [
      "Metagross",
      "Tympole",
      "Zeraora",
      "Morgrem"
    ],
    "answerIndex": 2
  },
  {
    "id": 378,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/929.png",
    "options": [
      "Dolliv",
      "Mr-mime",
      "Ducklett",
      "Finizen"
    ],
    "answerIndex": 0
  },
  {
    "id": 379,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/617.png",
    "options": [
      "Accelgor",
      "Sylveon",
      "Empoleon",
      "Salandit"
    ],
    "answerIndex": 0
  },
  {
    "id": 380,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/183.png",
    "options": [
      "Iron-bundle",
      "Marill",
      "Golurk",
      "Kakuna"
    ],
    "answerIndex": 1
  },
  {
    "id": 381,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/58.png",
    "options": [
      "Wimpod",
      "Mime-jr",
      "Growlithe",
      "Torracat"
    ],
    "answerIndex": 2
  },
  {
    "id": 382,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/281.png",
    "options": [
      "Kirlia",
      "Pineco",
      "Ferroseed",
      "Tranquill"
    ],
    "answerIndex": 0
  },
  {
    "id": 383,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/321.png",
    "options": [
      "Breloom",
      "Wailord",
      "Elekid",
      "Beartic"
    ],
    "answerIndex": 1
  },
  {
    "id": 384,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/585.png",
    "options": [
      "Shinx",
      "Hitmonlee",
      "Deerling",
      "Iron-treads"
    ],
    "answerIndex": 2
  },
  {
    "id": 385,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/831.png",
    "options": [
      "Naganadel",
      "Wooloo",
      "Munchlax",
      "Manectric"
    ],
    "answerIndex": 1
  },
  {
    "id": 386,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/139.png",
    "options": [
      "Heracross",
      "Omastar",
      "Dusknoir",
      "Shelmet"
    ],
    "answerIndex": 1
  },
  {
    "id": 387,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/535.png",
    "options": [
      "Tympole",
      "Snorunt",
      "Braixen",
      "Mew"
    ],
    "answerIndex": 0
  },
  {
    "id": 388,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/924.png",
    "options": [
      "Petilil",
      "Tandemaus",
      "Centiskorch",
      "Weepinbell"
    ],
    "answerIndex": 1
  },
  {
    "id": 389,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/326.png",
    "options": [
      "Arctibax",
      "Grumpig",
      "Flutter-mane",
      "Accelgor"
    ],
    "answerIndex": 1
  },
  {
    "id": 390,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/306.png",
    "options": [
      "Ceruledge",
      "Aggron",
      "Beedrill",
      "Skeledirge"
    ],
    "answerIndex": 1
  },
  {
    "id": 391,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/730.png",
    "options": [
      "Primarina",
      "Wailmer",
      "Escavalier",
      "Snorunt"
    ],
    "answerIndex": 0
  },
  {
    "id": 392,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/600.png",
    "options": [
      "Parasect",
      "Klang",
      "Tangrowth",
      "Scraggy"
    ],
    "answerIndex": 1
  },
  {
    "id": 393,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/796.png",
    "options": [
      "Xurkitree",
      "Kricketot",
      "Poliwhirl",
      "Stunfisk"
    ],
    "answerIndex": 0
  },
  {
    "id": 394,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/51.png",
    "options": [
      "Vigoroth",
      "Probopass",
      "Dugtrio",
      "Bewear"
    ],
    "answerIndex": 2
  },
  {
    "id": 395,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/722.png",
    "options": [
      "Rowlet",
      "Golurk",
      "Espurr",
      "Lechonk"
    ],
    "answerIndex": 0
  },
  {
    "id": 396,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/152.png",
    "options": [
      "Tentacool",
      "Finizen",
      "Chikorita",
      "Staryu"
    ],
    "answerIndex": 2
  },
  {
    "id": 397,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/496.png",
    "options": [
      "Bombirdier",
      "Servine",
      "Musharna",
      "Buneary"
    ],
    "answerIndex": 1
  },
  {
    "id": 398,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/604.png",
    "options": [
      "Coalossal",
      "Palossand",
      "Grubbin",
      "Eelektross"
    ],
    "answerIndex": 3
  },
  {
    "id": 399,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/973.png",
    "options": [
      "Mawile",
      "Cinderace",
      "Sandile",
      "Flamigo"
    ],
    "answerIndex": 3
  },
  {
    "id": 400,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/562.png",
    "options": [
      "Registeel",
      "Scovillain",
      "Yamask",
      "Dreepy"
    ],
    "answerIndex": 2
  },
  {
    "id": 401,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/964.png",
    "options": [
      "Beartic",
      "Anorith",
      "Tapu-fini",
      "Palafin-zero"
    ],
    "answerIndex": 3
  },
  {
    "id": 402,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/568.png",
    "options": [
      "Trubbish",
      "Sharpedo",
      "Aerodactyl",
      "Eelektrik"
    ],
    "answerIndex": 0
  },
  {
    "id": 403,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/442.png",
    "options": [
      "Spiritomb",
      "Sliggoo",
      "Sigilyph",
      "Lilligant"
    ],
    "answerIndex": 0
  },
  {
    "id": 404,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/550.png",
    "options": [
      "Kleavor",
      "Inteleon",
      "Basculin-red-striped",
      "Sandygast"
    ],
    "answerIndex": 2
  },
  {
    "id": 405,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/620.png",
    "options": [
      "Munchlax",
      "Mudsdale",
      "Mienshao",
      "Gliscor"
    ],
    "answerIndex": 2
  },
  {
    "id": 406,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/824.png",
    "options": [
      "Skiddo",
      "Tadbulb",
      "Escavalier",
      "Blipbug"
    ],
    "answerIndex": 3
  },
  {
    "id": 407,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1020.png",
    "options": [
      "Drizzile",
      "Munna",
      "Sinistea",
      "Gouging-fire"
    ],
    "answerIndex": 3
  },
  {
    "id": 408,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/692.png",
    "options": [
      "Clauncher",
      "Tatsugiri-curly",
      "Chimecho",
      "Applin"
    ],
    "answerIndex": 0
  },
  {
    "id": 409,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/909.png",
    "options": [
      "Turtwig",
      "Fuecoco",
      "Dubwool",
      "Remoraid"
    ],
    "answerIndex": 1
  },
  {
    "id": 410,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/571.png",
    "options": [
      "Rhydon",
      "Zoroark",
      "Goomy",
      "Pidove"
    ],
    "answerIndex": 1
  },
  {
    "id": 411,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/97.png",
    "options": [
      "Rockruff",
      "Hypno",
      "Wooloo",
      "Deino"
    ],
    "answerIndex": 1
  },
  {
    "id": 412,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/624.png",
    "options": [
      "Dratini",
      "Pawniard",
      "Miraidon",
      "Conkeldurr"
    ],
    "answerIndex": 1
  },
  {
    "id": 413,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png",
    "options": [
      "Phione",
      "Blastoise",
      "Ampharos",
      "Xatu"
    ],
    "answerIndex": 1
  },
  {
    "id": 414,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/24.png",
    "options": [
      "Noibat",
      "Arbok",
      "Poliwhirl",
      "Gastly"
    ],
    "answerIndex": 1
  },
  {
    "id": 415,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/83.png",
    "options": [
      "Floatzel",
      "Solgaleo",
      "Farfetchd",
      "Leavanny"
    ],
    "answerIndex": 2
  },
  {
    "id": 416,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/739.png",
    "options": [
      "Zoroark",
      "Totodile",
      "Genesect",
      "Crabrawler"
    ],
    "answerIndex": 3
  },
  {
    "id": 417,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/242.png",
    "options": [
      "Blissey",
      "Jellicent-male",
      "Raikou",
      "Togedemaru"
    ],
    "answerIndex": 0
  },
  {
    "id": 418,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/462.png",
    "options": [
      "Glimmora",
      "Heatmor",
      "Ho-oh",
      "Magnezone"
    ],
    "answerIndex": 3
  },
  {
    "id": 419,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/382.png",
    "options": [
      "Sandslash",
      "Feraligatr",
      "Kyogre",
      "Tangela"
    ],
    "answerIndex": 2
  },
  {
    "id": 420,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/257.png",
    "options": [
      "Roggenrola",
      "Arctozolt",
      "Blaziken",
      "Tyrantrum"
    ],
    "answerIndex": 2
  },
  {
    "id": 421,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/920.png",
    "options": [
      "Porygon2",
      "Rabsca",
      "Walking-wake",
      "Lokix"
    ],
    "answerIndex": 3
  },
  {
    "id": 422,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/918.png",
    "options": [
      "Spidops",
      "Zoroark",
      "Kingambit",
      "Dusknoir"
    ],
    "answerIndex": 0
  },
  {
    "id": 423,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/538.png",
    "options": [
      "Stantler",
      "Kangaskhan",
      "Exeggcute",
      "Throh"
    ],
    "answerIndex": 3
  },
  {
    "id": 424,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/509.png",
    "options": [
      "Axew",
      "Zacian",
      "Purrloin",
      "Orthworm"
    ],
    "answerIndex": 2
  },
  {
    "id": 425,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/886.png",
    "options": [
      "Gourgeist-average",
      "Bonsly",
      "Drakloak",
      "Nuzleaf"
    ],
    "answerIndex": 2
  },
  {
    "id": 426,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/340.png",
    "options": [
      "Whiscash",
      "Pikachu",
      "Lopunny",
      "Slakoth"
    ],
    "answerIndex": 0
  },
  {
    "id": 427,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/733.png",
    "options": [
      "Kakuna",
      "Toucannon",
      "Kartana",
      "Whiscash"
    ],
    "answerIndex": 1
  },
  {
    "id": 428,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/203.png",
    "options": [
      "Lickitung",
      "Chinchou",
      "Girafarig",
      "Xurkitree"
    ],
    "answerIndex": 2
  },
  {
    "id": 429,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/407.png",
    "options": [
      "Roserade",
      "Magmortar",
      "Grafaiai",
      "Runerigus"
    ],
    "answerIndex": 0
  },
  {
    "id": 430,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/73.png",
    "options": [
      "Marill",
      "Abra",
      "Tentacruel",
      "Musharna"
    ],
    "answerIndex": 2
  },
  {
    "id": 431,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/878.png",
    "options": [
      "Pincurchin",
      "Raging-bolt",
      "Cufant",
      "Petilil"
    ],
    "answerIndex": 2
  },
  {
    "id": 432,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/479.png",
    "options": [
      "Infernape",
      "Dracovish",
      "Rotom",
      "Purugly"
    ],
    "answerIndex": 2
  },
  {
    "id": 433,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/197.png",
    "options": [
      "Umbreon",
      "Pupitar",
      "Ferroseed",
      "Galvantula"
    ],
    "answerIndex": 0
  },
  {
    "id": 434,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/738.png",
    "options": [
      "Pikipek",
      "Mightyena",
      "Fraxure",
      "Vikavolt"
    ],
    "answerIndex": 3
  },
  {
    "id": 435,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/155.png",
    "options": [
      "Cyndaquil",
      "Iron-hands",
      "Aipom",
      "Blipbug"
    ],
    "answerIndex": 0
  },
  {
    "id": 436,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/708.png",
    "options": [
      "Phantump",
      "Venipede",
      "Metagross",
      "Diglett"
    ],
    "answerIndex": 0
  },
  {
    "id": 437,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/250.png",
    "options": [
      "Feebas",
      "Ho-oh",
      "Dewgong",
      "Morelull"
    ],
    "answerIndex": 1
  },
  {
    "id": 438,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/458.png",
    "options": [
      "Blissey",
      "Volcarona",
      "Mantyke",
      "Roserade"
    ],
    "answerIndex": 2
  },
  {
    "id": 439,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/341.png",
    "options": [
      "Corphish",
      "Regidrago",
      "Pikachu",
      "Tinkaton"
    ],
    "answerIndex": 0
  },
  {
    "id": 440,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/843.png",
    "options": [
      "Tentacruel",
      "Silicobra",
      "Oricorio-baile",
      "Aromatisse"
    ],
    "answerIndex": 1
  },
  {
    "id": 441,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/656.png",
    "options": [
      "Kadabra",
      "Maschiff",
      "Froakie",
      "Morgrem"
    ],
    "answerIndex": 2
  },
  {
    "id": 442,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/782.png",
    "options": [
      "Jangmo-o",
      "Deino",
      "Lickilicky",
      "Tangrowth"
    ],
    "answerIndex": 0
  },
  {
    "id": 443,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/524.png",
    "options": [
      "Basculin-red-striped",
      "Stoutland",
      "Roggenrola",
      "Nincada"
    ],
    "answerIndex": 2
  },
  {
    "id": 444,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/387.png",
    "options": [
      "Electrode",
      "Metagross",
      "Turtwig",
      "Gloom"
    ],
    "answerIndex": 2
  },
  {
    "id": 445,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/390.png",
    "options": [
      "Dusknoir",
      "Bronzong",
      "Shroomish",
      "Chimchar"
    ],
    "answerIndex": 3
  },
  {
    "id": 446,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/781.png",
    "options": [
      "Scovillain",
      "Zygarde-50",
      "Sandshrew",
      "Dhelmise"
    ],
    "answerIndex": 3
  },
  {
    "id": 447,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/486.png",
    "options": [
      "Mesprit",
      "Grookey",
      "Ho-oh",
      "Regigigas"
    ],
    "answerIndex": 3
  },
  {
    "id": 448,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/718.png",
    "options": [
      "Cobalion",
      "Eiscue-ice",
      "Raboot",
      "Zygarde-50"
    ],
    "answerIndex": 3
  },
  {
    "id": 449,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/947.png",
    "options": [
      "Chansey",
      "Brambleghast",
      "Duskull",
      "Floatzel"
    ],
    "answerIndex": 1
  },
  {
    "id": 450,
    "pokemonImage": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/857.png",
    "options": [
      "Spinarak",
      "Hattrem",
      "Regieleki",
      "Magneton"
    ],
    "answerIndex": 1
  }
];
