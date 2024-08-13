import { atom } from 'jotai';

export const sortFieldAtom = atom('');
export const sortOrderAtom = atom('');
export const diningHallAtom = atom('');
export const mealTypeAtom = atom('');
export const searchTermAtom = atom('');
export const dateServedAtom = atom('');
export const allergensAtom = atom<string[]>([]);
export const preferencesAtom = atom('');
export const datesAtom = atom<string[]>([]);