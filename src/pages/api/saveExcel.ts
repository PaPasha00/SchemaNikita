import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import formidable from 'formidable';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = formidable();
  try {
    const [, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const data = await fs.readFile(file.filepath);
    const uploadDir = path.join(process.cwd(), 'public');
    await fs.writeFile(path.join(uploadDir, 'newData.xlsx'), data);

    await fs.unlink(file.filepath);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({ message: 'Error saving file' });
  }
} 