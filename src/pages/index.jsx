import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Trophy, Plus, Calendar, Target, Users } from 'lucide-react';

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
    else return "text-gray-400";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-3 bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent" dir='rtl'>
              فريق النيكي ناكا لي جا يتناكا
            </h1>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => router.push('/')}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
              >
                <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
                Matches
              </button>
              <button
                onClick={() => router.push('/players')}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
                Players
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
            Match History
          </h2>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-base sm:text-lg mb-4">No matches yet</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {matches.map(match => (
              <div key={match._id} className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-800 hover:border-gray-700 transition-colors">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                  <div className="w-full sm:w-auto">
                    <h3 className="text-lg sm:text-xl font-bold mb-1">vs {match.opponent}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      {new Date(match.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(match.score)} self-end sm:self-auto`}>
                    {match.score}
                  </div>
                </div>

                {match.goals && match.goals.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-gray-800">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-2">
                      <Target size={14} className="sm:w-[16px] sm:h-[16px]" />
                      Goals
                    </div>
                    {match.goals.map((goal, idx) => (
                      <div key={idx} className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm bg-gray-800/50 rounded-lg p-2.5 sm:p-3">
                        <span className="text-gray-400">#{goal.num}</span>
                        <img src={goal.scorer?.img} className='w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover' alt={goal.scorer?.name} />
                        <span className="font-medium">{goal.scorer?.name || 'Unknown'}</span>
                        {goal.assister && (
                          <>
                            <span className="text-gray-500 hidden sm:inline">•</span>
                            <span className="text-gray-400 w-full sm:w-auto">
                              Assist: {goal.assister.name}
                            </span>
                          </>
                        )}
                        <div className="flex gap-2 w-full sm:w-auto">
                          {goal.pen && (
                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">PEN</span>
                          )}
                          {goal.ongoal && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium">ON GOAL</span>
                          )}
                        </div>
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
