import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from "../../../lib/prisma";
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:audricciel@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, title, body } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId: userId },
      });

      const notifications = subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        return webpush.sendNotification(
          pushSubscription,
          JSON.stringify({ title, body })
        );
      });

      await Promise.all(notifications);

      res.status(200).json({ message: 'Notifications sent successfully' });
    } catch (error) {
      console.error('Error sending notifications:', error);
      res.status(500).json({ error: 'Failed to send notifications' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}