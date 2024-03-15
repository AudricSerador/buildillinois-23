import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, foodId } = req.body;

    try {
      const newFavorite = await prisma.favorite.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          food: {
            connect: {
              id: foodId,
            },
          },
        },
      });

      res.status(200).json({ success: true, data: newFavorite });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

export default handler;