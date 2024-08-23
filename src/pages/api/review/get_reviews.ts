import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { foodIds } = req.query;

  console.log('API: Received foodIds:', foodIds);

  if (!foodIds) {
    return res.status(400).json({ success: false, message: 'foodIds is required' });
  }

  try {
    const idArray = Array.isArray(foodIds) ? foodIds : [foodIds];
    console.log('API: Searching for reviews with foodIds:', idArray);

    const reviews = await prisma.review.findMany({
      where: {
        foodId: { in: idArray },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('API: Found reviews:', reviews);

    const groupedReviews = reviews.reduce((acc, review) => {
      if (!acc[review.foodId]) {
        acc[review.foodId] = [];
      }
      acc[review.foodId].push(review);
      return acc;
    }, {} as Record<string, any[]>);

    console.log('API: Grouped reviews:', groupedReviews);

    // Set cache control headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.status(200).json({ success: true, data: groupedReviews });
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}