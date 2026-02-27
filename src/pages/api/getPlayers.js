import dbConnect from './_connect';
import Player from './_Player';
import Match from './_Match';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const players = await Player.find({});
    const matches = await Match.find({});

    const playersWithStats = players.map(player => {
      const playerId = player._id.toString();

      let gamesPlayed = 0;
      let goals = 0;
      let assists = 0;

      matches.forEach(match => {
        // 🔎 Vérifie si le joueur est absent
        const isAbsent = match.absentPlayers?.some(
          absentId => absentId.toString() === playerId
        );

        // ✅ Compte le match seulement s’il n’est pas absent
        if (!isAbsent) {
          gamesPlayed++;
        }

        // 🎯 Compte goals & assists
        match.goals.forEach(goal => {
          if (goal.scorer.toString() === playerId) {
            goals++;
          }

          if (
            goal.assister &&
            goal.assister.toString() === playerId
          ) {
            assists++;
          }
        });
      });

      return {
        _id: player._id,
        name: player.name,
        img: player.img,
        stats: {
          gamesPlayed,
          goals,
          assists,
          ga: goals + assists
        }
      };
    });

    // 🔥 Tri par G/A décroissant
    playersWithStats.sort((a, b) => b.stats.ga - a.stats.ga);

    return res.status(200).json({
      success: true,
      data: playersWithStats
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
