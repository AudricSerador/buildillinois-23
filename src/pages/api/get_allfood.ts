import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { diningHallTimes } from '@/utils/constants';
import { format, startOfDay, addDays, isSameDay, parse, isAfter } from 'date-fns';
import { FoodInfo, Prisma, Review } from '@prisma/client';

const getCurrentCSTTime = (): Date => new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));

const parseFormattedDate = (dateString: string): Date => parse(dateString, 'EEEE, MMMM d, yyyy', new Date());

const parseTime = (time: string): Date => {
  const [hours, minutes] = time.slice(0, -2).split(':').map(Number);
  const isPM = time.slice(-2) === 'PM';
  const date = new Date();
  date.setHours(isPM && hours !== 12 ? hours + 12 : hours, minutes, 0, 0);
  return date;
};

const isNowBetween = (startTime: string, endTime: string, currentTime: Date): boolean => {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  return currentTime >= start && currentTime <= end;
};

const getServingStatus = (mealEntries: any[], currentTime: Date): string | string[] => {
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
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { page, pageSize, sortFields, diningHall, mealType, searchTerm, dateServed, allergens, preferences, serving, ratingFilter } = req.query;

  console.log('API: get_allfood called with params:', req.query);

  try {
    const pageNumber = parseInt(page as string) || 1;
    const pageSizeNumber = parseInt(pageSize as string) || 10;

    let parsedSortFields;
    try {
      parsedSortFields = JSON.parse(sortFields as string);
    } catch (error) {
      console.error('Error parsing sortFields:', error);
      parsedSortFields = [];
    }

    console.log('API: Parsed sort fields:', parsedSortFields);

    let orderBy: Prisma.FoodInfoOrderByWithRelationInput[] = [];

    // Add rating-based sorting if "rated only" is selected
    if (ratingFilter === 'rated_only') {
      orderBy.push(
        { Review: { _count: 'desc' } },
        {
          Review: {
            _count: 'desc'
          }
        }
      );
    }

    // Add other sort fields
    orderBy = orderBy.concat(parsedSortFields.map((field: { field: string; order: 'asc' | 'desc' }) => ({
      [field.field]: field.order
    })));

    let where: Prisma.FoodInfoWhereInput = {
      ...(diningHall && { mealEntries: { some: { diningHall: diningHall as string } } }),
      ...(mealType && { mealEntries: { some: { mealType: mealType as string } } }),
      ...(searchTerm && { 
        name: { contains: searchTerm as string, mode: 'insensitive' as Prisma.QueryMode }
      }),
      ...(dateServed && { mealEntries: { some: { dateServed: dateServed as string } } }),
      ...(allergens && (allergens as string).split(',').length > 0 && { 
        allergens: { notIn: (allergens as string).split(',') } 
      }),
      ...(preferences && { preferences: { contains: preferences as string } }),
    };

    // Apply rating filter
    if (ratingFilter === 'rated_only') {
      where.Review = {
        some: {}  // This ensures at least one review exists
      };
    }

    console.log('API: Where clause:', where);

    const foodCount = await prisma.FoodInfo.count({ where });

    console.log(`API: Found ${foodCount} food items after applying filters`);

    const food = await prisma.FoodInfo.findMany({
      where,
      include: { 
        mealEntries: true,
        Review: true,
      },
      orderBy,
      skip: Math.min((pageNumber - 1) * pageSizeNumber, foodCount),
      take: pageSizeNumber,
    });

    console.log(`API: Returning ${food.length} food items for page ${pageNumber}`);

    const currentTime = getCurrentCSTTime();
    const processedFood = food.map(item => {
      const servingStatus = getServingStatus(item.mealEntries, currentTime);
      const reviews = item.Review;
      console.log(`Processing food item: ${item.name}, Reviews:`, reviews);

      const totalScore = reviews.reduce((sum, review) => {
        const score = review.rating === 'good' ? 100 : review.rating === 'mid' ? 50 : 0;
        console.log(`Review rating: ${review.rating}, Score: ${score}`);
        return sum + score;
      }, 0);

      const averageRating = reviews.length > 0 ? totalScore / reviews.length / 100 : 0;
      console.log(`Total score: ${totalScore}, Average rating: ${averageRating}`);

      return { 
        ...item, 
        servingStatus, 
        reviewSummary: {
          count: reviews.length,
          averageRating: averageRating
        }
      };
    });

    console.log('Processed food items:', processedFood.map(item => ({
      id: item.id,
      name: item.name,
      reviewSummary: item.reviewSummary
    })));

    const filteredFood = serving
      ? processedFood.filter((item: any) => {
          if (serving === 'now') return item.servingStatus === 'now';
          if (serving === 'later') return item.servingStatus === 'later';
          if (Array.isArray(item.servingStatus)) return item.servingStatus.includes(serving as string);
          return false;
        })
      : processedFood;

    const allDates = new Set<string>();
    filteredFood.forEach((item: any) => {
      if (Array.isArray(item.servingStatus)) {
        item.servingStatus.forEach((date: string) => allDates.add(date));
      }
    });

    const availableDates = Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const totalPages = Math.ceil(foodCount / pageSizeNumber);
    res.status(200).json({ 
      foodItems: filteredFood, 
      totalPages: totalPages,
      currentPage: pageNumber,
      totalItems: foodCount,
      availableDates 
    });
  } catch (error) {
    console.error('API Error in get_allfood:', error);
    console.error('Stack trace:', (error as Error).stack);
    res.status(500).json({ error: 'An error occurred while fetching data', details: (error as Error).message });
  }
}