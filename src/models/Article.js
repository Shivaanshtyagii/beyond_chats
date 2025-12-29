const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    originalUrl: { type: String, required: true, unique: true },
    // Phase 1: The actual raw text from the blog
    content: { type: String, required: true }, 
    // Phase 2: The Gemini-refined technical article
    updatedContent: { type: String, default: "" }, 
    isUpdated: { type: Boolean, default: false },
    references: [{ type: String }], // External links found by AI
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Article', articleSchema);