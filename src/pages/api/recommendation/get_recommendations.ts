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

  // Handle locations
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

  console.log('Food query:', JSON.stringify(foodQuery, null, 2));

  let foodItems = await prisma.foodInfo.findMany(foodQuery);

  console.log('Found food items:', foodItems.length);

  return foodItems;
}

// Update the type for food items
type ExtendedFoodInfo = FoodInfo & {
  mealEntries: mealDetails[];
  Review: Review[];
  FoodImage: FoodImage[];
  finalScore?: number;
};

async function generateRecommendations(userId: string) {
  console.log('Starting recommendation generation for userId:', userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    console.log('User not found');
    throw new Error('User not found');
  }

  console.log('User data:', JSON.stringify(user, null, 2));

  const currentTime = getCurrentCSTTime();
  let today = format(currentTime, 'EEEE, MMMM d, yyyy');
  let tomorrow = format(addDays(currentTime, 1), 'EEEE, MMMM d, yyyy');

  console.log('Fetching food items for today:', today);
  let todayFoodItems = await getFoodItemsForDate(today, user);

  console.log('Total food items for today:', todayFoodItems.length);

  let foodItems = todayFoodItems;

  // If we don't have enough items for today, fetch tomorrow's items
  if (foodItems.length < 20) {
    console.log('Not enough items for today. Fetching items for tomorrow:', tomorrow);
    let tomorrowFoodItems = await getFoodItemsForDate(tomorrow, user);
    console.log('Total food items for tomorrow:', tomorrowFoodItems.length);
    
    foodItems = [...foodItems, ...tomorrowFoodItems];
  }

  console.log('Total food items before filtering:', foodItems.length);

  // Apply filters
  let filteredItems = foodItems.filter(item => {
    console.log(`Filtering item: ${item.name}`);
    console.log(`Item allergens: ${item.allergens}`);
    console.log(`Item preferences: ${item.preferences}`);

    // Filter out items with user's allergies
    if (user.allergies) {
      const userAllergens = user.allergies.split(',').map(a => a.trim().toLowerCase());
      console.log(`User allergens: ${userAllergens.join(', ')}`);
      if (userAllergens.some(allergen => item.allergens.toLowerCase().includes(allergen))) {
        console.log(`Item excluded due to allergens`);
        return false;
      }
    }

    // Filter for user's preferences
    if (user.preferences) {
      const userPreferences = user.preferences.split(',').map(p => p.trim().toLowerCase());
      console.log(`User preferences: ${userPreferences.join(', ')}`);
      if (!userPreferences.some(pref => item.preferences.toLowerCase().includes(pref))) {
        console.log(`Item excluded due to preferences`);
        return false;
      }
    }

    console.log(`Item included in filtered list`);
    return true;
  });

  console.log('Filtered food items:', filteredItems.length);

  const scoredFoodItems = (filteredItems as ExtendedFoodInfo[]).map((food) => ({
    ...food,
    finalScore: calculateFinalScore(food, user),
  }));

  // Sort and get top 20 recommendations
  const recommendations = scoredFoodItems
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 20);

  console.log('Final recommendations:', recommendations.length);
  console.log('Recommendation details:');
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec.name} - Score: ${rec.finalScore}`);
  });

  // Update the type annotation here
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

// Update the type annotation for the calculateFinalScore function
function calculateFinalScore(food: ExtendedFoodInfo, user: User): number {
  let score = 0;

  // Nutritional score based on user's goal
  const nutritionalScore = calculateNutritionalScore(food, user);
  score += nutritionalScore * 0.5; // 50% weight to nutritional score

  // Preference score
  const userPreferences = user.preferences.split(',').map(p => p.trim().toLowerCase());
  const preferenceScore = userPreferences.filter(pref => food.preferences.toLowerCase().includes(pref)).length / userPreferences.length;
  score += preferenceScore * 0.3; // 30% weight to preference score

  // Location score
  const userLocations = user.locations.split(',').map(l => l.trim().toLowerCase());
  const locationScore = food.mealEntries.some((entry: any) => 
    userLocations.some(userLoc => 
      entry.diningHall.toLowerCase().includes(userLoc) ||
      userLoc.includes(entry.diningHall.toLowerCase())
    )
  ) ? 1 : 0;
  score += locationScore * 0.2; // 20% weight to location score

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
      return 0.5; // Neutral score for unknown goals
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
      console.log('Generating recommendations for userId:', userId);
      const recommendations = await generateRecommendations(userId);
      console.log('Generated recommendations:', recommendations.length);

      // Format response similar to get_allfood.ts
      const response = {
        foodItems: recommendations,
        availableDates: Array.from(new Set(recommendations.flatMap(item => item.futureDates)))
      };

      console.log("Sending response:", JSON.stringify(response, null, 2));
      res.status(200).json(response);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}