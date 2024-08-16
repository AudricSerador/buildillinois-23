import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import webpush from 'web-push';

const prisma = new PrismaClient();

// Set up VAPID keys for web push
webpush.setVapidDetails(
  'mailto:audricciel@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, subscription } = req.body;

    if (!userId || !subscription) {
      return res.status(400).json({ error: 'Missing userId or subscription data' });
    }

    try {
      // Check if the user exists
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Create or update the push subscription
      await prisma.pushSubscription.upsert({
        where: {
          userId_endpoint: {
            userId: userId,
            endpoint: subscription.endpoint,
          },
        },
        update: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        create: {
          userId: userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      });

      // Send a test notification
      const payload = JSON.stringify({
        title: 'Subscription Successful',
        body: 'You have successfully subscribed to push notifications!',
      });

      await webpush.sendNotification(subscription, payload);

      res.status(201).json({ message: 'Subscription added successfully' });
    } catch (error) {
      console.error('Error handling subscription:', error);
      res.status(500).json({ error: 'Failed to process subscription' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}