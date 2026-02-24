import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Trophy, Plus, X, ArrowLeft, Check, User } from 'lucide-react';

export default function AddMatch() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMatch, setNewMatch] = useState({
    opponent: '',
    score: '',
    date: new Date().toISOString().split('T')[0],
    goals: [],
    playersPresent: [], // Nouvelle propriété
  });

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
    }
  };

  const addGoal = () => {
    setNewMatch({
      ...newMatch,
      goals: [
        ...newMatch.goals,
        {
          num: newMatch.goals.length + 1,
          scorer: '',
          assister: '',
          pen: false,
          ongoal: false,
        },
      ],
    });
  };

  const updateGoal = (index, field, value) => {
    const updatedGoals = [...newMatch.goals];
    updatedGoals[index][field] = value;
    setNewMatch({ ...newMatch, goals: updatedGoals });
  };

  const removeGoal = (index) => {
    const updatedGoals = newMatch.goals.filter((_, i) => i !== index);
    updatedGoals.forEach((goal, i) => {
      goal.num = i + 1;
    });
    setNewMatch({ ...newMatch, goals: updatedGoals });
  };

  const togglePlayerPresence = (playerId) => {
    const isPresent = newMatch.playersPresent.includes(playerId);
    const updatedPlayersPresent = isPresent
      ? newMatch.playersPresent.filter(id => id !== playerId)
      : [...newMatch.playersPresent, playerId];
    setNewMatch({ ...newMatch, playersPresent: updatedPlayersPresent });
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
          ongoal: goal.ongoal,
        })),
      };

      const res = await fetch('/api/addMatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchData),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/');
      } else {
        alert('Error adding match: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding match:', error);
      alert('Error adding match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="text-blue-400" size={32} />
            Add New Match
          </h1>
          <div className="w-20"></div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 space-y-6">
          {/* Opponent, Score, Date */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Opponent Team</label>
            <input
              type="text"
              value={newMatch.opponent}
              onChange={(e) => setNewMatch({ ...newMatch, opponent: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Final Score</label>
              <input
                type="text"
                value={newMatch.score}
                onChange={(e) => setNewMatch({ ...newMatch, score: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Match Date</label>
              <input
                type="date"
                value={newMatch.date}
                onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              />
            </div>
          </div>

          {/* Players Present */}
          <div>
            <label className="block text-sm font-medium mb-3 text-slate-300">Players Present</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {players.map((player) => (
                <label
                  key={player._id}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    newMatch.playersPresent.includes(player._id)
                      ? 'bg-blue-600/20 border-blue-500'
                      : 'bg-slate-700/30 border-slate-600 hover:bg-slate-600/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={newMatch.playersPresent.includes(player._id)}
                    onChange={() => togglePlayerPresence(player._id)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <User size={16} />
                  <span className="text-sm">{player.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-slate-300">Goals Scored</label>
              <button
                type="button"
                onClick={addGoal}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
              >
                <Plus size={16} />
                Add Goal
              </button>
            </div>

            {newMatch.goals.length === 0 ? (
              <div className="text-center py-8 bg-slate-700/20 rounded-lg border border-slate-600 border-dashed">
                <p className="text-slate-400">No goals added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {newMatch.goals.map((goal, index) => (
                  <div key={index} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-400">Goal #{goal.num}</span>
                      <button
                        type="button"
                        onClick={() => removeGoal(index)}
                        className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                      >
                        <X size={16} />
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Scorer *</label>
                        <select
                          value={goal.scorer}
                          onChange={(e) => updateGoal(index, 'scorer', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm"
                        >
                          <option value="">Select player</option>
                          {players.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Assister</label>
                        <select
                          value={goal.assister}
                          onChange={(e) => updateGoal(index, 'assister', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm"
                        >
                          <option value="">None</option>
                          {players.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={goal.pen}
                          onChange={(e) => updateGoal(index, 'pen', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-300">Penalty</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={goal.ongoal}
                          onChange={(e) => updateGoal(index, 'ongoal', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-300">On Goal</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
          >
            {loading ? 'Saving...' : 'Save Match'}
          </button>
        </form>
      </div>
    </div>
  );
}