import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { reviewId } = req.body;

    try {
      const review = await prisma.review.update({
        where: { id: reviewId },
        data: {
          likes: {
            increment: 1,
          },
        },
      });

      res.status(200).json({ success: true, data: review });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

export default handler;
