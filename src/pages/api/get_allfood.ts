import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { diningHallTimes } from '@/utils/constants';
import { format, parse, isWithinInterval, set, addDays, compareAsc, isFuture } from 'date-fns';
import { Prisma } from '@prisma/client';

const getCurrentCSTTime = (): Date => {
  const now = new Date();
  // Get the time zone offset in minutes
  const cstOffset = -6 * 60; // CST is UTC-6
  const localOffset = now.getTimezoneOffset();
  
  // Calculate the difference between local time and CST
  const diffMinutes = localOffset - cstOffset;
  
  // Adjust the time
  now.setMinutes(now.getMinutes() + diffMinutes);
  
  console.log('Current local time:', new Date().toLocaleString());
  console.log('Current CST time:', now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  return now;
};

const parseTime = (timeString: string, baseDate: Date): Date => {
  const [time, period] = timeString.split(' ');
  const [hoursStr, minutesStr] = time.split(':');
  const hours = parseInt(hoursStr);
  const minutes = parseInt(minutesStr);

  return set(baseDate, {
    hours: period === 'PM' && hours !== 12 ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours,
    minutes: minutes,
    seconds: 0,
    milliseconds: 0
  });
};

const isNowBetween = (startTime: string, endTime: string, currentTime: Date): boolean => {
  let start = parseTime(startTime, currentTime);
  let end = parseTime(endTime, currentTime);

  console.log('Start time:', format(start, 'yyyy-MM-dd HH:mm:ss'));
  console.log('End time:', format(end, 'yyyy-MM-dd HH:mm:ss'));
  console.log('Current time:', format(currentTime, 'yyyy-MM-dd HH:mm:ss'));

  // If end time is before start time, it means the interval crosses midnight
  if (end < start) {
    end = addDays(end, 1); // Add one day to the end time
    if (currentTime < start) {
      currentTime = addDays(currentTime, 1); // If current time is before start, add one day to it as well
    }
  }

  console.log(`Checking if ${format(currentTime, 'yyyy-MM-dd HH:mm:ss')} is between ${format(start, 'yyyy-MM-dd HH:mm:ss')} and ${format(end, 'yyyy-MM-dd HH:mm:ss')}`);
  return currentTime >= start && currentTime <= end;
};

const getServingStatus = (mealEntries: any[], currentTime: Date): string | string[] => {
  console.log('Getting serving status for:', mealEntries);
  console.log('Current time:', format(currentTime, 'yyyy-MM-dd HH:mm:ss'));
  const currentDateString = format(currentTime, 'EEEE, MMMM d, yyyy');
  console.log('Current date string:', currentDateString);
  let isServedNow = false;
  let isServedLater = false;
  let futureDates = new Set<string>();

  for (const entry of mealEntries) {
    console.log('Checking meal entry:', entry);
    const entryDate = parse(entry.dateServed, 'EEEE, MMMM d, yyyy', new Date());
    if (format(entryDate, 'yyyy-MM-dd') === format(currentTime, 'yyyy-MM-dd')) {
      console.log('Entry is for today');
      const mealTimes = diningHallTimes[entry.diningHall]?.[entry.mealType];
      if (!mealTimes) {
        console.log('No meal times found for', entry.diningHall, entry.mealType);
        continue;
      }
      console.log('Meal times:', mealTimes);

      const [start, end] = mealTimes.split(" - ");

      if (isNowBetween(start, end, currentTime)) {
        console.log('Serving now');
        return 'now'; // If serving now, immediately return
      } else if (parseTime(start, currentTime) > currentTime) {
        console.log('Serving later');
        isServedLater = true;
      }
    } else if (isFuture(entryDate)) {
      console.log('Future date:', entry.dateServed);
      futureDates.add(entry.dateServed);
    }
  }

  if (isServedLater) return 'later';
  if (futureDates.size > 0) return Array.from(futureDates);
  console.log('Not available');
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

    let parsedSortFields: { field: string; order: 'asc' | 'desc' }[] = [];
    if (sortFields) {
      try {
        parsedSortFields = JSON.parse(sortFields as string);
      } catch (error) {
        console.error('Error parsing sortFields:', error);
        // Instead of setting to an empty array, we'll keep the default value
      }
    }

    console.log('API: Parsed sort fields:', parsedSortFields);

    let where: Prisma.FoodInfoWhereInput = {};
    let orderBy: Prisma.FoodInfoOrderByWithRelationInput[] = [];

    if (ratingFilter === 'rated_only') {
      where = {
        Review: {
          some: {} // This ensures that there is at least one review
        }
      };
      orderBy = [
        { Review: { _count: 'desc' } },
      ];
    }

    // Add conditions for all filters, even if they're empty
    where.mealEntries = {
      some: {
        diningHall: diningHall as string || undefined,
        mealType: mealType as string || undefined,
        dateServed: dateServed as string || undefined,
      }
    };

    if (searchTerm) {
      where.name = { contains: searchTerm as string, mode: 'insensitive' as Prisma.QueryMode };
    }

    if (allergens && (allergens as string).split(',').length > 0) {
      where.allergens = { notIn: (allergens as string).split(',') };
    }

    if (preferences) {
      where.preferences = { contains: preferences as string };
    }

    // Add other sort fields only if parsedSortFields is not empty
    if (parsedSortFields.length > 0) {
      orderBy = orderBy.concat(parsedSortFields.map((field) => ({
        [field.field]: field.order
      })));
    }

    const currentTime = getCurrentCSTTime();
    console.log('Current CST time used for calculations:', format(currentTime, 'yyyy-MM-dd HH:mm:ss'));

    // Fetch all meal entries to calculate available dates
    const allMealEntries = await prisma.mealDetails.findMany({
      select: { dateServed: true },
      distinct: ['dateServed'],
    });

    // Calculate available dates in chronological order
    const availableDates = allMealEntries
      .map(entry => entry.dateServed)
      .map(dateString => parse(dateString, 'EEEE, MMMM d, yyyy', new Date()))
      .sort(compareAsc)
      .map(date => format(date, 'EEEE, MMMM d, yyyy'));

    // Get total count
    const totalCount = await prisma.foodInfo.count({ where });

    console.log(`API: Total count of matching items: ${totalCount}`);

    // Fetch food items
    const food = await prisma.foodInfo.findMany({
      where,
      include: { 
        mealEntries: true,
        Review: true,
        FoodImage: {
          take: 1,
          orderBy: { likes: 'desc' }
        },
      },
      orderBy,
      skip: (pageNumber - 1) * pageSizeNumber,
      take: pageSizeNumber,
    });

    const processedFood = food.map((item) => ({
      ...item,
      reviewSummary: {
        count: item.Review.length,
        averageRating: calculateAverageRating(item.Review)
      },
      topImage: item.FoodImage[0] || null
    }));

    // Sort processed food by review count (descending) and then by average rating (descending)
    processedFood.sort((a, b) => {
      if (b.reviewSummary.count !== a.reviewSummary.count) {
        return b.reviewSummary.count - a.reviewSummary.count;
      }
      return b.reviewSummary.averageRating - a.reviewSummary.averageRating;
    });

    const totalPages = Math.ceil(totalCount / pageSizeNumber);

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

// Helper function to calculate average rating
function calculateAverageRating(reviews: any[]): number {
  if (reviews.length === 0) return 0;
  const totalScore = reviews.reduce((sum, review) => {
    return sum + (review.rating === 'good' ? 100 : review.rating === 'mid' ? 50 : 0);
  }, 0);
  return totalScore / reviews.length / 100;
}