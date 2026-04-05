import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Trophy, Plus, X, ArrowLeft, Target, Zap, Users, Save, Edit2, Calendar, ChevronRight } from 'lucide-react';

export default function EditMatch() {
  const router = useRouter();

  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [fetchingMatches, setFetchingMatches] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null); // the match being edited
  const [editData, setEditData] = useState(null);           // editable form state
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMatches();
    fetchPlayers();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/getMatches');
      const data = await res.json();
      if (data.success) setMatches(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingMatches(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      const res = await fetch('/api/getPlayers');
      const data = await res.json();
      if (data.success) setPlayers(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const getScoreColor = (score) => {
    const [us, them] = score.split('-').map(Number);
    if (us > them) return 'text-green-400';
    if (us < them) return 'text-red-400';
    return 'text-gray-400';
  };

  // Open a match for editing
  const openEdit = (match) => {
    setSelectedMatch(match);
    setEditData({
      opponent: match.opponent,
      score: match.score,
      date: new Date(match.date).toISOString().split('T')[0],
      goals: match.goals.map((g, i) => ({
        num: i + 1,
        scorer: g.scorer?._id || g.scorer || '',
        assister: g.assister?._id || g.assister || '',
        pen: g.pen || false,
        ongoal: g.ongoal || false
      })),
      absentPlayers: match.absentPlayers.map(p => p._id || p)
    });
  };

  const closeEdit = () => {
    setSelectedMatch(null);
    setEditData(null);
  };

  // Goal helpers
  const addGoal = () => {
    setEditData(d => ({
      ...d,
      goals: [...d.goals, { num: d.goals.length + 1, scorer: '', assister: '', pen: false, ongoal: false }]
    }));
  };

  const updateGoal = (index, field, value) => {
    setEditData(d => {
      const goals = [...d.goals];
      goals[index] = { ...goals[index], [field]: value };
      return { ...d, goals };
    });
  };

  const removeGoal = (index) => {
    setEditData(d => {
      const goals = d.goals.filter((_, i) => i !== index).map((g, i) => ({ ...g, num: i + 1 }));
      return { ...d, goals };
    });
  };

  const toggleAbsent = (playerId) => {
    setEditData(d => {
      const updated = d.absentPlayers.includes(playerId)
        ? d.absentPlayers.filter(id => id !== playerId)
        : [...d.absentPlayers, playerId];
      return { ...d, absentPlayers: updated };
    });
  };

  const handleSave = async () => {
    if (!editData.opponent || !editData.score) { alert('Opponent and score are required'); return; }
    setSaving(true);
    try {
      const validGoals = editData.goals.filter(g => g.scorer);
      const body = {
        id: selectedMatch._id,
        opponent: editData.opponent,
        score: editData.score,
        date: editData.date,
        goals: validGoals.map((g, i) => ({
          num: i + 1,
          scorer: g.scorer,
          assister: g.assister || null,
          pen: g.pen,
          ongoal: g.ongoal
        })),
        absentPlayers: editData.absentPlayers
      };
      const res = await fetch('/api/editMatch', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        await fetchMatches();
        closeEdit();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('Error saving match');
    } finally {
      setSaving(false);
    }
  };

  // Live stats
  const liveStats = editData
    ? players
        .map(p => ({
          ...p,
          goals: editData.goals.filter(g => g.scorer === p._id).length,
          assists: editData.goals.filter(g => g.assister === p._id).length
        }))
        .filter(p => p.goals > 0 || p.assists > 0)
        .sort((a, b) => (b.goals * 2 + b.assists) - (a.goals * 2 + a.assists))
    : [];

  const inputClass = "w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder-gray-600 transition-colors text-sm";
  const selectClass = "w-full px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500 text-white text-sm transition-colors";

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Header */}
      <div className="border-b border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            {/* <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={18} />
              Back
            </button> */}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent flex items-center gap-2">
              <Edit2 size={20} />
              Edit Match
            </h1>
            {/* <div className="w-20" /> */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl md:mx-auto px-2 md:px-6 py-8">
        {fetchingMatches ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── LEFT: Match List ── */}
            <div>
              <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                Match History
              </h2>

              {matches.length === 0 ? (
                <div className="text-center py-12 bg-gray-950 rounded-xl border border-gray-800">
                  <Calendar size={28} className="mx-auto text-gray-700 mb-2" />
                  <p className="text-gray-600 text-sm">No matches yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matches.map(match => {
                    const isSelected = selectedMatch?._id === match._id;
                    return (
                      <button
                        key={match._id}
                        onClick={() => isSelected ? closeEdit() : openEdit(match)}
                        className={`w-full text-left rounded-xl p-5 border transition-all ${
                          isSelected
                            ? 'bg-gray-900 border-purple-500/60 ring-1 ring-purple-500/30'
                            : 'bg-gray-950 border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-base truncate">vs {match.opponent}</p>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {new Date(match.date).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'long', day: 'numeric'
                              })}
                            </p>

                            {/* Goals preview */}
                            {match.goals?.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                {match.goals.map((g, i) => (
                                  <span key={i} className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                                    <Target size={9} className="text-pink-400" />
                                    {g.scorer?.name || '?'}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                            <span className={`text-2xl font-bold ${getScoreColor(match.score)}`}>
                              {match.score}
                            </span>
                            <ChevronRight
                              size={18}
                              className={`transition-transform text-gray-600 ${isSelected ? 'rotate-90 text-purple-400' : ''}`}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── RIGHT: Edit Panel ── */}
            <div>
              {!editData ? (
                <div className="sticky top-6 bg-gray-950 border border-dashed border-gray-800 rounded-xl flex flex-col items-center justify-center py-20 text-center">
                  <Edit2 size={28} className="text-gray-700 mb-3" />
                  <p className="text-gray-600 text-sm">Click a match on the left<br />to edit it here</p>
                </div>
              ) : (
                <div className="sticky top-6 space-y-4">

                  {/* Panel header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                      vs {selectedMatch.opponent}
                    </h2>
                    <button onClick={closeEdit} className="text-gray-600 hover:text-gray-400 transition-colors">
                      <X size={18} />
                    </button>
                  </div>

                  {/* Match Info */}
                  <div className="bg-gray-950 rounded-xl p-5 border border-gray-800 space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Opponent</label>
                      <input
                        type="text"
                        value={editData.opponent}
                        onChange={(e) => setEditData(d => ({ ...d, opponent: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Score</label>
                        <input
                          type="text"
                          value={editData.score}
                          onChange={(e) => setEditData(d => ({ ...d, score: e.target.value }))}
                          placeholder="3-1"
                          className={inputClass + " text-center font-bold text-lg tracking-widest"}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Date</label>
                        <input
                          type="date"
                          value={editData.date}
                          onChange={(e) => setEditData(d => ({ ...d, date: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Goals */}
                  <div className="bg-gray-950 rounded-xl p-5 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Target size={16} className="text-pink-500" />
                        <span className="font-bold text-sm bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent">Goals</span>
                        {editData.goals.filter(g => g.scorer).length > 0 && (
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
                            {editData.goals.filter(g => g.scorer).length}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={addGoal}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 hover:opacity-90 transition-opacity text-xs font-medium"
                      >
                        <Plus size={13} />
                        Add
                      </button>
                    </div>

                    {editData.goals.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-gray-800 rounded-xl">
                        <Target size={22} className="mx-auto text-gray-700 mb-2" />
                        <p className="text-gray-600 text-xs">No goals yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {editData.goals.map((goal, index) => (
                          <div key={index} className="bg-gray-900 rounded-lg p-3 border border-gray-800">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-gray-500">#{goal.num}</span>
                              <button onClick={() => removeGoal(index)} className="text-gray-700 hover:text-red-400 transition-colors">
                                <X size={13} />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Scorer *</label>
                                <select value={goal.scorer} onChange={(e) => updateGoal(index, 'scorer', e.target.value)} className={selectClass}>
                                  <option value="">Select</option>
                                  {players.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Assister</label>
                                <select value={goal.assister} onChange={(e) => updateGoal(index, 'assister', e.target.value)} className={selectClass}>
                                  <option value="">None</option>
                                  {players.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>
                              </div>
                            </div>
                            <div className="flex gap-4">
                              {[['pen', 'Penalty'], ['ongoal', 'On Goal']].map(([field, label]) => (
                                <label key={field} className="flex items-center gap-1.5 cursor-pointer group">
                                  <input
                                    type="checkbox"
                                    checked={goal[field]}
                                    onChange={(e) => updateGoal(index, field, e.target.checked)}
                                    className="w-3.5 h-3.5 rounded accent-purple-500"
                                  />
                                  <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">{label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Absent Players */}
                  <div className="bg-gray-950 rounded-xl p-5 border border-gray-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Users size={15} className="text-cyan-500" />
                      <span className="font-bold text-sm bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent">Absent</span>
                      {editData.absentPlayers.length > 0 && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                          {editData.absentPlayers.length}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {players.map(player => {
                        const absent = editData.absentPlayers.includes(player._id);
                        return (
                          <label
                            key={player._id}
                            className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer border transition-all ${
                              absent ? 'bg-red-950/30 border-red-800/50' : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={absent}
                              onChange={() => toggleAbsent(player._id)}
                              className="w-3.5 h-3.5 rounded accent-purple-500"
                            />
                            <img
                              src={`/${player.name.toLowerCase()}.png`}
                              alt={player.name}
                              className={`w-6 h-6 rounded-full object-cover border border-gray-700 ${absent ? 'grayscale opacity-50' : ''}`}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <span className={`text-xs truncate ${absent ? 'text-red-400 line-through' : 'text-gray-300'}`}>
                              {player.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Stats */}
                  {liveStats.length > 0 && (
                    <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
                        <Zap size={14} className="text-purple-400" />
                        <span className="text-sm font-bold bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent">Live Stats</span>
                      </div>
                      <div className="divide-y divide-gray-800">
                        {liveStats.map(player => (
                          <div key={player._id} className="px-4 py-2.5 flex items-center gap-3">
                            <img
                              src={`/${player.name.toLowerCase()}.png`}
                              alt={player.name}
                              className="w-8 h-8 rounded-full object-cover border border-gray-700 flex-shrink-0"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <p className="text-sm font-bold flex-1 truncate">{player.name}</p>
                            <div className="flex gap-2">
                              {player.goals > 0 && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 rounded border border-yellow-500/30">
                                  <Target size={9} className="text-yellow-400" />
                                  <span className="text-xs text-yellow-400 font-bold">{player.goals}</span>
                                </div>
                              )}
                              {player.assists > 0 && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-cyan-500/20 rounded border border-cyan-500/30">
                                  <Zap size={9} className="text-cyan-400" />
                                  <span className="text-xs text-cyan-400 font-bold">{player.assists}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Save button */}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-3.5 rounded-lg bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity font-bold text-sm tracking-wide flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>

                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
