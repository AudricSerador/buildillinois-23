import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id, email } = req.body;

    try {
      const newUser = await prisma.user.create({
        data: {
          id,
          email,
        },
      });
      console.log("new user created: ", newUser)
      res.status(200).json({ success: true, data: newUser });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}