import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
  num: { type: Number, required: true },
  scorer: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  assister: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null },
  pen: { type: Boolean, default: false },
  ongoal: { type: Boolean, default: false }
});

const MatchSchema = new mongoose.Schema({
  opponent: { type: String, required: true },
  score: { type: String, required: true },
  date: { type: Date, default: Date.now },
  goals: [GoalSchema]
}, { timestamps: true });

export default mongoose.models.Match || mongoose.model('Match', MatchSchema);