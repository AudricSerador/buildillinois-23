import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { id } = req.body;

    try {
      const deletedFavorite = await prisma.favorite.delete({
        where: {
          id: id,
        },
      });

      res.status(200).json({ success: true, data: deletedFavorite });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

export default handler;