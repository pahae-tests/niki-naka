import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Trophy, Plus, Calendar, Target, Zap, Icon, Crown } from 'lucide-react';
import { soccerBall, sneaker } from '@lucide/lab';

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchLineups, setMatchLineups] = useState({});
  const [showMatchLineups, setShowMatchLineups] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/getMatches');
      const data = await res.json();
      if (data.success) {
        setMatches(data.data);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    let us = Number(score.split("-")[0]);
    let them = Number(score.split("-")[1]);
    if (us > them) return "text-green-500";
    else if (us < them) return "text-red-600";
    else return "text-gray-600";
  }

  const Player = ({ img, name, number, goals, assists, rating }) => {
    if (rating <= 0) rating = 5.0;
    if (rating > 10) rating = 10.0;

    let ratingBg = "bg-orange-500";
    if (rating > 9) ratingBg = "bg-blue-500";
    else if (rating >= 8) ratingBg = "bg-green-500";
    else if (rating >= 6) ratingBg = "bg-yellow-400";

    return (
      <div className="relative flex flex-col items-center">
        <img src={img} className="w-8 h-8 md:w-14 md:h-14 rounded-full object-cover" />

        {goals > 0 && (
          <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1 w-4 h-2 md:w-7 md:h-4 flex items-center justify-around rounded-3xl bg-white border border-gray-300">
            <Icon iconNode={soccerBall} className="w-2 h-2 md:w-4 md:h-4 text-black" />
            <span className="text-[6px] md:text-xs font-bold text-black">{goals}</span>
          </div>
        )}

        {assists > 0 && (
          <div className="absolute bottom-0 left-0 -translate-x-1/3 -translate-y-5 md:-translate-y-5.5 w-4 h-2 md:w-7 md:h-4 flex items-center justify-around rounded-3xl bg-white border border-gray-300">
            <Icon iconNode={sneaker} className="w-2 h-2 md:w-4 md:h-4 text-black" />
            <span className="text-[6px] md:text-xs font-bold text-black">{assists}</span>
          </div>
        )}

        <div
          className={`absolute bottom-0 right-0 translate-x-1/3 -translate-y-5 w-4 h-2 md:w-7 md:h-5 flex items-center justify-center rounded-3xl text-white font-bold ${ratingBg} text-[6px] md:text-xs`}
        >
          {rating.toFixed(1)}
        </div>

        <div className="absolute top-0 right-0 translate-x-1 -translate-y-1 w-3 h-3 md:w-4 md:h-4 text-black flex items-center justify-center rounded-full bg-white border border-gray-300 text-[6px] md:text-[12px] font-bold">
          {number}
        </div>

        <p className="text-[10px] md:text-sm font-bold mt-1 md:mt-3">{name}</p>
      </div>
    );
  };

  const getPlayerInfos = (name) => {
    const player = matchLineups.players.find(p => p.name === name) || {};
    return {
      goals: player.goals || 0,
      assists: player.assists || 0,
      rating: player.rating || 0
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Lineups */}
      {showMatchLineups &&
        <div className="fixed inset-0 z-50 backdrop-blur-2xl flex flex-col md:flex-row items-center justify-center cursor-pointer" onClick={() => setShowMatchLineups(false)} >
          <p className='text-xl font-bold text-white'>3-1-2</p>
          <div className="relative w-[95%] max-w-[440px] md:max-w-none md:w-[55%] aspect-[2/3] md:h-screen flex items-center justify-center">
            {/* Terrain */}
            <img
              src="/terrain.png"
              className="absolute inset-0 w-full h-full object-contain md:object-cover"
            />
            {/* Players */}
            <div className="relative w-full h-[40%] md:h-[80%] -translate-y-4 md:-translate-y-10 flex flex-col justify-evenly px-2">
              {/* Ligne 1 */}
              <div className="flex justify-evenly">
                <Player img="/pahae.png" name="Pahae" number={11} {...getPlayerInfos("Pahae")} />
                <Player img="/khali.png" name="Khali" number={10} {...getPlayerInfos("Khali")} />
              </div>
              {/* Ligne 2 */}
              <div className="flex justify-center md:-translate-y-4">
                <Player img="/yosf.png" name="Yosf" number={7} {...getPlayerInfos("Yosf")} />
              </div>
              {/* Ligne 3 */}
              <div className="flex justify-evenly">
                <Player img="/apdltif.png" name="Apdltif" number={4} {...getPlayerInfos("Apdltif")} />
                <Player img="/paatrox.png" name="Paatrox" number={3} {...getPlayerInfos("Paatrox")} />
                <Player img="/amine.png" name="Amine" number={2} {...getPlayerInfos("Amine")} />
              </div>
            </div>
          </div>
        </div>
      }

      {/* Header */}
      <div className="border-b border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-3 bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent" dir='rtl'>
              فريق النيكي ناكا لي جا يتناكا
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Calendar size={18} />
                Matches
              </button>
              <button
                onClick={() => router.push('/players')}
                className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors flex items-center gap-2 border border-gray-800"
              >
                <Target size={18} />
                Players
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl md:mx-auto px-2 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent">Match History</h2>
          {/* <button 
            onClick={() => router.push('/addMatch10')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 hover:opacity-90 rounded-lg transition-opacity"
          >
            <Plus size={20} />
            Add Match
          </button> */}
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No matches yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {matches.map(match => (
              <div key={match._id} className="bg-gray-950 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">vs {match.opponent}</h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(match.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(match.score)}`}>{match.score}</div>
                </div>

                <div className='flex items-center justify-between mb-4'>
                  {match.mvp ?
                    <div className='flex gap-2 items-center'>
                      <img src={match.mvp.img} className='w-6 h-6 rounded-full' />
                      <Crown size={18} className="text-amber-400" />
                      <p size={18} className="text-amber-400 font-bold">MVP</p>
                    </div>
                    :
                    <></>
                  }
                  <button onClick={() => { setShowMatchLineups(true); setMatchLineups(match); console.log(match) }} className='bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 px-4 py-2 rounded-xl hover:opacity-60'>Show Lineups</button>
                </div>

                {match.goals && match.goals.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-gray-800">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <Target size={16} />
                      Goals
                    </div>
                    {match.goals.map((goal, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm bg-gray-900 rounded-lg p-3 border border-gray-800">
                        <span className="text-gray-400">#{goal.num}</span>
                        <img src={goal.scorer?.img} className='w-12 h-12 rounded-full' />
                        <span className="font-medium">{goal.scorer?.name || 'Unknown'}</span>
                        {goal.assister && (
                          <>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400">Assist: {goal.assister.name}</span>
                          </>
                        )}
                        {goal.pen && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">PEN</span>
                        )}
                        {goal.ongoal && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">ON GOAL</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
