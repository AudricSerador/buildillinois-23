import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/auth/supabase_client';
import prisma from '../../../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import formidable from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  console.log('Handler started');

  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(400).json({ success: false, message: 'Failed to parse form data' });
    }

    console.log('Form parsed');

    // Extract userId, foodId, and description, ensuring they are strings
    const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
    const foodId = Array.isArray(fields.foodId) ? fields.foodId[0] : fields.foodId;
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file || !userId || !foodId) {
      console.error('Missing required fields');
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
      const filePath = file.filepath;
      if (!filePath) {
        throw new Error('File path is undefined');
      }

      // Define fileName here
      const fileName = `${foodId}/${userId}/${uuidv4()}-${file.originalFilename}`;
      const fileBuffer = await fs.readFile(filePath);

      console.log('File read, uploading to Supabase');

      const { data, error } = await supabase.storage
        .from('food-images')
        .upload(fileName, fileBuffer, {
          contentType: file.mimetype,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({ success: false, message: 'Failed to upload image to Supabase', error });
      }

      console.log('File uploaded to Supabase');

      const { publicUrl } = supabase.storage
        .from('food-images')
        .getPublicUrl(fileName).data;

      console.log('Public URL:', publicUrl);

      const newImage = await prisma.foodImage.create({
        data: {
          userId,
          foodId,
          url: publicUrl,
          description: description || null,
        },
      });

      console.log('New image created:', newImage);

      res.status(200).json({ success: true, data: newImage });
    } catch (error: any) {
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to save image in database', 
        error: error.message, 
        stack: error.stack 
      });
    }
  });
}
