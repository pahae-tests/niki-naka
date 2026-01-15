import dbConnect from './_connect';
import Player from './_Player';
import Match from './_Match';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const players = await Player.find({});
    const matches = await Match.find({});

    const playersWithStats = players.map(player => {
      const playerId = player._id.toString();
      let gamesPlayed = new Set();
      let goals = 0;
      let assists = 0;

      matches.forEach(match => {
        match.goals.forEach(goal => {
          if (goal.scorer.toString() === playerId) {
            goals++;
            gamesPlayed.add(match._id.toString());
          }
          if (goal.assister && goal.assister.toString() === playerId) {
            assists++;
            gamesPlayed.add(match._id.toString());
          }
        });
      });

      return {
        _id: player._id,
        name: player.name,
        img: player.img,
        stats: {
          gamesPlayed: gamesPlayed.size,
          goals,
          assists,
          ga: goals + assists
        }
      };
    });

    playersWithStats.sort((a, b) => b.stats.ga - a.stats.ga);

    res.status(200).json({ success: true, data: playersWithStats });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}