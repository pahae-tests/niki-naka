import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Trophy, Plus, Calendar, Target } from 'lucide-react';

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-3" dir='rtl'>
              فريق النيكي ناكا لي جا يتناكا
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 rounded-lg bg-blue-600 flex items-center gap-2"
              >
                <Calendar size={18} />
                Matches
              </button>
              <button
                onClick={() => router.push('/players')}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors flex items-center gap-2"
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
          <h2 className="text-2xl font-bold">Match History</h2>
          {/* <button 
            onClick={() => router.push('/addMatch10')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Add Match
          </button> */}
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg mb-4">No matches yet</p>
            <button 
              onClick={() => router.push('/addMatch')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Add Your First Match
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {matches.map(match => (
              <div key={match._id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">vs {match.opponent}</h3>
                    <p className="text-slate-400 text-sm">
                      {new Date(match.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(match.score)}`}>{match.score}</div>
                </div>

                {match.goals && match.goals.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                      <Target size={16} />
                      Goals
                    </div>
                    {match.goals.map((goal, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm bg-slate-700/30 rounded-lg p-3">
                        <span className="text-slate-400">#{goal.num}</span>
                        <img src={goal.scorer?.img} className='w-12 h-12 rounded-full' />
                        <span className="font-medium">{goal.scorer?.name || 'Unknown'}</span>
                        {goal.assister && (
                          <>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">Assist: {goal.assister.name}</span>
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
