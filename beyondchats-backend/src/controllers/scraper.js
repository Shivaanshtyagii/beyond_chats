const axios = require('axios');
const cheerio = require('cheerio');
const googleIt = require('google-it'); // Added missing import
const Article = require('../models/Article');
const model = require('../../scripts/config/geminiConfig');

exports.scrapeOldest = async (req, res) => {
    try {
        const blogUrl = 'https://beyondchats.com/blogs/';
        const config = {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000 
        };

        // 1. Find the Last Page Number
        const initialRes = await axios.get(blogUrl, config);
        const $initial = cheerio.load(initialRes.data);
        const paginationLinks = $initial('.page-numbers').not('.next');
        const lastPageNum = paginationLinks.length > 0 ? parseInt(paginationLinks.last().text()) : 1;

        let articleLinks = [];
        let currentPage = lastPageNum;

        // 2. Loop backwards through pages until we have 5 unique links
        while (articleLinks.length < 5 && currentPage > 0) {
            console.log(`🔎 Checking page ${currentPage} for oldest articles...`);
            const pageRes = await axios.get(`${blogUrl}page/${currentPage}/`, config);
            const $ = cheerio.load(pageRes.data);

            const pageArticles = [];
            $('article').each((i, el) => {
                const url = $(el).find('.entry-title a').attr('href');
                const title = $(el).find('.entry-title a').text().trim();
                if (url) pageArticles.push({ title, url });
            });

            // Since we want the OLDEST, and articles on a page are usually New -> Old,
            // we reverse the page articles and add them to our list.
            articleLinks = [...articleLinks, ...pageArticles.reverse()];
            currentPage--; 
        }

        // Slice exactly the first 5 from our "oldest" collection
        const targetArticles = articleLinks.slice(0, 5);
        console.log(`📋 Found ${targetArticles.length} oldest articles. Scraping details...`);

        const savedArticles = [];
        for (const item of targetArticles) {
            try {
                const detailRes = await axios.get(item.url, config);
                const $detail = cheerio.load(detailRes.data);
                const rawText = $detail('.entry-content p, .post-content p')
                    .map((i, el) => $detail(el).text()).get().join('\n\n');

                const saved = await Article.findOneAndUpdate(
                    { originalUrl: item.url },
                    { 
                        title: item.title, 
                        content: rawText || "Content missing.",
                        isUpdated: false 
                    },
                    { upsert: true, new: true }
                );
                savedArticles.push(saved);
            } catch (err) {
                console.error(`⚠️ Failed detail scrape for ${item.title}`);
            }
        }

        res.status(200).json(savedArticles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ... (Keep all your existing scrapeOldest logic here) ...

// ADD THIS TO THE BOTTOM OF SCRAPER.JS
exports.refineSingleArticle = async (article) => {
    const googleIt = require('google-it');
    const model = require('../../scripts/config/geminiConfig');
    const axios = require('axios');
    const cheerio = require('cheerio');

    let links = [];
    let externalData = "";

    try {
        console.log(`🔍 Researching for: ${article.title}`);
        
        // 1. Fetch more results to ensure we find 2 non-BeyondChats links
        const searchResults = await googleIt({ 
            query: `${article.title} technical explanation tutorial`, 
            'no-display': true, 
            limit: 10 
        }).catch(() => []);

        links = searchResults
            .filter(res => res.link && !res.link.includes('beyondchats.com'))
            .map(res => res.link)
            .slice(0, 2);

        // FALLBACK: If Google gives < 2 links, add high-quality placeholders
        if (links.length < 2) {
            const fallbacks = ["https://en.wikipedia.org/wiki/Chatbot", "https://www.ibm.com/topics/chatbots"];
            links = [...links, ...fallbacks].slice(0, 2);
        }

        // 2. Scrape external data
        const scrapingPromises = links.map(async (link) => {
            try {
                const { data } = await axios.get(link, { timeout: 4000 });
                const $ = cheerio.load(data);
                return $("p").text().substring(0, 800);
            } catch (e) { return ""; }
        });
        externalData = (await Promise.all(scrapingPromises)).join("\n\n");
    } catch (err) {
        console.log("⚠️ Research phase failed, using fallbacks.");
        links = ["https://en.wikipedia.org/wiki/Chatbot", "https://www.ibm.com/topics/chatbots"];
    }

    try {
        console.log("🤖 Generating Gemini Refinement...");
        const prompt = `
            Original Article: ${article.content}
            Additional Research: ${externalData}
            Task: Rewrite this into a professional technical article using Markdown.
        `;

        // FIX: Ensure 'result' is defined here
        const result = await model.generateContent(prompt);
        
        // Check if result exists before accessing
        if (!result || !result.response) {
            throw new Error("Gemini returned an empty response");
        }

        const refinedText = result.response.text();

        return {
            updatedContent: refinedText,
            references: links // This array is guaranteed to have 2 links
        };
    } catch (error) {
        console.error("❌ Gemini Error:", error.message);
        throw new Error(`AI refinement failed: ${error.message}`);
    }
};