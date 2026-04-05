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

  // Live stats from current form state
  const liveStats = players
    .map(player => ({
      ...player,
      goals: newMatch.goals.filter(g => g.scorer === player._id).length,
      assists: newMatch.goals.filter(g => g.assister === player._id).length,
    }))
    .filter(p => p.goals > 0 || p.assists > 0)
    .sort((a, b) => (b.goals * 2 + b.assists) - (a.goals * 2 + a.assists));

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'DM Mono', monospace" }}>

      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-black border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs tracking-widest uppercase"
        >
          <ArrowLeft size={15} />
          Back
        </button>
        <div className="flex items-center gap-2.5">
          <Trophy size={16} className="text-amber-400" />
          <span className="text-xs tracking-[0.3em] uppercase text-zinc-300">New Match</span>
        </div>
        <div className="w-16" />
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── FORM (left 2/3) ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Match Info */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
            <p className="text-xs tracking-[0.3em] uppercase text-zinc-600">Match Info</p>

            <div>
              <label className="text-xs text-zinc-600 tracking-widest uppercase block mb-1.5">Opponent</label>
              <input
                type="text"
                value={newMatch.opponent}
                onChange={(e) => setNewMatch({ ...newMatch, opponent: e.target.value })}
                placeholder="e.g. FC Barcelona"
                className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 text-white placeholder-zinc-700 transition-colors text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-600 tracking-widest uppercase block mb-1.5">Score</label>
                <input
                  type="text"
                  value={newMatch.score}
                  onChange={(e) => setNewMatch({ ...newMatch, score: e.target.value })}
                  placeholder="3 — 1"
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 text-white placeholder-zinc-700 transition-colors text-sm text-center font-bold tracking-widest"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-zinc-600 tracking-widest uppercase block mb-1.5">Date</label>
                <input
                  type="date"
                  value={newMatch.date}
                  onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 text-white transition-colors text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-amber-400" />
                <p className="text-xs tracking-[0.3em] uppercase text-zinc-600">Goals</p>
                {newMatch.goals.filter(g => g.scorer).length > 0 && (
                  <span className="px-2 py-0.5 bg-amber-400/10 text-amber-400 text-xs rounded-full border border-amber-400/20">
                    {newMatch.goals.filter(g => g.scorer).length}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={addGoal}
                className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors text-xs tracking-widest uppercase"
              >
                <Plus size={13} />
                Add Goal
              </button>
            </div>

            {newMatch.goals.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-zinc-900 rounded-xl">
                <Target size={26} className="mx-auto text-zinc-800 mb-2" />
                <p className="text-zinc-700 text-xs tracking-widest">No goals added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {newMatch.goals.map((goal, index) => (
                  <div key={index} className="bg-black border border-zinc-900 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-amber-400 font-bold tracking-widest">GOAL #{goal.num}</span>
                      <button
                        type="button"
                        onClick={() => removeGoal(index)}
                        className="text-zinc-700 hover:text-red-400 transition-colors p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-zinc-700 block mb-1">Scorer *</label>
                        <select
                          value={goal.scorer}
                          onChange={(e) => updateGoal(index, 'scorer', e.target.value)}
                          className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 text-white text-sm transition-colors"
                        >
                          <option value="">— Select —</option>
                          {players.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-700 block mb-1">Assister</label>
                        <select
                          value={goal.assister}
                          onChange={(e) => updateGoal(index, 'assister', e.target.value)}
                          className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 text-white text-sm transition-colors"
                        >
                          <option value="">— None —</option>
                          {players.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-5">
                      {[['pen', 'Penalty'], ['ongoal', 'On Goal']].map(([field, label]) => (
                        <label
                          key={field}
                          className="flex items-center gap-2 cursor-pointer group select-none"
                          onClick={() => updateGoal(index, field, !goal[field])}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            goal[field]
                              ? 'bg-amber-400 border-amber-400'
                              : 'border-zinc-700 bg-transparent group-hover:border-zinc-500'
                          }`}>
                            {goal[field] && <span className="text-black text-xs font-black leading-none">✓</span>}
                          </div>
                          <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Absent Players */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users size={14} className="text-zinc-600" />
              <p className="text-xs tracking-[0.3em] uppercase text-zinc-600">Absent Players</p>
              {newMatch.absentPlayers.length > 0 && (
                <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded-full border border-red-500/20">
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
                    className={`flex items-center gap-2.5 p-3 rounded-lg cursor-pointer border transition-all select-none ${
                      absent
                        ? 'bg-red-950/20 border-red-900/60 text-red-400'
                        : 'bg-black border-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={absent}
                      onChange={() => toggleAbsentPlayer(player._id)}
                      className="hidden"
                    />
                    <div className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                      absent ? 'bg-red-500 border-red-500' : 'border-zinc-700'
                    }`}>
                      {absent && <span className="text-white text-xs font-black leading-none" style={{ fontSize: 9 }}>✕</span>}
                    </div>
                    <span className="text-xs truncate">{player.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 disabled:bg-zinc-900 disabled:text-zinc-700 disabled:cursor-not-allowed rounded-xl transition-colors font-bold tracking-[0.2em] uppercase text-sm text-black"
          >
            {loading ? 'Saving...' : 'Save Match'}
          </button>
        </div>

        {/* ── LIVE STATS (right 1/3) ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">

            <div className="px-4 py-3 border-b border-zinc-900 flex items-center gap-2">
              <Zap size={13} className="text-amber-400" />
              <span className="text-xs tracking-[0.3em] uppercase text-zinc-600">Live Stats</span>
            </div>

            {liveStats.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Zap size={22} className="mx-auto text-zinc-800 mb-3" />
                <p className="text-zinc-700 text-xs tracking-widest">Add goals to<br />see stats</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-900">
                {liveStats.map(player => (
                  <div key={player._id} className="px-4 py-3 flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0 flex items-center justify-center">
                      <img
                        src={`/${player.name.toLowerCase()}.png`}
                        alt={player.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextSibling.style.display = 'flex';
                        }}
                      />
                      <span
                        className="w-full h-full items-center justify-center text-zinc-500 text-xs font-bold hidden"
                        style={{ display: 'none' }}
                      >
                        {player.name[0].toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium truncate">{player.name}</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {player.goals > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-400/10 rounded-md border border-amber-400/20">
                          <Target size={9} className="text-amber-400" />
                          <span className="text-xs text-amber-400 font-bold">{player.goals}</span>
                        </div>
                      )}
                      {player.assists > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-400/10 rounded-md border border-blue-400/20">
                          <Zap size={9} className="text-blue-400" />
                          <span className="text-xs text-blue-400 font-bold">{player.assists}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="px-4 py-3 border-t border-zinc-900 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Target size={9} className="text-amber-400" />
                <span className="text-xs text-zinc-700">Goal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap size={9} className="text-blue-400" />
                <span className="text-xs text-zinc-700">Assist</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
