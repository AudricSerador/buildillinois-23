import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure this is a GET request
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed. This endpoint only supports GET requests.' });
  }

  const { foodIds } = req.query;

  if (!foodIds) {
    return res.status(400).json({ success: false, message: 'foodIds is required for this GET request' });
  }

  try {
    // Split the comma-separated string into an array of foodIds
    const idArray = (foodIds as string).split(',');

    const images = await prisma.foodImage.findMany({
      where: {
        foodId: { in: idArray },
      },
      orderBy: {
        likes: 'desc',
      },
    });

    const groupedImages = images.reduce((acc, img) => {
      if (!acc[img.foodId]) {
        acc[img.foodId] = [];
      }
      acc[img.foodId].push(img);
      return acc;
    }, {} as Record<string, any[]>);

    // Respond to the GET request with the grouped images
    res.status(200).json({ success: true, images: groupedImages });
  } catch (error) {
    console.error('API Error during GET request:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch images for GET request', error: (error as Error).message });
  }
}