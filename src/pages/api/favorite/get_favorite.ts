import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId, foodId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    try {
      if (foodId) {
        const favorite = await prisma.favorite.findUnique({
          where: {
            userId_foodId: {
              userId: userId as string,
              foodId: foodId as string,
            },
          },
          include: {
            food: true,
          },
        });

        if (favorite) {
          res.status(200).json({ success: true, data: favorite });
        } else {
          res.status(404).json({ success: false, message: 'Favorite not found' });
        }
      } else {
        const favorites = await prisma.favorite.findMany({
          where: {
            userId: userId as string,
          },
          include: {
            food: true,
          },
        });

        res.status(200).json({ success: true, data: favorites });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

export default handler;
