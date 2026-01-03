import { InteractableObject, ItemCategory, ShopItem } from './types';

export const GAME_WIDTH = 2000;
export const GAME_HEIGHT = 2000;
export const PLAYER_SIZE = 50; 
export const PLAYER_SPEED = 5;

// URL for the floor texture. 
export const FLOOR_IMAGE_URL = "https://i.postimg.cc/CK5rBZLQ/Untitled-design-(43).png";

// CHARACTER SPRITE CONFIGURATION
export const ANIMATION_SPEED_MS = 150; 

// Added ?v=1 to force cache refresh on mobile devices
export const CHARACTER_SPRITES = {
  // Frames for walking DOWN
  down: [
    "https://i.postimg.cc/NjbWSqz8/MMD2.png?v=1",
    "https://i.postimg.cc/R0HLfwKm/MMD3.png?v=1"
  ],
  // Frames for walking UP
  up: [
    "https://i.postimg.cc/tCGJCWCw/MMU1.png?v=1",
    "https://i.postimg.cc/mrn2xF5d/MMU2.png?v=1"
  ],
  // Frames for walking LEFT
  left: [
    "https://i.postimg.cc/rpkKn47M/MML1.png?v=1",
    "https://i.postimg.cc/L5wszgzd/MM2.png?v=1"
  ],
  // Frames for walking RIGHT
  right: [
    "https://i.postimg.cc/0Nyb1v22/MMR1.png?v=1",
    "https://i.postimg.cc/1Xwzr5M5/MMR2.png?v=1"
  ]
};

// Helper to generate mock items
const createItem = (id: string, name: string, price: number, cat: ItemCategory, desc: string): ShopItem => ({
  id,
  name,
  price,
  category: cat,
  description: desc,
  image: `https://picsum.photos/seed/${id}/200/200`
});

export const MOCK_SHOPS: InteractableObject[] = [
  {
    id: 'hypebeast_shop',
    type: 'shop',
    position: { x: 400, y: 300 },
    size: { width: 120, height: 100 },
    color: 'bg-red-800',
    label: 'Hypebeast HQ',
    category: 'Hypebeast'
  },
  {
    id: 'web3_shop',
    type: 'shop',
    position: { x: 800, y: 300 },
    size: { width: 120, height: 100 },
    color: 'bg-purple-800',
    label: 'Crypto Corner',
    category: 'Web3'
  },
  {
    id: 'collectibles_shop',
    type: 'shop',
    position: { x: 600, y: 600 },
    size: { width: 140, height: 80 },
    color: 'bg-green-700',
    label: 'Collectibles Market',
    category: 'Collectible'
  },
  {
    id: 'ancient_shop',
    type: 'shop',
    position: { x: 1200, y: 500 },
    size: { width: 130, height: 90 },
    color: 'bg-yellow-700',
    label: 'Ancient Relics',
    category: 'Ancient'
  },
  {
    id: 'sculptures_shop',
    type: 'shop',
    position: { x: 1000, y: 800 },
    size: { width: 120, height: 100 },
    color: 'bg-gray-700',
    label: 'Art Gallery',
    category: 'Sculptures'
  },
  {
    id: 'household_shop',
    type: 'shop',
    position: { x: 300, y: 800 },
    size: { width: 120, height: 90 },
    color: 'bg-blue-700',
    label: 'Home Goods',
    category: 'Household'
  },
  {
    id: 'fountain',
    type: 'sign',
    position: { x: 600, y: 450 },
    size: { width: 80, height: 80 },
    color: 'bg-blue-400',
    label: 'Fountain',
    dialogue: ['The water is crystal clear.', 'You feel refreshed just looking at it.']
  }
];

export const INITIAL_GOLD = 1000;