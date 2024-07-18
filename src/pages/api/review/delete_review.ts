import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Review id is required' });
    }

    try {
      const deletedReview = await prisma.review.delete({
        where: {
          id: id,
        },
      });

      res.status(200).json({ success: true, data: deletedReview });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

export default handler;
