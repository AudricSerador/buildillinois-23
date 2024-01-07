import type { NextApiRequest, NextApiResponse } from "next";
import prisma from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query;

    if (!id) {
      const foodItems = await prisma.foodInfo.findMany();
      return res.status(200).json(foodItems);
    }

    const foodItem = await prisma.foodInfo.findUnique({
      where: { id: String(id) },
      include: { mealEntries: true }
    });

    if (!foodItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    return res.status(200).json(foodItem);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}