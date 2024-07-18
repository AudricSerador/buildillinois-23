import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, foodId, rating, text } = req.body;

    if (!userId || !foodId || rating === undefined) {
      return res.status(400).json({ success: false, message: 'userId, foodId, and rating are required' });
    }

    try {
      const newReview = await prisma.review.create({
        data: {
          userId,
          foodId,
          rating,
          text,
        },
      });

      res.status(200).json({ success: true, data: newReview });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

export default handler;
