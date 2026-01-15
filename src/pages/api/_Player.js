import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  img: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Player || mongoose.model('Player', PlayerSchema);