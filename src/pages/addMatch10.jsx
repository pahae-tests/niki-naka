import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Trophy, Plus, X, ArrowLeft, Target, Zap, Users } from 'lucide-react';

export default function AddMatch() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMatch, setNewMatch] = useState({
    opponent: '',
    score: '',
    date: new Date().toISOString().split('T')[0],
    goals: [],
    absentPlayers: []
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const res = await fetch('/api/getPlayers');
      const data = await res.json();
      if (data.success) setPlayers(data.data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const addGoal = () => {
    setNewMatch({
      ...newMatch,
      goals: [...newMatch.goals, {
        num: newMatch.goals.length + 1,
        scorer: '',
        assister: '',
        pen: false,
        ongoal: false
      }]
    });
  };

  const updateGoal = (index, field, value) => {
    const updatedGoals = [...newMatch.goals];
    updatedGoals[index][field] = value;
    setNewMatch({ ...newMatch, goals: updatedGoals });
  };

  const removeGoal = (index) => {
    const updatedGoals = newMatch.goals.filter((_, i) => i !== index);
    updatedGoals.forEach((goal, i) => { goal.num = i + 1; });
    setNewMatch({ ...newMatch, goals: updatedGoals });
  };

  const toggleAbsentPlayer = (playerId) => {
    const updatedAbsentPlayers = newMatch.absentPlayers.includes(playerId)
      ? newMatch.absentPlayers.filter(id => id !== playerId)
      : [...newMatch.absentPlayers, playerId];
    setNewMatch({ ...newMatch, absentPlayers: updatedAbsentPlayers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validGoals = newMatch.goals.filter(goal => goal.scorer);
      const matchData = {
        ...newMatch,
        goals: validGoals.map(goal => ({
          num: goal.num,
          scorer: goal.scorer,
          assister: goal.assister || null,
          pen: goal.pen,
          ongoal: goal.ongoal
        })),
        absentPlayers: newMatch.absentPlayers
      };
      const res = await fetch('/api/addMatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchData),
      });
      const data = await res.json();
      if (data.success) router.push('/');
      else alert('Error adding match: ' + data.error);
    } catch (error) {
      console.error('Error adding match:', error);
      alert('Error adding match');
    } finally {
      setLoading(false);
    }
  };

  const liveStats = players
    .map(player => ({
      ...player,
      goals: newMatch.goals.filter(g => g.scorer === player._id).length,
      assists: newMatch.goals.filter(g => g.assister === player._id).length,
    }))
    .filter(p => p.goals > 0 || p.assists > 0)
    .sort((a, b) => (b.goals * 2 + b.assists) - (a.goals * 2 + a.assists));

  const inputClass = "w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder-gray-600 transition-colors text-sm";
  const selectClass = "w-full px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500 text-white text-sm transition-colors";

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Header */}
      <div className="border-b border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent flex justify-center items-center">
              {/* <Trophy size={22} /> */}
              Add New Match
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl md:mx-auto px-2 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── FORM (2/3) ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Match Info */}
          <div className="bg-gray-950 rounded-xl p-6 border border-gray-800">
            <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Match Info
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Opponent Team</label>
                <input
                  type="text"
                  value={newMatch.opponent}
                  onChange={(e) => setNewMatch({ ...newMatch, opponent: e.target.value })}
                  placeholder="e.g. FC Barcelona"
                  className={inputClass}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Final Score</label>
                  <input
                    type="text"
                    value={newMatch.score}
                    onChange={(e) => setNewMatch({ ...newMatch, score: e.target.value })}
                    placeholder="3-1"
                    className={inputClass + " text-center font-bold text-lg tracking-widest"}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={newMatch.date}
                    onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="bg-gray-950 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-pink-500" />
                <h2 className="text-lg font-bold bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                  Goals
                </h2>
                {newMatch.goals.filter(g => g.scorer).length > 0 && (
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
                    {newMatch.goals.filter(g => g.scorer).length}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={addGoal}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 hover:opacity-90 transition-opacity text-sm font-medium"
              >
                <Plus size={16} />
                Add Goal
              </button>
            </div>

            {newMatch.goals.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-800 rounded-xl">
                <Target size={28} className="mx-auto text-gray-700 mb-2" />
                <p className="text-gray-600 text-sm">No goals added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {newMatch.goals.map((goal, index) => (
                  <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-gray-400">#{goal.num}</span>
                      <button
                        type="button"
                        onClick={() => removeGoal(index)}
                        className="flex items-center gap-1 text-gray-600 hover:text-red-400 transition-colors text-xs"
                      >
                        <X size={14} />
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Scorer *</label>
                        <select
                          value={goal.scorer}
                          onChange={(e) => updateGoal(index, 'scorer', e.target.value)}
                          className={selectClass}
                        >
                          <option value="">Select player</option>
                          {players.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Assister</label>
                        <select
                          value={goal.assister}
                          onChange={(e) => updateGoal(index, 'assister', e.target.value)}
                          className={selectClass}
                        >
                          <option value="">None</option>
                          {players.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-5">
                      {[['pen', 'Penalty'], ['ongoal', 'On Goal']].map(([field, label]) => (
                        <label key={field} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={goal[field]}
                            onChange={(e) => updateGoal(index, field, e.target.checked)}
                            className="w-4 h-4 rounded border-gray-700 bg-gray-800 accent-purple-500"
                          />
                          <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Absent Players */}
          <div className="bg-gray-950 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-cyan-500" />
              <h2 className="text-lg font-bold bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                Absent Players
              </h2>
              {newMatch.absentPlayers.length > 0 && (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                  {newMatch.absentPlayers.length}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {players.map(player => {
                const absent = newMatch.absentPlayers.includes(player._id);
                return (
                  <label
                    key={player._id}
                    className={`flex items-center gap-2.5 p-3 rounded-lg cursor-pointer border transition-all ${
                      absent
                        ? 'bg-red-950/30 border-red-800/50'
                        : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={absent}
                      onChange={() => toggleAbsentPlayer(player._id)}
                      className="w-4 h-4 rounded border-gray-700 bg-gray-800 accent-purple-500"
                    />
                    <img
                      src={`/${player.name.toLowerCase()}.png`}
                      alt={player.name}
                      className={`w-7 h-7 rounded-full object-cover border border-gray-700 ${absent ? 'grayscale opacity-50' : ''}`}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <span className={`text-sm truncate ${absent ? 'text-red-400 line-through' : 'text-gray-300'}`}>
                      {player.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 rounded-lg bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity font-bold text-sm tracking-wide"
          >
            {loading ? 'Saving...' : 'Save Match'}
          </button>
        </div>

        {/* ── LIVE STATS (1/3) ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
              <Zap size={16} className="text-purple-400" />
              <h2 className="font-bold bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                Live Stats
              </h2>
            </div>

            {liveStats.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Zap size={24} className="mx-auto text-gray-800 mb-3" />
                <p className="text-gray-600 text-sm">Add goals to see stats</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {liveStats.map(player => (
                  <div key={player._id} className="px-5 py-3 flex items-center gap-3">
                    <img
                      src={`/${player.name.toLowerCase()}.png`}
                      alt={player.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-700 flex-shrink-0"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{player.name}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {player.goals > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                          <Target size={11} className="text-yellow-400" />
                          <span className="text-xs text-yellow-400 font-bold">{player.goals}</span>
                        </div>
                      )}
                      {player.assists > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                          <Zap size={11} className="text-cyan-400" />
                          <span className="text-xs text-cyan-400 font-bold">{player.assists}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="px-5 py-3 border-t border-gray-800 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Target size={10} className="text-yellow-400" />
                <span className="text-xs text-gray-600">Goal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap size={10} className="text-cyan-400" />
                <span className="text-xs text-gray-600">Assist</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
