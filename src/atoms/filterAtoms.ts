import { atom } from 'jotai';

export const sortFieldsAtom = atom<{field: string, order: 'asc' | 'desc'}[]>([]);
export const sortOrderAtom = atom('');
export const diningHallAtom = atom('');
export const mealTypeAtom = atom('');
export const searchTermAtom = atom('');
export const dateServedAtom = atom('');
export const allergensAtom = atom<string[]>([]);
export const preferencesAtom = atom('');
export const datesAtom = atom<string[]>([]);
export const servingAtom = atom('');
export const availableDatesAtom = atom<string[]>([]);
export const ratingFilterAtom = atom<'any' | 'rated_only'>('any');