import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { diningHallTimes } from '@/utils/constants';

function getCurrentCSTTime() {
  return new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
}

function parseTime(time: string): Date {
  const [hours, minutes] = time.slice(0, -2).split(':').map(Number);
  const isPM = time.slice(-2) === 'PM';
  const date = new Date();
  date.setHours(isPM && hours !== 12 ? hours + 12 : hours, minutes, 0, 0);
  return date;
}

function isNowBetween(startTime: string, endTime: string, currentTime: Date): boolean {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  return currentTime >= start && currentTime <= end;
}

function getServingStatus(mealEntries: any[], currentTime: Date) {
  let isServedNow = false;
  let isServedLater = false;
  let futureDate = null;

  const currentDate = new Date(currentTime.toDateString());
  const tomorrow = new Date(currentDate);
  tomorrow.setDate(tomorrow.getDate() + 1);

  mealEntries.forEach(entry => {
    const entryDate = new Date(entry.dateServed);
    const mealTimes = diningHallTimes[entry.diningHall]?.[entry.mealType];
    if (!mealTimes) return;

    const [start, end] = mealTimes.split(" - ");

    if (entryDate.toDateString() === currentDate.toDateString()) {
      if (isNowBetween(start, end, currentTime)) {
        isServedNow = true;
      } else if (currentTime < parseTime(end)) {
        isServedLater = true;
      }
    } else if (entryDate >= tomorrow) {
      if (!futureDate || entryDate < futureDate) {
        futureDate = entryDate;
      }
    }
  });

  if (isServedNow) return 'now';
  if (isServedLater) return 'later';
  if (futureDate) return futureDate.toISOString().split('T')[0];
  return 'not_available';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { page, sortFields, diningHall, mealType, searchTerm, dateServed, allergens, preferences, serving } = req.query;

  const pageNumber = parseInt(page as string) || 1;
  const pageSize = 10;

  try {
    const parsedSortFields = JSON.parse(sortFields as string || '[]');
    
    let orderBy = parsedSortFields.length > 0
      ? parsedSortFields.map((field: { field: string; order: 'asc' | 'desc' }) => ({
          [field.field]: field.order
        }))
      : undefined;

    const where = {
      ...(diningHall && { mealEntries: { some: { diningHall: diningHall as string } } }),
      ...(mealType && { mealEntries: { some: { mealType: mealType as string } } }),
      ...(searchTerm && { name: { contains: searchTerm as string, mode: 'insensitive' } }),
      ...(dateServed && { mealEntries: { some: { dateServed: dateServed as string } } }),
      ...(allergens && { allergens: { not: { contains: allergens as string } } }),
      ...(preferences && { preferences: { contains: preferences as string } }),
    };

    let food = await prisma.foodInfo.findMany({
      where,
      include: { mealEntries: true },
    });

    const currentTime = new Date(getCurrentCSTTime());

    // Apply serving filter and calculate serving status
    food = food.map(item => {
      const validMealEntries = item.mealEntries.filter(entry => entry.startTime && entry.endTime);
      item.servingStatus = getServingStatus(validMealEntries, currentTime);
      return item;
    }).filter(item => {
      if (serving === '') return true;
      return item.servingStatus === serving;
    });

    // Apply sorting
    if (!serving || serving === '') {
      food.sort((a, b) => {
        if (a.servingStatus === 'now' && b.servingStatus !== 'now') return -1;
        if (a.servingStatus !== 'now' && b.servingStatus === 'now') return 1;
        if (a.servingStatus === 'later' && b.servingStatus !== 'later') return -1;
        if (a.servingStatus !== 'later' && b.servingStatus === 'later') return 1;
        if (a.servingStatus !== 'not_available' && b.servingStatus === 'not_available') return -1;
        if (a.servingStatus === 'not_available' && b.servingStatus !== 'not_available') return 1;
        if (a.servingStatus < b.servingStatus) return -1;
        if (a.servingStatus > b.servingStatus) return 1;
        return 0;
      });
    }

    // Get unique future dates
    const futureDates = [...new Set(food
      .map(item => item.servingStatus)
      .filter(status => status !== 'now' && status !== 'later' && status !== 'not_available')
    )].sort();

    const foodCount = food.length;
    food = food.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

    const dates = await prisma.mealDetails.findMany({
      select: { dateServed: true },
      distinct: ['dateServed'],
      orderBy: { dateServed: 'desc' },
    });

    res.status(200).json({ food, foodCount, dates: dates.map(d => d.dateServed), futureDates });
  } catch (error) {
    console.error('Error in get_allfood:', error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
}