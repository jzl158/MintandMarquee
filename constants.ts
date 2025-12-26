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
    id: 'weapon_shop',
    type: 'shop',
    position: { x: 400, y: 300 },
    size: { width: 120, height: 100 },
    color: 'bg-red-800',
    label: 'Blacksmith',
    items: [
      createItem('sword1', 'Iron Sword', 150, ItemCategory.WEAPONS, 'A sturdy iron sword for beginners.'),
      createItem('bow1', 'Oak Bow', 200, ItemCategory.WEAPONS, 'Reliable ranged damage.'),
      createItem('shield1', 'Wooden Shield', 100, ItemCategory.ARMOR, 'Basic protection.'),
      createItem('helm1', 'Iron Helm', 300, ItemCategory.ARMOR, 'Protects your noggin.')
    ]
  },
  {
    id: 'magic_shop',
    type: 'shop',
    position: { x: 800, y: 300 },
    size: { width: 120, height: 100 },
    color: 'bg-purple-800',
    label: 'Alchemist',
    items: [
      createItem('pot1', 'Health Potion', 50, ItemCategory.POTIONS, 'Restores 50 HP.'),
      createItem('pot2', 'Mana Potion', 75, ItemCategory.POTIONS, 'Restores 50 MP.'),
      createItem('elixir', 'Elixir of Life', 500, ItemCategory.POTIONS, 'Fully restores everything.')
    ]
  },
  {
    id: 'food_stand',
    type: 'shop',
    position: { x: 600, y: 600 },
    size: { width: 140, height: 80 },
    color: 'bg-green-700',
    label: 'Market Stand',
    items: [
      createItem('apple', 'Red Apple', 5, ItemCategory.FOOD, 'Crunchy and sweet.'),
      createItem('bread', 'Loaf of Bread', 10, ItemCategory.FOOD, 'Freshly baked.'),
      createItem('tech1', 'Smartphone', 999, ItemCategory.TECH, 'An ancient artifact of connection.')
    ]
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