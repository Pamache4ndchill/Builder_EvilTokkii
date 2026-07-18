export interface AudioQuestion {
  id: number;
  youtubeId: string;
  options: string[];
  answerIndex: number;
}

// 15 actual, real hits extracted from the provided YouTube playlist.
// Using 15 DIFFERENT videos from the playlist.
export const MUSIC_HITS_QUESTIONS: AudioQuestion[] = [
  {
    id: 1,
    youtubeId: "ko70cExuzZM", // Taylor Swift - The Fate of Ophelia
    options: ["Ariana Grande - Dangerous Woman", "Taylor Swift - The Fate of Ophelia", "Selena Gomez - Lose You to Love Me", "Billie Eilish - Ocean Eyes"],
    answerIndex: 1
  },
  {
    id: 2,
    youtubeId: "mrV8kK5t0V8", // Bruno Mars - I Just Might
    options: ["The Weeknd - Blinding Lights", "Bruno Mars - I Just Might", "Ed Sheeran - Shivers", "Justin Bieber - Peaches"],
    answerIndex: 1
  },
  {
    id: 3,
    youtubeId: "u2ah9tWTkmk", // Alex Warren - Ordinary
    options: ["Lewis Capaldi - Someone You Loved", "Alex Warren - Ordinary", "Shawn Mendes - In My Blood", "Benson Boone - Beautiful Things"],
    answerIndex: 1
  },
  {
    id: 4,
    youtubeId: "Rt9tW3cMLhI", // Linkin Park - Numb
    options: ["Evanescence - Bring Me To Life", "Linkin Park - Numb", "Green Day - Boulevard of Broken Dreams", "Red Hot Chili Peppers - Californication"],
    answerIndex: 1
  },
  {
    id: 5,
    youtubeId: "V1Pl8CzNFTg", // Billie Eilish - LUNCH
    options: ["Billie Eilish - LUNCH", "Sabrina Carpenter - Espresso", "Olivia Rodrigo - Vampire", "Dua Lipa - Training Season"],
    answerIndex: 0
  },
  {
    id: 6,
    youtubeId: "eVli-tstM5E", // Post Malone - I Had Some Help (feat. Morgan Wallen)
    options: ["Luke Combs - Fast Car", "Post Malone - I Had Some Help", "Shaboozey - A Bar Song", "Zach Bryan - Pink Skies"],
    answerIndex: 1
  },
  {
    id: 7,
    youtubeId: "T319k5a9K1w", // Benson Boone - Beautiful Things
    options: ["Stephen Sanchez - Until I Found You", "Benson Boone - Beautiful Things", "Noah Kahan - Dial Drunk", "Hozier - Too Sweet"],
    answerIndex: 1
  },
  {
    id: 8,
    youtubeId: "q0hyYWLu-BY", // Sabrina Carpenter - Espresso
    options: ["Camila Cabello - IUV", "Sabrina Carpenter - Espresso", "Tate McRae - greedy", "Chappell Roan - Good Luck, Babe!"],
    answerIndex: 1
  },
  {
    id: 9,
    youtubeId: "2JiUkrWn2L0", // Hozier - Too Sweet
    options: ["Teddy Swims - Lose Control", "Jack Harlow - Lovin On Me", "Hozier - Too Sweet", "David Kushner - Daylight"],
    answerIndex: 2
  },
  {
    id: 10,
    youtubeId: "K3Qzzggn--s", // Chappell Roan - Good Luck, Babe!
    options: ["Chappell Roan - Good Luck, Babe!", "Charli XCX - 360", "Clairo - Sexy to Someone", "Billie Eilish - CHIHIRO"],
    answerIndex: 0
  },
  {
    id: 11,
    youtubeId: "9c3V1hM4G9U", // Tommy Richman - MILLION DOLLAR BABY
    options: ["Kendrick Lamar - Not Like Us", "Drake - Family Matters", "Tommy Richman - MILLION DOLLAR BABY", "Travis Scott - FE!N"],
    answerIndex: 2
  },
  {
    id: 12,
    youtubeId: "Q7wUor5x4pM", // Shaboozey - A Bar Song (Tipsy)
    options: ["Morgan Wallen - Cowgirls", "Shaboozey - A Bar Song (Tipsy)", "Post Malone - Chemical", "Luke Bryan - Love You, Miss You, Mean It"],
    answerIndex: 1
  },
  {
    id: 13,
    youtubeId: "yH84K9wN0b8", // Ariana Grande - We Can't Be Friends
    options: ["SZA - Saturn", "Dua Lipa - Illusion", "Ariana Grande - We Can't Be Friends", "Tyla - Water"],
    answerIndex: 2
  },
  {
    id: 14,
    youtubeId: "J8aQ1XU8W0w", // Teddy Swims - Lose Control
    options: ["Michael Marcagi - Scared to Start", "Teddy Swims - Lose Control", "Benson Boone - Slow It Down", "Alex Warren - Carry You Home"],
    answerIndex: 1
  },
  {
    id: 15,
    youtubeId: "148Yp9gW4k8", // Kendrick Lamar - Not Like Us
    options: ["Future - Like That", "Kendrick Lamar - Not Like Us", "Metro Boomin - Type Shit", "Gunna - Prada Dem"],
    answerIndex: 1
  }
];
