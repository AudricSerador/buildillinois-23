import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId, foodId } = req.query;

    if (!userId && !foodId) {
      return res.status(400).json({ success: false, message: 'userId or foodId is required' });
    }

    try {
      const reviews = await prisma.Review.findMany({
        where: {
          ...(userId ? { userId: userId as string } : {}),
          ...(foodId ? { foodId: foodId as string } : {}),
        },
      });

      res.status(200).json({ success: true, data: reviews });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

export default handler;
