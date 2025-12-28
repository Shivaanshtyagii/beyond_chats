const Article = require('../models/Article');

// Get all articles (for Phase 3 Frontend) [cite: 24]
exports.getAllArticles = async (req, res) => {
    try {
        const articles = await Article.find();
        res.json(articles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new article
exports.createArticle = async (req, res) => {
    try {
        const newArticle = new Article(req.body);
        const saved = await newArticle.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update an article (Critical for Phase 2 LLM updates) [cite: 21]
exports.updateArticle = async (req, res) => {
    try {
        const updated = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete an article
exports.deleteArticle = async (req, res) => {
    try {
        await Article.findByIdAndDelete(req.params.id);
        res.json({ message: "Article deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};