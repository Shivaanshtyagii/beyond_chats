const express = require('express');
const router = express.Router();
const { scrapeOldest } = require('../controllers/scraper');
const { getAllArticles, createArticle, updateArticle, deleteArticle } = require('../controllers/article');

// Scraping Route
router.get('/scrape', scrapeOldest);

// CRUD Routes 
router.get('/articles', getAllArticles);
router.post('/articles', createArticle);
router.put('/articles/:id', updateArticle);
router.delete('/articles/:id', deleteArticle);

module.exports = router;