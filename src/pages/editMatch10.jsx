import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Trophy, Plus, X, ArrowLeft, Target, Zap, Users, Save, Trash2 } from 'lucide-react';

export default function EditMatch() {
  const router = useRouter();
  const { id } = router.query;

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [match, setMatch] = useState({
    opponent: '',
    score: '',
    date: new Date().toISOString().split('T')[0],
    goals: [],
    absentPlayers: []
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (id) fetchMatch();
  }, [id]);

  const fetchPlayers = async () => {
    try {
      const res = await fetch('/api/getPlayers');
      const data = await res.json();
      if (data.success) setPlayers(data.data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchMatch = async () => {
    try {
      const res = await fetch('/api/getMatches');
      const data = await res.json();
      if (data.success) {
        const found = data.data.find(m => m._id === id);
        if (!found) { alert('Match not found'); router.push('/'); return; }

        // Normalize: replace populated objects with IDs for selects
        setMatch({
          opponent: found.opponent,
          score: found.score,
          date: new Date(found.date).toISOString().split('T')[0],
          goals: found.goals.map((g, i) => ({
            num: i + 1,
            scorer: g.scorer?._id || g.scorer || '',
            assister: g.assister?._id || g.assister || '',
            pen: g.pen || false,
            ongoal: g.ongoal || false
          })),
          absentPlayers: found.absentPlayers.map(p => p._id || p)
        });
      }
    } catch (error) {
      console.error('Error fetching match:', error);
    } finally {
      setFetching(false);
    }
  };

  const addGoal = () => {
    setMatch({
      ...match,
      goals: [...match.goals, {
        num: match.goals.length + 1,
        scorer: '',
        assister: '',
        pen: false,
        ongoal: false
      }]
    });
  };

  const updateGoal = (index, field, value) => {
    const updatedGoals = [...match.goals];
    updatedGoals[index][field] = value;
    setMatch({ ...match, goals: updatedGoals });
  };

  const removeGoal = (index) => {
    const updatedGoals = match.goals.filter((_, i) => i !== index);
    updatedGoals.forEach((goal, i) => { goal.num = i + 1; });
    setMatch({ ...match, goals: updatedGoals });
  };

  const toggleAbsentPlayer = (playerId) => {
    const updated = match.absentPlayers.includes(playerId)
      ? match.absentPlayers.filter(pid => pid !== playerId)
      : [...match.absentPlayers, playerId];
    setMatch({ ...match, absentPlayers: updated });
  };

  const handleSubmit = async () => {
    if (!match.opponent || !match.score) {
      alert('Opponent and score are required');
      return;
    }
    setLoading(true);
    try {
      const validGoals = match.goals.filter(g => g.scorer);
      const body = {
        id,
        opponent: match.opponent,
        score: match.score,
        date: match.date,
        goals: validGoals.map((g, i) => ({
          num: i + 1,
          scorer: g.scorer,
          assister: g.assister || null,
          pen: g.pen,
          ongoal: g.ongoal
        })),
        absentPlayers: match.absentPlayers
      };

      const res = await fetch('/api/editMatch', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) router.push('/');
      else alert('Error updating match: ' + data.error);
    } catch (error) {
      console.error(error);
      alert('Error updating match');
    } finally {
      setLoading(false);
    }
  };

  // Live stats from current form state
  const liveStats = players
    .map(player => ({
      ...player,
      goals: match.goals.filter(g => g.scorer === player._id).length,
      assists: match.goals.filter(g => g.assister === player._id).length,
    }))
    .filter(p => p.goals > 0 || p.assists > 0)
    .sort((a, b) => (b.goals * 2 + b.assists) - (a.goals * 2 + a.assists));

  const inputClass = "w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder-gray-600 transition-colors text-sm";
  const selectClass = "w-full px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500 text-white text-sm transition-colors";

  if (fetching) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading match...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent flex items-center gap-2">
              <Trophy size={22} />
              Edit Match
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
                  value={match.opponent}
                  onChange={(e) => setMatch({ ...match, opponent: e.target.value })}
                  placeholder="e.g. FC Barcelona"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Final Score</label>
                  <input
                    type="text"
                    value={match.score}
                    onChange={(e) => setMatch({ ...match, score: e.target.value })}
                    placeholder="3-1"
                    className={inputClass + " text-center font-bold text-lg tracking-widest"}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={match.date}
                    onChange={(e) => setMatch({ ...match, date: e.target.value })}
                    className={inputClass}
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
                {match.goals.filter(g => g.scorer).length > 0 && (
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
                    {match.goals.filter(g => g.scorer).length}
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

            {match.goals.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-800 rounded-xl">
                <Target size={28} className="mx-auto text-gray-700 mb-2" />
                <p className="text-gray-600 text-sm">No goals added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {match.goals.map((goal, index) => (
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
              {match.absentPlayers.length > 0 && (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                  {match.absentPlayers.length}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {players.map(player => {
                const absent = match.absentPlayers.includes(player._id);
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

          {/* Save */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 rounded-lg bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity font-bold text-sm tracking-wide flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Changes'}
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
