import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Trophy, Plus, Calendar, Target, Award, Users } from 'lucide-react';

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const res = await fetch('/api/getPlayers');
      const data = await res.json();
      if (data.success) {
        setPlayers(data.data);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

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
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors flex items-center gap-2"
              >
                <Calendar size={18} />
                Matches
              </button>
              <button
                onClick={() => router.push('/players')}
                className="px-4 py-2 rounded-lg bg-blue-600 flex items-center gap-2"
              >
                <Users size={18} />
                Players
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Player Statistics</h2>
          {/* <button 
            onClick={() => router.push('/addPlayer10')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Add Player
          </button> */}
        </div>

        {players.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg mb-4">No players yet</p>
            <button 
              onClick={() => router.push('/addPlayer')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Add Your First Player
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {players.map((player, idx) => (
              <div key={player._id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    # d{idx + 1}
                    <div className="w-12 h-12 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
                      <img src={player.img} className='w-full h-full' />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">{player.name}</h3>
                      <p className="text-sm text-slate-400">Games: {player.stats.gamesPlayed}</p>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-2xl font-bold text-blue-400 mb-1">
                        <Target size={20} />
                        {player.stats.goals}
                      </div>
                      <p className="text-xs text-slate-400">Goals</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-2xl font-bold text-green-400 mb-1">
                        <Award size={20} />
                        {player.stats.assists}
                      </div>
                      <p className="text-xs text-slate-400">Assists</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-1">{player.stats.ga}</div>
                      <p className="text-xs text-slate-400">G/A</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
