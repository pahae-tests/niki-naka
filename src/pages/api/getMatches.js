import dbConnect from './_connect';
import Match from './_Match';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const matches = await Match.find({})
      .populate('goals.scorer', 'name img')
      .populate('goals.assister', 'name img')
      .sort({ date: -1 });
    res.status(200).json({ success: true, data: matches });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}