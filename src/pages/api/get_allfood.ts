import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { simplifiedDiningHallTimes, FoodItem } from '@/utils/constants';
import { format, parse, isEqual } from 'date-fns';
import { Prisma } from '@prisma/client';

type DiningHall = keyof typeof simplifiedDiningHallTimes;
type MealType<T extends DiningHall> = keyof typeof simplifiedDiningHallTimes[T];

const getCurrentCSTTime = (): Date => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));
};

const currentTime = getCurrentCSTTime();
const currentTimeString = format(currentTime, 'HH:mm');

const isWithinRange = (time: string, start: string, end: string): boolean => {
  const buffer = 15; // 15 minutes buffer
  const timeMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
  const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]) - buffer;
  const endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]) + buffer;
  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
};

const parseTime = (time: string): Date => {
  const [timePart, modifier] = time.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  } else if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  const parsedTime = new Date();
  parsedTime.setHours(hours, minutes, 0, 0);
  return parsedTime;
};

const isNowBetween = (startTime: string, endTime: string, currentTime: Date): boolean => {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  return currentTime >= start && currentTime <= end;
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
  fiber: number;
  sugars: number;
  protein: number;
  calciumDV: number;
  ironDV: number;
  mealEntries: {
    id: number;
    diningHall: string;
    diningFacility: string;
    mealType: string;
    dateServed: string;
    foodId: string;
  }[];
  Review: {
    id: number;
    createdAt: Date;
    userId: string;
    foodId: string;
    rating: string;
    text: string | null;
    likes: number;
  }[];
  FoodImage: {
    id: number;
    created_at: Date;
    userId: string;
    foodId: string;
    url: string;
    description: string | null;
    likes: number;
  }[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { page, pageSize, sortFields, diningHall, mealType, searchTerm, dateServed, allergens, preferences, serving, ratingFilter } = req.query;

  try {
    const pageNumber = parseInt(page as string) || 1;
    const pageSizeNumber = parseInt(pageSize as string) || 10;

    let parsedSortFields: { field: string; order: 'asc' | 'desc' }[] = [];
    if (sortFields) {
      try {
        parsedSortFields = JSON.parse(sortFields as string);
      } catch (error) {
        // Error parsing sortFields
      }
    }

    const currentTime = getCurrentCSTTime();
    const today = format(currentTime, 'EEEE, MMMM d, yyyy');
    const currentTimeString = format(currentTime, 'HH:mm');

    let foodQuery: any = {
      include: {
        Review: true,
        FoodImage: {
          take: 1,
          orderBy: { likes: 'desc' }
        },
        mealEntries: true
      },
      where: {
        mealEntries: {
          some: {}
        }
      }
    };

    if (serving === 'now' || serving === 'later') {
      foodQuery.where.mealEntries.some.dateServed = today;
    } else if (serving) {
      foodQuery.where.mealEntries.some.dateServed = serving as string;
    }

    if (diningHall) {
      if (diningHall === 'all_dining_halls') {
        foodQuery.where.mealEntries = {
          ...foodQuery.where.mealEntries,
          some: {
            ...foodQuery.where.mealEntries?.some,
            diningHall: {
              in: ['Ikenberry Dining Center (Ike)', 'Illinois Street Dining Center (ISR)', 
                   'Pennsylvania Avenue Dining Hall (PAR)', 'Lincoln Avenue Dining Hall (Allen)', 
                   'Field of Greens (LAR)']
            }
          }
        };
      } else if (diningHall === 'all_dining_shops') {
        foodQuery.where.mealEntries = {
          ...foodQuery.where.mealEntries,
          some: {
            ...foodQuery.where.mealEntries?.some,
            diningHall: {
              notIn: ['Ikenberry Dining Center (Ike)', 'Illinois Street Dining Center (ISR)', 
                      'Pennsylvania Avenue Dining Hall (PAR)', 'Lincoln Avenue Dining Hall (Allen)', 
                      'Field of Greens (LAR)', '']
            }
          }
        };
      } else {
        foodQuery.where.mealEntries = {
          ...foodQuery.where.mealEntries,
          some: {
            ...foodQuery.where.mealEntries?.some,
            diningHall: diningHall as string
          }
        };
      }
    }

    if (mealType) {
      foodQuery.where.mealEntries = {
        ...foodQuery.where.mealEntries,
        some: {
          ...foodQuery.where.mealEntries?.some,
          mealType: mealType as string
        }
      };
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

    // Get all food items without pagination
    let allFoodItems = await prisma.foodInfo.findMany({
      ...foodQuery,
      include: {
        mealEntries: true,
        Review: true,
        FoodImage: true
      }
    }) as unknown as ExtendedFoodInfo[];

    // Process and filter food items
    let processedFood = allFoodItems.map((item: ExtendedFoodInfo) => {
      let servingStatus = 'not_available';
      if (serving === 'now' || serving === 'later') {
        const relevantEntries = item.mealEntries?.filter((entry: { dateServed: string }) => entry.dateServed === today) || [];
        for (const entry of relevantEntries) {
          const diningHall = entry.diningHall as DiningHall;
          const mealType = entry.mealType as MealType<typeof diningHall>;

          if (simplifiedDiningHallTimes[diningHall] && simplifiedDiningHallTimes[diningHall][mealType]) {
            const mealTimes = simplifiedDiningHallTimes[diningHall][mealType];
            if (serving === 'now' && isWithinRange(currentTimeString, mealTimes.start, mealTimes.end)) {
              servingStatus = 'now';
              break;
            } else if (serving === 'later' && currentTimeString < mealTimes.end) {
              servingStatus = 'later';
              break;
            }
          }
        }
      } else if (serving) {
        servingStatus = 'available';
      }

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

    // Filter based on serving status
    if (serving === 'now') {
      processedFood = processedFood.filter(item => item.servingStatus === 'now');
    } else if (serving === 'later') {
      processedFood = processedFood.filter(item => item.servingStatus === 'later');
    }

    // Apply pagination after processing and filtering
    const totalCount = processedFood.length;
    const startIndex = (pageNumber - 1) * pageSizeNumber;
    const endIndex = startIndex + pageSizeNumber;
    const paginatedFood = processedFood.slice(startIndex, endIndex);

    const totalPages = Math.ceil(totalCount / pageSizeNumber);

    const allMealEntries = await prisma.mealDetails.findMany({
      select: { dateServed: true },
      distinct: ['dateServed'],
    });

    const availableDates = allMealEntries
      .map(entry => entry.dateServed)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    res.status(200).json({ 
      foodItems: paginatedFood, 
      totalPages: totalPages,
      currentPage: pageNumber,
      totalItems: totalCount,
      availableDates: availableDates
    });

  } catch (error) {
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