const axios = require('axios');
const cheerio = require('cheerio');
const Article = require('../models/Article');

exports.scrapeOldest = async (req, res) => {
    try {
        const blogUrl = 'https://beyondchats.com/blogs/';
        const { data } = await axios.get(blogUrl);
        const $ = cheerio.load(data);

        const lastPageLink = $('.page-numbers').not('.next').last().text();
        const oldestPageUrl = `${blogUrl}page/${lastPageLink}/`;

        const pageRes = await axios.get(oldestPageUrl);
        const $$ = cheerio.load(pageRes.data);
        
        const articleLinks = [];
        $$('article').slice(-5).each((i, el) => {
            articleLinks.push({
                title: $$(el).find('.entry-title a').text().trim(),
                originalUrl: $$(el).find('.entry-title a').attr('href'),
            });
        });

        // NEW: Visit each link to scrape the actual raw text
        const finalArticles = [];
        for (const item of articleLinks) {
            const detailRes = await axios.get(item.originalUrl);
            const $detail = cheerio.load(detailRes.data);
            
            // Extract all paragraph text from the blog body
            const rawText = $detail('.entry-content p, .post-content p')
                .map((i, el) => $detail(el).text())
                .get()
                .join('\n\n');

            finalArticles.push({
                ...item,
                content: rawText || "Content could not be extracted."
            });
        }

        // Save to MongoDB (using insertMany)
        const savedArticles = await Article.insertMany(finalArticles);
        res.status(200).json({ 
            message: "Phase 1 Complete: Real content scraped", 
            count: savedArticles.length 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};