const axios = require('axios');
const cheerio = require('cheerio');
const Article = require('../models/Article');

exports.scrapeOldest = async (req, res) => {
    try {
        const blogUrl = 'https://beyondchats.com/blogs/';
        const { data } = await axios.get(blogUrl);
        const $ = cheerio.load(data);

        // 1. Find the last page number from pagination [cite: 9]
        // Usually, the 'last' page is the second-to-last item in the pagination list
        const lastPageLink = $('.page-numbers').not('.next').last().text();
        const oldestPageUrl = `${blogUrl}page/${lastPageLink}/`;

        // 2. Scrape that specific page
        const pageRes = await axios.get(oldestPageUrl);
        const $$ = cheerio.load(pageRes.data);
        
        const articles = [];
        // Extract the last 5 (oldest) articles on that page [cite: 9]
        $$('article').slice(-5).each((i, el) => {
            articles.push({
                title: $$(el).find('.entry-title a').text().trim(),
                originalUrl: $$(el).find('.entry-title a').attr('href'),
                content: "Original blog content placeholder..." 
            });
        });

        // 3. Save to MongoDB [cite: 11]
        const savedArticles = await Article.insertMany(articles);
        res.status(200).json({ 
            message: "Successfully scraped 5 oldest articles", 
            count: savedArticles.length 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};