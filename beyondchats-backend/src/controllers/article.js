const Article = require('../models/Article');
// FIX: Using destructured require correctly
const { refineSingleArticle } = require('./scraper'); 

exports.getAllArticles = async (req, res) => {
    try {
        const articles = await Article.find().sort({ createdAt: -1 });
        res.json(articles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.refineArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ error: "Article not found" });

        // Call the imported function
        const refinedData = await refineSingleArticle(article);
        
        const updatedArticle = await Article.findByIdAndUpdate(
            req.params.id, 
            { 
                updatedContent: refinedData.updatedContent,
                isUpdated: true,
                references: refinedData.references
            }, 
            { new: true }
        );

        res.json(updatedArticle);
    } catch (error) {
        console.error("❌ Refinement Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};