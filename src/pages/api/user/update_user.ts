import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id, name, allergies, preferences, isNew, goal, locations } = req.body;

    try {
      const updatedUser = await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          name: name,
          allergies: allergies,
          preferences: preferences,
          goal: goal,
          locations: locations,
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