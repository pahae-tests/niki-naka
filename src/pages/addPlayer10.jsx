import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Users, ArrowLeft, Image } from 'lucide-react';

export default function AddPlayer() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    img: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/addPlayer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlayer),
      });

      const data = await res.json();
      
      if (data.success) {
        router.push('/players');
      } else {
        alert('Error adding player: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Error adding player');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.push('/players')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="text-blue-400" size={32} />
            Add New Player
          </h1>
          <div className="w-20"></div>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Player Name *</label>
            <input
              type="text"
              value={newPlayer.name}
              onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300 flex items-center gap-2">
              <Image size={16} />
              Image Path
            </label>
            <input
              type="text"
              value={newPlayer.img}
              onChange={(e) => setNewPlayer({ ...newPlayer, img: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="/images/player.jpg"
            />
            <p className="mt-2 text-xs text-slate-400">Enter the path to the player's image (optional)</p>
          </div>

          {newPlayer.img && (
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
              <p className="text-sm text-slate-400 mb-2">Image Preview:</p>
              <div className="bg-slate-800 rounded-lg p-3 font-mono text-sm text-blue-400 break-all">
                {newPlayer.img}
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
          >
            {loading ? 'Adding Player...' : 'Add Player'}
          </button>
        </form>
      </div>
    </div>
  );
}