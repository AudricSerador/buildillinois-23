import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { foodId } = req.query;

  if (!foodId || typeof foodId !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid foodId' });
  }

  try {
    const images = await prisma.foodImage.findMany({
      where: {
        foodId,
      },
    });

    res.status(200).json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch images', error });
  }
}
