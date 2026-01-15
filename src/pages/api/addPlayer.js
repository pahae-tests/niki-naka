import dbConnect from './_connect';
import Player from './_Player';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const player = await Player.create(req.body);
    res.status(201).json({ success: true, data: player });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}