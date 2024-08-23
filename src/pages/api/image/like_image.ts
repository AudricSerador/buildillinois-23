import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id } = req.body; 

    if (!id) {
      return res.status(400).json({ success: false, message: 'Missing image ID' });
    }

    try {
      const image = await prisma.foodImage.update({
        where: { id: parseInt(id) }, 
        data: {
          likes: {
            increment: 1,
          },
        },
      });

      res.status(200).json({ success: true, data: image });
    } catch (error: any) {
      console.error('Error liking image:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

export default handler;