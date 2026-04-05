import dbConnect from './_connect';
import Match from './_Match';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { id, opponent, score, date, goals, absentPlayers } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Match ID is required' });
    }

    const updatedMatch = await Match.findByIdAndUpdate(
      id,
      {
        opponent,
        score,
        date,
        goals: goals.map((goal, i) => ({
          num: i + 1,
          scorer: goal.scorer,
          assister: goal.assister || null,
          pen: goal.pen || false,
          ongoal: goal.ongoal || false
        })),
        absentPlayers: absentPlayers || []
      },
      { new: true, runValidators: true }
    )
      .populate('goals.scorer', 'name img')
      .populate('goals.assister', 'name img')
      .populate('absentPlayers', 'name img');

    if (!updatedMatch) {
      return res.status(404).json({ success: false, error: 'Match not found' });
    }

    res.status(200).json({ success: true, data: updatedMatch });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, error: error.message });
  }
}
