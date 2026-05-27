const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: { type: String },
  content: { type: String, required: true },
  platform: { type: String, default: 'reddit' },
  username: { type: String },
  category: { type: String },
  sentiment: { type: String },
  summary: { type: String },
  translatedText: { type: String },
  engagement: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);
