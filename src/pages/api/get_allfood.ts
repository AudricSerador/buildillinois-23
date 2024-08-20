import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { diningHallTimes, FoodItem } from '@/utils/constants';
import { format, parse, isWithinInterval, set, addDays, compareAsc, isFuture } from 'date-fns';
import { Prisma } from '@prisma/client';

const getCurrentCSTTime = (): Date => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
};

const parseTime = (timeString: string): Date => {
  const [time, period] = timeString.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(period === 'PM' && hours !== 12 ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};

const isNowBetween = (startTime: string, endTime: string, currentTime: Date): boolean => {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  return currentTime >= start && currentTime <= end;
};

const getServingStatus = (mealEntry: any, currentTime: Date): string => {
  const currentDateString = format(currentTime, 'EEEE, MMMM d, yyyy');

  const entryDate = parse(mealEntry.dateServed, 'EEEE, MMMM d, yyyy', new Date());
  if (format(entryDate, 'yyyy-MM-dd') === format(currentTime, 'yyyy-MM-dd')) {
    const mealTimes = diningHallTimes[mealEntry.diningHall]?.[mealEntry.mealType];
    if (!mealTimes) {
      return 'not_available';
    }

    const [start, end] = mealTimes.split(" - ");

    if (isNowBetween(start, end, currentTime)) {
      return 'now';
    } else if (parseTime(start) > currentTime) {
      return 'later';
    }
  } else if (isFuture(entryDate)) {
    return 'later';
  }

  return 'not_available';
};

// Update the ExtendedFoodInfo interface
interface ExtendedFoodInfo {
  id: string;
  name: string;
  servingSize: string;
  ingredients: string;
  allergens: string;
  preferences: string;
  calories: number;
  caloriesFat: number;
  totalFat: number;
  saturatedFat: number;
  transFat: number;
  cholesterol: number;
  sodium: number;
  totalCarbohydrates: number;
  dietaryFiber: number;
  sugars: number;
  protein: number;
  vitaminDV: number;
  calciumDV: number;
  ironDV: number;
  mealEntries: any[]; // Replace 'any' with a more specific type if possible
  Review: any[]; // Replace 'any' with a more specific type if possible
  FoodImage: any[]; // Replace 'any' with a more specific type if possible
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { page, pageSize, sortFields, diningHall, mealType, searchTerm, dateServed, allergens, preferences, serving, ratingFilter, includeUnavailable } = req.query;

  try {
    const pageNumber = parseInt(page as string) || 1;
    const pageSizeNumber = parseInt(pageSize as string) || 10;
    const includeUnavailableFood = includeUnavailable === 'true';

    let parsedSortFields: { field: string; order: 'asc' | 'desc' }[] = [];
    if (sortFields) {
      try {
        parsedSortFields = JSON.parse(sortFields as string);
      } catch (error) {
        console.error('Error parsing sortFields:', error);
      }
    }

    const currentTime = getCurrentCSTTime();
    const todayDate = format(currentTime, 'EEEE, MMMM d, yyyy');

    let targetDate = dateServed as string || (serving as string);
    if (serving === 'now' || serving === 'later') {
      targetDate = todayDate;
    }

    let mealDetailsQuery: any = {};

    // Only apply date filter if targetDate is specified
    if (targetDate) {
      mealDetailsQuery.where = {
        dateServed: targetDate
      };
    }

    if (diningHall) {
      mealDetailsQuery.where = {
        ...mealDetailsQuery.where,
        diningHall: diningHall as string
      };
    }
    if (mealType) {
      mealDetailsQuery.where = {
        ...mealDetailsQuery.where,
        mealType: mealType as string
      };
    }

    const mealDetails = await prisma.mealDetails.findMany(mealDetailsQuery);
    const foodIds = [...new Set(mealDetails.map(md => md.foodId))];

    let foodQuery: any = {
      include: {
        Review: true,
        FoodImage: {
          take: 1,
          orderBy: { likes: 'desc' }
        },
        mealEntries: true
      }
    };

    // Only filter by foodIds if we have a date filter
    if (targetDate) {
      foodQuery.where = { id: { in: foodIds } };
    }

    if (searchTerm) {
      foodQuery.where = {
        ...foodQuery.where,
        name: { contains: searchTerm as string, mode: 'insensitive' }
      };
    }
    if (allergens) {
      const allergenList = (allergens as string).split(',');
      foodQuery.where = {
        ...foodQuery.where,
        allergens: { not: { contains: allergenList.join(',') } }
      };
    }
    if (preferences) {
      foodQuery.where = {
        ...foodQuery.where,
        preferences: { contains: preferences as string }
      };
    }
    if (ratingFilter === 'rated_only') {
      foodQuery.where = {
        ...foodQuery.where,
        Review: { some: {} }
      };
    }

    // Add sorting logic
    let orderBy: Prisma.FoodInfoOrderByWithRelationInput[] = [];
    if (parsedSortFields.length > 0) {
      orderBy = parsedSortFields.map((field) => ({
        [field.field]: field.order
      }));
    }
    if (orderBy.length > 0) {
      foodQuery.orderBy = orderBy;
    }

    let foodItems: any[] = await prisma.foodInfo.findMany(foodQuery);

    let processedFood = foodItems.map((item: ExtendedFoodInfo) => {
      const servingStatuses = item.mealEntries.map((entry: any) => getServingStatus(entry, currentTime));
      const servingStatus = servingStatuses.includes('now') ? 'now' : 
                            servingStatuses.includes('later') ? 'later' : 'not_available';

      return {
        ...item,
        mealEntries: item.mealEntries,
        reviewSummary: {
          count: item.Review.length,
          averageRating: calculateAverageRating(item.Review)
        },
        topImage: item.FoodImage[0] || null,
        servingStatus
      };
    });

    // Only sort by review count and rating if ratingFilter is 'rated_only'
    if (ratingFilter === 'rated_only') {
      processedFood.sort((a, b) => {
        if (b.reviewSummary.count !== a.reviewSummary.count) {
          return b.reviewSummary.count - a.reviewSummary.count;
        }
        return b.reviewSummary.averageRating - a.reviewSummary.averageRating;
      });
    }

    // Filter based on serving status
    if (serving === 'now') {
      processedFood = processedFood.filter(item => item.servingStatus === 'now');
    } else if (serving === 'later') {
      processedFood = processedFood.filter(item => item.servingStatus === 'later');
    }

    const totalCount = processedFood.length;
    const totalPages = Math.ceil(totalCount / pageSizeNumber);

    processedFood = processedFood.slice((pageNumber - 1) * pageSizeNumber, pageNumber * pageSizeNumber);

    const allMealEntries = await prisma.mealDetails.findMany({
      select: { dateServed: true },
      distinct: ['dateServed'],
    });

    const availableDates = allMealEntries
      .map(entry => entry.dateServed)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      res.status(200).json({ 
      foodItems: processedFood, 
      totalPages: totalPages,
      currentPage: pageNumber,
      totalItems: totalCount,
      availableDates: availableDates
    });

  } catch (error) {
    console.error('Error in get_allfood:', error);
    res.status(500).json({ error: 'An error occurred while fetching food data' });
  }
}
function calculateAverageRating(reviews: any[]): number {
  if (reviews.length === 0) return 0;
  const totalScore = reviews.reduce((sum, review) => {
    return sum + (review.rating === 'good' ? 100 : review.rating === 'mid' ? 50 : 0);
  }, 0);
  return totalScore / reviews.length / 100;
}