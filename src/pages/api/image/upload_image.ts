import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import formidable from "formidable";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadImage = async (req: NextApiRequest, res: NextApiResponse) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to parse form data" });
    }

    const foodId = fields.food_id as string;
    const file = files.file as formidable.File;

    const filePath = `${nanoid()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("FoodImage")
      .upload(filePath, file);

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    const { publicURL, error: urlError } = supabase.storage
      .from("food-images")
      .getPublicUrl(filePath);

    if (urlError) {
      return res.status(500).json({ error: urlError.message });
    }

    const { data, error: dbError } = await supabase
      .from("images")
      .insert([{ food_id: foodId, url: publicURL, author: req.body.userId }]);

    if (dbError) {
      return res.status(500).json({ error: dbError.message });
    }

    return res.status(200).json({ success: true, image: data[0] });
  });
};

export default uploadImage;
