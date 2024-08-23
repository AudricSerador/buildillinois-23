import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    try {
      await prisma.pushSubscription.deleteMany({
        where: { userId: userId },
      });

      res.status(200).json({ 
        message: 'Unsubscribed successfully',
        toast: {
          type: 'success',
          message: 'You have successfully unsubscribed from push notifications.'
        }
      });
    } catch (error) {
      console.error('Error unsubscribing:', error);
      res.status(500).json({ 
        error: 'Failed to unsubscribe',
        toast: {
          type: 'error',
          message: 'Failed to unsubscribe from push notifications. Please try again.'
        }
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}