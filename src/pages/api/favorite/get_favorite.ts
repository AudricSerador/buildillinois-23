import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId, foodId } = req.query;

    try {
      const favorites = await prisma.favorite.findMany({
        where: {
          userId: userId as string | undefined,
          foodId: foodId as string | undefined,
        },
        include: {
          food: true,
        },
      });

      if (favorites.length > 0) {
        res.status(200).json({ success: true, data: favorites });
      } else {
        res.status(404).json({ success: false, message: 'No favorites found' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

export default handler;