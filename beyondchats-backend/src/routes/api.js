const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraper');
const articleController = require('../controllers/article');

// Button 1: Fetch New Articles
router.get('/scrape', scraperController.scrapeOldest);

// Button 2: Refine specific article
router.post('/articles/:id/refine', articleController.refineArticle);

// Main Dashboard Fetch
router.get('/articles', articleController.getAllArticles);

module.exports = router;