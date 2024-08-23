import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { simplifiedDiningHallTimes } from '@/utils/constants';
import { format, addDays, isAfter } from 'date-fns';
import { FoodInfo, User, mealDetails, Review, FoodImage } from '@prisma/client';

type DiningHall = keyof typeof simplifiedDiningHallTimes;
type MealType<T extends DiningHall> = keyof typeof simplifiedDiningHallTimes[T];

const getCurrentCSTTime = (): Date => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));
};

const isWithinRange = (time: string, start: string, end: string): boolean => {
  const buffer = 15; // 15 minutes buffer
  const timeMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
  const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]) - buffer;
  const endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]) + buffer;
  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
};

async function getFoodItemsForDate(date: string, user: User) {
  const diningHallMap = {
    'Ike': 'Ikenberry Dining Center (Ike)',
    'ISR': 'Illinois Street Dining Center (ISR)',
    'Allen/LAR': ['Lincoln Avenue Dining Hall (Allen)', 'Field of Greens (LAR)'],
    'PAR': 'Pennsylvania Avenue Dining Hall (PAR)'
  };

  let foodQuery: any = {
    include: {
      mealEntries: {
        where: {
          dateServed: date,
        },
      },
      Review: true,
      FoodImage: {
        take: 1,
        orderBy: { likes: 'desc' }
      },
    },
    where: {
      mealEntries: {
        some: {
          dateServed: date,
        }
      },
    }
  };

  if (user.locations) {
    const userLocations = user.locations.split(',').map(l => l.trim());
    const fullDiningHallNames = userLocations.flatMap(loc => {
      const mapped = diningHallMap[loc as keyof typeof diningHallMap];
      return Array.isArray(mapped) ? mapped : [mapped || loc];
    });
    foodQuery.where.mealEntries.some.diningHall = {
      in: fullDiningHallNames,
    };
  }

  let foodItems = await prisma.foodInfo.findMany(foodQuery);

  return foodItems;
}

type ExtendedFoodInfo = FoodInfo & {
  mealEntries: mealDetails[];
  Review: Review[];
  FoodImage: FoodImage[];
  finalScore?: number;
};

async function generateRecommendations(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const currentTime = getCurrentCSTTime();
  let today = format(currentTime, 'EEEE, MMMM d, yyyy');
  let tomorrow = format(addDays(currentTime, 1), 'EEEE, MMMM d, yyyy');

  let todayFoodItems = await getFoodItemsForDate(today, user);

  let foodItems = todayFoodItems;

  if (foodItems.length < 20) {
    let tomorrowFoodItems = await getFoodItemsForDate(tomorrow, user);
    foodItems = [...foodItems, ...tomorrowFoodItems];
  }

  let filteredItems = foodItems.filter(item => {
    if (user.allergies) {
      const userAllergens = user.allergies.split(',').map(a => a.trim().toLowerCase());
      if (userAllergens.some(allergen => item.allergens.toLowerCase().includes(allergen))) {
        return false;
      }
    }

    if (user.preferences) {
      const userPreferences = user.preferences.split(',').map(p => p.trim().toLowerCase());
      if (!userPreferences.some(pref => item.preferences.toLowerCase().includes(pref))) {
        return false;
      }
    }

    return true;
  });

  const scoredFoodItems = (filteredItems as ExtendedFoodInfo[]).map((food) => ({
    ...food,
    finalScore: calculateFinalScore(food, user),
  }));

  const recommendations = scoredFoodItems
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 20);

  const processedRecommendations = recommendations.map((item: ExtendedFoodInfo) => {
    const futureDates = item.mealEntries
      .filter(entry => isAfter(new Date(entry.dateServed), new Date()))
      .map(entry => entry.dateServed)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return {
      ...item,
      reviewSummary: {
        count: item.Review.length,
        averageRating: calculateAverageRating(item.Review)
      },
      topImage: item.FoodImage[0] || null,
      futureDates: futureDates,
      servingStatus: determineServingStatus(item.mealEntries)
    };
  });

  return processedRecommendations;
}

function determineServingStatus(mealEntries: mealDetails[]): string {
  const currentTime = getCurrentCSTTime();
  const currentTimeString = format(currentTime, 'HH:mm');
  const today = format(currentTime, 'EEEE, MMMM d, yyyy');

  for (const entry of mealEntries) {
    if (entry.dateServed === today) {
      const diningHall = entry.diningHall as DiningHall;
      const mealType = entry.mealType as MealType<typeof diningHall>;

      if (simplifiedDiningHallTimes[diningHall] && simplifiedDiningHallTimes[diningHall][mealType]) {
        const mealTimes = simplifiedDiningHallTimes[diningHall][mealType];
        if (isWithinRange(currentTimeString, mealTimes.start, mealTimes.end)) {
          return 'now';
        } else if (currentTimeString < mealTimes.end) {
          return 'later';
        }
      }
    }
  }

  return mealEntries.length > 0 ? 'future' : 'not_available';
}

function calculateFinalScore(food: ExtendedFoodInfo, user: User): number {
  let score = 0;

  const nutritionalScore = calculateNutritionalScore(food, user);
  score += nutritionalScore * 0.5;

  const userPreferences = user.preferences.split(',').map(p => p.trim().toLowerCase());
  const preferenceScore = userPreferences.filter(pref => food.preferences.toLowerCase().includes(pref)).length / userPreferences.length;
  score += preferenceScore * 0.3;

  const userLocations = user.locations.split(',').map(l => l.trim().toLowerCase());
  const locationScore = food.mealEntries.some((entry: any) => 
    userLocations.some(userLoc => 
      entry.diningHall.toLowerCase().includes(userLoc) ||
      userLoc.includes(entry.diningHall.toLowerCase())
    )
  ) ? 1 : 0;
  score += locationScore * 0.2;

  return score;
}

function calculateNutritionalScore(food: FoodInfo, user: User): number {
  switch (user.goal) {
    case 'bulk':
      return (
        (Math.min(food.calories / 500, 1) * 0.4) +
        (Math.min(food.protein / 30, 1) * 0.4) +
        (Math.min(food.totalCarbohydrates / 75, 1) * 0.2)
      );
    case 'lose_weight':
      return (
        (Math.max(0, (500 - food.calories) / 500) * 0.4) +
        (Math.min(food.protein / 30, 1) * 0.3) +
        (Math.min(food.fiber / 10, 1) * 0.2) +
        (Math.max(0, (20 - food.sugars) / 20) * 0.1)
      );
    case 'eat_healthy':
      return (
        (Math.min(food.protein / 30, 1) * 0.25) +
        (Math.min(food.fiber / 10, 1) * 0.25) +
        ((food.calciumDV + food.ironDV) / 200 * 0.2) +
        (Math.max(0, (20 - food.sugars) / 20) * 0.15) +
        (Math.max(0, (30 - food.saturatedFat) / 30) * 0.15)
      );
    default:
      return 0.5;
  }
}

function calculateAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const totalScore = reviews.reduce((sum, review) => {
    return sum + (review.rating === 'good' ? 100 : review.rating === 'mid' ? 50 : 0);
  }, 0);
  return totalScore / reviews.length / 100;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    try {
      const recommendations = await generateRecommendations(userId);

      const response = {
        foodItems: recommendations,
        availableDates: Array.from(new Set(recommendations.flatMap(item => item.futureDates)))
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}