export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export enum ItemCategory {
  WEAPONS = 'Weapons',
  POTIONS = 'Potions',
  ARMOR = 'Armor',
  FOOD = 'Food',
  TECH = 'Tech'
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: ItemCategory;
  image: string;
}

export interface InteractableObject {
  id: string;
  type: 'shop' | 'npc' | 'sign';
  position: Position;
  size: Size;
  color: string;
  label: string;
  items?: ShopItem[]; // Only for shops
  dialogue?: string[];
}

export interface GameState {
  inventory: ShopItem[];
  gold: number;
}

export interface Product {
  id: string;
  name: string;
  displayName: string;
  subCategory: string;
  price: number;
  description: string;
  images: string[]; // Array of image paths
  mainImage: string; // Primary image
}