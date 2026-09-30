import { Category } from '../types/expense';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'food_drinks',
    name: 'Food & Drinks',
    icon: 'fast-food',
    color: '#FF70A6',
  },
  {
    id: 'campus_books',
    name: 'Campus & Study',
    icon: 'school',
    color: '#4EA8DE',
  },
  {
    id: 'transport',
    name: 'Transit & Gas',
    icon: 'bicycle',
    color: '#FF9770',
  },
  {
    id: 'subscriptions',
    name: 'Streaming & Apps',
    icon: 'film',
    color: '#70D6FF',
  },
  {
    id: 'hangout',
    name: 'Hangout & Fun',
    icon: 'game-controller',
    color: '#E9D8A6',
  },
  {
    id: 'emergency',
    name: 'Health & Needs',
    icon: 'medkit',
    color: '#06D6A0',
  },
];
