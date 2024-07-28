import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId, type } = req.query;

    try {
      if (!userId || !type) {
        return res.status(400).json({ success: false, message: 'Missing userId or type' });
      }

      const recommendation = await prisma.Recommendation.findUnique({
        where: {
          userId_type: {
            userId: userId as string,
            type: type as string,
          },
        },
      });

      if (recommendation) {
        const foodIds = recommendation.foodIds.split(',');
        const foodInfoList = await prisma.foodInfo.findMany({
          where: {
            id: {
              in: foodIds,
            },
          },
          include: {
            mealEntries: true,
          },
        });

        res.status(200).json({ success: true, data: foodInfoList });
      } else {
        res.status(404).json({ success: false, message: 'Recommendation not found' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
