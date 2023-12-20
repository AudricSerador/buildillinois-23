import type { NextApiRequest, NextApiResponse } from 'next';
import { importJSONToDatabase } from '../../utils/import_json';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const jsonData = req.body;
            await importJSONToDatabase(jsonData);
            res.status(200).json({ message: 'Data imported successfully' });
        } catch (error: any) {
            console.error('Error in /api/import_data:', error.message);
            console.error(error.stack);
            res.status(500).json({ error: 'Error importing data' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}