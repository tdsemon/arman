export type ThemeId =
  | 'midnight-cinema'
  | 'sakura'
  | 'neon-tokyo'
  | 'terminal'
  | 'sunset-reel'
  | 'paper-cut';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  previewColors: [string, string, string]; // [bg, accent, accent-2]
  isLight?: boolean;
  timecode: string;
}

export interface PetConfig {
  id: string;
  name: string;
  file: string;
  idlePos: [number, number]; // [col, row] in 32px grid
}

/* -------------------------------------------------------------------------- */
/* THEMES LIST (EASY TO ADD NEW THEMES)                                       */
/* -------------------------------------------------------------------------- */
export const THEMES: ThemeConfig[] = [
  {
    id: 'midnight-cinema',
    name: 'Midnight Cinema',
    subtitle: 'Arman Suite · DaVinci Orange',
    previewColors: ['#08080A', '#FF5500', '#00F0FF'],
    timecode: '00:01',
  },
  {
    id: 'sakura',
    name: 'Sakura Bloom',
    subtitle: 'Soft Pink Cream · Light Mode',
    previewColors: ['#FDF6F6', '#E0537A', '#7D435E'],
    isLight: true,
    timecode: '00:02',
  },
  {
    id: 'neon-tokyo',
    name: 'Neon Tokyo',
    subtitle: 'Cyber Purple · Hot Magenta & Cyan',
    previewColors: ['#0A0612', '#FF007A', '#00F0FF'],
    timecode: '00:03',
  },
  {
    id: 'terminal',
    name: 'Phosphor Terminal',
    subtitle: 'CRT Pitch Black · Matrix Green',
    previewColors: ['#050805', '#00FF66', '#70FFB8'],
    timecode: '00:04',
  },
  {
    id: 'sunset-reel',
    name: 'Sunset Reel',
    subtitle: 'Vintage Celluloid · Amber to Flame',
    previewColors: ['#0C0806', '#FF4500', '#FFA000'],
    timecode: '00:05',
  },
  {
    id: 'paper-cut',
    name: 'Paper Cut',
    subtitle: 'Editorial Parchment · Swiss Poster Red',
    previewColors: ['#F4F1EA', '#D92626', '#141414'],
    isLight: true,
    timecode: '00:06',
  },
];

/* -------------------------------------------------------------------------- */
/* PETS LIST (EASY TO ADD NEW PETS — TOMOYO DEFAULT)                          */
/* -------------------------------------------------------------------------- */
export const PETS: PetConfig[] = [
  {
    id: 'tomoyo',
    name: 'Tomoyo',
    file: '/pets/tomoyo.png',
    idlePos: [-3, -3],
  },
  {
    id: 'ace',
    name: 'Ace',
    file: '/pets/ace.png',
    idlePos: [-3, -3],
  },
  {
    id: 'bunny',
    name: 'Bunny',
    file: '/pets/bunny.png',
    idlePos: [-3, -3],
  },
  {
    id: 'calico',
    name: 'Calico',
    file: '/pets/calico.png',
    idlePos: [-3, -3],
  },
  {
    id: 'dog',
    name: 'Puppy',
    file: '/pets/dog.png',
    idlePos: [-3, -3],
  },
  {
    id: 'eevee',
    name: 'Eevee',
    file: '/pets/eevee.png',
    idlePos: [-3, -3],
  },
  {
    id: 'fox',
    name: 'Fox',
    file: '/pets/fox.png',
    idlePos: [-3, -3],
  },
  {
    id: 'gray',
    name: 'Gray Neko',
    file: '/pets/gray.png',
    idlePos: [-3, -3],
  },
  {
    id: 'kina',
    name: 'Kina',
    file: '/pets/kina.png',
    idlePos: [-3, -3],
  },
  {
    id: 'lucy',
    name: 'Lucy',
    file: '/pets/lucy.png',
    idlePos: [-3, -3],
  },
  {
    id: 'maia',
    name: 'Maia',
    file: '/pets/maia.png',
    idlePos: [-3, -3],
  },
  {
    id: 'maria',
    name: 'Maria',
    file: '/pets/maria.png',
    idlePos: [-3, -3],
  },
  {
    id: 'mike',
    name: 'Mike',
    file: '/pets/mike.png',
    idlePos: [-3, -3],
  },
  {
    id: 'sakura',
    name: 'Sakura Pet',
    file: '/pets/sakura.png',
    idlePos: [-3, -3],
  },
  {
    id: 'valentine',
    name: 'Valentine',
    file: '/pets/valentine.png',
    idlePos: [-3, -3],
  },
  {
    id: 'classic',
    name: 'Classic Cat',
    file: '/pets/oneko.gif',
    idlePos: [-3, -3],
  },
];
