const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    originalUrl: { type: String },
    // Fields for Phase 2 (LLM Enhancement)
    isUpdated: { type: Boolean, default: false },
    updatedContent: { type: String, default: null },
    references: [{ type: String }] // To store the two Google Search links [cite: 22]
}, { timestamps: true });

module.exports = mongoose.model('Article', ArticleSchema);