import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { diningHallTimes } from '@/utils/constants';
import { format, startOfDay, addDays, isSameDay, parse, isAfter } from 'date-fns';
import { FoodInfo, Prisma, Review } from '@prisma/client';

function getCurrentCSTTime(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));
}

function parseFormattedDate(dateString: string): Date {
  return parse(dateString, 'EEEE, MMMM d, yyyy', new Date());
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

function getServingStatus(mealEntries: any[], currentTime: Date): string | string[] {
  let isServedNow = false;
  let isServedLater = false;
  let futureDates = new Set<string>();

  const currentDate = startOfDay(currentTime);
  const tomorrow = addDays(currentDate, 1);

  mealEntries.forEach(entry => {
    let entryDate;
    try {
      entryDate = parseFormattedDate(entry.dateServed);
      if (isNaN(entryDate.getTime())) {
        return;
      }
    } catch (error) {
      return;
    }
    
    const mealTimes = diningHallTimes[entry.diningHall]?.[entry.mealType];
    if (!mealTimes) {
      return;
    }

    const [start, end] = mealTimes.split(" - ");

    if (isSameDay(entryDate, currentDate)) {
      if (isNowBetween(start, end, currentTime)) {
        isServedNow = true;
      } else if (currentTime < parseTime(end)) {
        isServedLater = true;
      }
    } else if (isAfter(entryDate, currentDate)) {
      futureDates.add(format(entryDate, 'EEEE, MMMM d, yyyy'));
    }
  });

  if (isServedNow) return 'now';
  if (isServedLater) return 'later';
  if (futureDates.size > 0) return Array.from(futureDates);
  return 'not_available';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { page, sortFields, diningHall, mealType, searchTerm, dateServed, allergens, preferences, serving, ratingFilter } = req.query;

  console.log('API: get_allfood called with params:', { page, sortFields, diningHall, mealType, searchTerm, dateServed, allergens, preferences, serving, ratingFilter });

  const pageNumber = parseInt(page as string) || 1;
  const pageSize = 10;

  try {
    const parsedSortFields = JSON.parse(sortFields as string || '[]');
    
    let orderBy = parsedSortFields.length > 0
      ? parsedSortFields.map((field: { field: string; order: 'asc' | 'desc' }) => ({
          [field.field]: field.order === 'desc' ? 'desc' : 'asc'
        }))
      : undefined;

    console.log('API: Parsed sort fields:', orderBy);

    let foodIdsWithRating: string[] = [];
    if (ratingFilter && ratingFilter !== 'Any') {
      console.log(`API: Applying rating filter: ${ratingFilter}`);

      const reviewGroups = await prisma.review.groupBy({
        by: ['foodId'],
        _count: {
          rating: true,
        },
      });

      console.log(`API: Found ${reviewGroups.length} food items with reviews`);

      foodIdsWithRating = await Promise.all(reviewGroups.map(async (group) => {
        if (group._count.rating === 0) {
          return null; // Exclude food items with no reviews
        }

        const reviews = await prisma.review.findMany({
          where: { foodId: group.foodId },
          select: { rating: true },
        });

        const totalScore = reviews.reduce((sum, review) => {
          return sum + (review.rating === 'good' ? 100 : review.rating === 'mid' ? 50 : 0);
        }, 0);

        const averageScore = Math.round(totalScore / reviews.length);
        console.log(`API: Food ${group.foodId} - Average Score: ${averageScore}`);
        
        // Determine the rating category based on the average score
        let ratingCategory;
        if (averageScore >= 70) {
          ratingCategory = 'Good+';
        } else if (averageScore >= 40) {
          ratingCategory = 'Mid+';
        } else {
          ratingCategory = 'Bad+';
        }

        // Check if the food item meets the filter criteria
        const meetsFilterCriteria = 
          (ratingFilter === 'Good+' && ratingCategory === 'Good+') ||
          (ratingFilter === 'Mid+' && (ratingCategory === 'Good+' || ratingCategory === 'Mid+')) ||
          (ratingFilter === 'Bad+');

        return meetsFilterCriteria ? group.foodId : null;
      })).then(ids => ids.filter((id): id is string => id !== null));

      console.log(`API: Found ${foodIdsWithRating.length} food items meeting rating criteria`);
    }

    const where: Prisma.FoodInfoWhereInput = {
      ...(foodIdsWithRating.length > 0 && { id: { in: foodIdsWithRating } }),
      ...(diningHall && { mealEntries: { some: { diningHall: diningHall as string } } }),
      ...(mealType && { mealEntries: { some: { mealType: mealType as string } } }),
      ...(searchTerm && { name: { contains: searchTerm as string, mode: 'insensitive' as Prisma.QueryMode } }),
      ...(dateServed && { mealEntries: { some: { dateServed: dateServed as string } } }),
      ...(allergens && { allergens: { not: { contains: allergens as string } } }),
      ...(preferences && { preferences: { contains: preferences as string } }),
    };

    // If a rating filter is applied, only include food items with reviews
    if (ratingFilter && ratingFilter !== 'Any') {
      where.Review = {
        some: {}
      };
    }

    console.log('API: Where clause:', where);

    let food = await prisma.foodInfo.findMany({
      where,
      include: { 
        mealEntries: true,
        Review: true,
      },
      orderBy,
    });

    console.log(`API: Found ${food.length} food items after applying filters`);

    food = food.map(item => {
      const servingStatus = getServingStatus(item.mealEntries, getCurrentCSTTime());
      const reviews = item.Review;
      const totalScore = reviews.reduce((sum, review) => {
        return sum + (review.rating === 'good' ? 100 : review.rating === 'mid' ? 50 : 0);
      }, 0);
      const averageRating = reviews.length > 0 ? Math.round(totalScore / reviews.length) : 0;
      console.log(`API: Food ${item.id} - Average Rating: ${averageRating}`);
      return { ...item, servingStatus, averageRating } as any;
    });

    // Apply serving filter
    if (serving) {
      food = food.filter((item: any) => {
        if (serving === 'now' || serving === 'later') return item.servingStatus === serving;
        if (Array.isArray(item.servingStatus)) return item.servingStatus.includes(serving as string);
        return false;
      });
    }

    const foodCount = food.length;
    food = food.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

    // Calculate available dates
    const allDates = new Set<string>();
    food.forEach((item: any) => {
      if (Array.isArray(item.servingStatus)) {
        item.servingStatus.forEach((date: string) => allDates.add(date));
      }
    });

    const availableDates = Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    console.log(`API: Returning ${food.length} food items`);
    res.status(200).json({ food, foodCount, availableDates });
  } catch (error) {
    console.error('API Error in get_allfood:', error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
}