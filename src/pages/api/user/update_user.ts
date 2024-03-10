import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id, name, allergies, preferences, isNew } = req.body;

    try {
      const updatedUser = await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          name: name,
          allergies: allergies,
          preferences: preferences,
          isNew: isNew,
        },
      });

      res.status(200).json({ success: true, data: updatedUser });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}