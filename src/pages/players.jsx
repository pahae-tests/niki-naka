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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
            Player Statistics
          </h2>
        </div>

        {players.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-base sm:text-lg mb-4">No players yet</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {players.map((player, idx) => (
              <div key={player._id} className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-800 hover:border-gray-700 transition-colors">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <span className="text-gray-500 text-sm">#{idx + 1}</span>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 overflow-hidden bg-gradient-to-br from-pink-600 via-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0">
                      <img src={player.img} className='w-full h-full object-cover' alt={player.name} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-bold mb-0.5 sm:mb-1 truncate">{player.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-400">Games: {player.stats.gamesPlayed}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 sm:gap-8 w-full sm:w-auto justify-around sm:justify-end">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-lg sm:text-2xl font-bold text-pink-400 mb-0.5 sm:mb-1">
                        <Target size={16} className="sm:w-[20px] sm:h-[20px]" />
                        {player.stats.goals}
                      </div>
                      <p className="text-xs text-gray-400">Goals</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-lg sm:text-2xl font-bold text-cyan-400 mb-0.5 sm:mb-1">
                        <Award size={16} className="sm:w-[20px] sm:h-[20px]" />
                        {player.stats.assists}
                      </div>
                      <p className="text-xs text-gray-400">Assists</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-2xl font-bold text-purple-400 mb-0.5 sm:mb-1">{player.stats.ga}</div>
                      <p className="text-xs text-gray-400">G/A</p>
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
