٨import dbConnect from './_connect';
import Match from './_Match';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    let matches = await Match.find({})
      .populate('goals.scorer', 'name img')
      .populate('goals.assister', 'name img')
      .populate('absentPlayers', 'name img')
      .sort({ date: -1 });

    matches = matches.map(match => {
      const scoreParts = match.score.split("-").map(Number);
      const totalGoalsUs = scoreParts[0];
      const totalGoalsThem = scoreParts[1];

      const playersSet = new Map();
      match.goals.forEach(g => {
        if (g.scorer) playersSet.set(g.scorer._id.toString(), { ...g.scorer.toObject(), number: g.num });
        if (g.assister) playersSet.set(g.assister._id.toString(), { ...g.assister.toObject(), number: g.num });
      });

      const players = Array.from(playersSet.values()).map(player => {
        let goals = 0, assists = 0;
        match.goals.forEach(g => {
          if (g.scorer?._id.toString() === player._id.toString()) goals++;
          if (g.assister?._id.toString() === player._id.toString()) assists++;
        });

        let goalsCoef = 1.4, assistCoef = 1.1;
        if (Math.abs(totalGoalsUs - totalGoalsThem) === 1) {
          if (match.goals[match.goals.length - 1]?.scorer?._id.toString() === player._id.toString()) {
            goalsCoef += 5 / totalGoalsUs;
            assistCoef += 2.5 / totalGoalsUs;
          } else {
            goalsCoef += 0.6;
            assistCoef += 0.4;
          }
        }

        let rating = 5 + (goals * goalsCoef) + (assists * assistCoef);
        let rr = Number(rating);
        if (rating > 10) rating = 10;

        return {
          ...player,
          goals,
          assists,
          rr,
          rating: Number(rating.toFixed(1)),
        };
      });

      const maxRating = Math.max(...players.map(p => p.rating));

      return {
        ...match.toObject(),
        players,
        mvp: players.find(p => p.rr === maxRating) || null,
        absentPlayers: match.absentPlayers
      };
    });

    res.status(200).json({ success: true, data: matches });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, error: error.message });
  }

}

