import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
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

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);

    if (!files.file || !Array.isArray(files.file) || !files.file[0]) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = files.file[0];
    const publicDir = path.join(process.cwd(), 'public');
    const newPath = path.join(publicDir, 'newData.xlsx');

    // Копируем временный файл в публичную директорию
    await fs.promises.copyFile(file.filepath, newPath);

    // Удаляем временный файл
    await fs.promises.unlink(file.filepath);

    res.status(200).json({ message: 'File saved successfully' });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({ message: 'Error saving file' });
  }
} 