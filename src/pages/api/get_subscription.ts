import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    try {
      const subscription = await prisma.pushSubscription.findFirst({
        where: { userId: userId },
      });

      res.status(200).json({ hasSubscription: !!subscription });
    } catch (error) {
      console.error('Error checking push subscription:', error);
      res.status(500).json({ error: 'Failed to check push subscription' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}