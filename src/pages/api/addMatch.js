import dbConnect from './_connect';
import Match from './_Match';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const match = await Match.create(req.body);
    res.status(201).json({ success: true, data: match });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}