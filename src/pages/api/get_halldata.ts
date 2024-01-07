import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { FoodInfo } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, mealType, dateServed } = req.query;

  if (!id || !mealType || !dateServed) {
    return res.status(400).json({ error: 'Missing id or mealType in query parameters' });
  }

  try {
    const foodData = await prisma.foodInfo.findMany({
      where: {
        mealEntries: {
          some: {
            diningHall: id as string,
            mealType: mealType as string,
            dateServed: dateServed as string,
          },
        },
      },
      include: {
        mealEntries: true,
      },
    });

    const categorizedFoodData = foodData.reduce<Record<string, FoodInfo[]>>((acc, foodItem) => {
        foodItem.mealEntries
          .filter(meal => meal.diningHall === id)
          .forEach(meal => {
            if (!acc[meal.diningFacility]) {
              acc[meal.diningFacility] = [];
            }
            if (!acc[meal.diningFacility].some(item => item.id === foodItem.id)) {
              acc[meal.diningFacility].push(foodItem);
            }
          });
        return acc;
      }, {});
    
      const sortedCategorizedFoodData = Object.keys(categorizedFoodData)
      .sort()
      .reduce<Record<string, FoodInfo[]>>((acc, key) => {
        acc[key] = categorizedFoodData[key];
        return acc;
      }, {});

    return res.status(200).json(sortedCategorizedFoodData);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching dining hall food data' });
  }
}