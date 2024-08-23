import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { simplifiedDiningHallTimes } from '@/utils/constants';
import { format } from 'date-fns';

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

async function generateRecommendations(userId: string) {
  console.log('Starting recommendation generation for userId:', userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    console.log('User not found');
    throw new Error('User not found');
  }

  console.log('User data:', user);

  const currentTime = getCurrentCSTTime();
  const today = format(currentTime, 'EEEE, MMMM d, yyyy');
  const currentTimeString = format(currentTime, 'HH:mm');

  const foodItems = await prisma.foodInfo.findMany({
    include: {
      mealEntries: {
        where: {
          dateServed: today,
        },
      },
    },
  });

  console.log('Total food items:', foodItems.length);

  // Filter food items that are serving now or later today
  let filteredFoodItems = foodItems.filter(food => {
    return food.mealEntries.some(entry => {
      const diningHall = entry.diningHall as keyof typeof simplifiedDiningHallTimes;
      const mealType = entry.mealType as keyof (typeof simplifiedDiningHallTimes)[typeof diningHall];
      
      if (simplifiedDiningHallTimes[diningHall] && simplifiedDiningHallTimes[diningHall][mealType]) {
        const mealTimes = simplifiedDiningHallTimes[diningHall][mealType];
        return isWithinRange(currentTimeString, mealTimes.start, mealTimes.end) || 
               currentTimeString < mealTimes.end;
      }
      return false;
    });
  });

  console.log('Food items serving now or later:', filteredFoodItems.length);

  // Filter out foods with user's allergens
  filteredFoodItems = filteredFoodItems.filter(food => 
    !user.allergies.split(',').some(allergen => 
      food.allergens.includes(allergen)
    )
  );

  console.log('Food items after allergen filtering:', filteredFoodItems.length);

// Filter based on dietary preferences
if (user.preferences) {
  const userPreferences = user.preferences.split(',').map(pref => pref.trim().toLowerCase());
  filteredFoodItems = filteredFoodItems.filter(food => 
    userPreferences.some(pref => 
      food.preferences.toLowerCase().includes(pref) ||
      food.ingredients.toLowerCase().includes(pref)
    )
  );
}

console.log('Food items after preference filtering:', filteredFoodItems.length);

// If no items match preferences, fall back to all items after allergen filtering
if (filteredFoodItems.length === 0) {
  console.log('No items match preferences, falling back to allergen-filtered items');
  filteredFoodItems = foodItems.filter(food => 
    !user.allergies.split(',').some(allergen => 
      food.allergens.includes(allergen)
    )
  );
}

  console.log('Food items after preference filtering:', filteredFoodItems.length);

  // Calculate scores
  const scoredFoodItems = filteredFoodItems.map(food => ({
    ...food,
    preferenceScore: calculatePreferenceScore(food, user),
    nutritionalScore: calculateNutritionalScore(food, user),
    locationScore: calculateLocationScore(food, user),
  }));

  // Calculate final score
  scoredFoodItems.forEach(food => {
    let finalScore;
    switch (user.goal) {
      case 'lose_weight':
        finalScore = food.preferenceScore * 0.3 + food.nutritionalScore * 0.5 + food.locationScore * 0.2;
        break;
      case 'bulk':
        finalScore = food.preferenceScore * 0.2 + food.nutritionalScore * 0.6 + food.locationScore * 0.2;
        break;
      case 'eat_healthy':
        finalScore = food.preferenceScore * 0.3 + food.nutritionalScore * 0.5 + food.locationScore * 0.2;
        break;
      default:
        finalScore = food.preferenceScore * 0.4 + food.nutritionalScore * 0.4 + food.locationScore * 0.2;
    }
    food.finalScore = finalScore;
  });

  // Sort and get top 20 recommendations
  const recommendations = scoredFoodItems
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 20);

  console.log('Final recommendations:', recommendations.length);
  return recommendations;
}

function calculatePreferenceScore(food: any, user: any) {
  if (!user.preferences) return 0.5;
  const userPreferences = user.preferences.split(',').map(pref => pref.trim().toLowerCase());
  const foodPreferences = food.preferences.toLowerCase();
  const foodIngredients = food.ingredients.toLowerCase();
  const matchingPreferences = userPreferences.filter(pref => 
    foodPreferences.includes(pref) || foodIngredients.includes(pref)
  );
  return matchingPreferences.length > 0 ? 1 : 0.5;
}

function calculateNutritionalScore(food: any, user: any) {
  switch (user.goal) {
    case 'lose_weight':
      return (500 - food.calories) / 500;
    case 'bulk':
      return food.protein / 50;
    case 'eat_healthy':
      return (food.fiber + food.protein) / (food.calories / 100);
    default:
      return 0.5;
  }
}

function calculateLocationScore(food: any, user: any) {
  if (!user.locations) return 1;
  const userLocations = user.locations.split(',');
  return userLocations.includes(food.mealEntries[0]?.diningHall) ? 1 : 0;
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
      res.status(200).json({ recommendations });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}