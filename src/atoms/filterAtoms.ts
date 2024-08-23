import { atom } from 'jotai';

export interface Filter {
  sortFields: { field: string; order: 'asc' | 'desc' }[];
  diningHall: string;
  mealType: string;
  dateServed: string;
  allergens: string[];
  preferences: string;
  serving: string;
  ratingFilter: string;
}

export const filterAtom = atom<Filter>({
  sortFields: [],
  diningHall: '',
  mealType: '',
  dateServed: '',
  allergens: [],
  preferences: '',
  serving: '',
  ratingFilter: 'any'
});

export const searchTermAtom = atom('');