import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id, email, azureId, name, allergies, preferences, isNew } = req.body;

    try {
      const newUser = await prisma.user.create({
        data: {
          id,
          email,
          azureId,
          name,
          allergies,
          preferences,
          isNew,
        },
      });

      res.status(200).json({ success: true, data: newUser });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}