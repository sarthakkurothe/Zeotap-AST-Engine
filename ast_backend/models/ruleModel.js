const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  type: { type: String, required: true },
  left: { type: Object },
  right: { type: Object },
  value: { type: mongoose.Mixed },
});

const ruleSchema = new mongoose.Schema({
  ast: { type: nodeSchema, required: true }
});

module.exports = mongoose.model('Rule', ruleSchema);
