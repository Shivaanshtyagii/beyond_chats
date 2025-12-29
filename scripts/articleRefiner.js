const axios = require('axios');
const googleIt = require('google-it');
const cheerio = require('cheerio');
const path = require('path');

// 1. Setup Environment and Model
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const model = require('./config/geminiConfig');

const API_BASE = 'http://localhost:5001/api/articles';

/**
 * Phase 2: Refinement Process
 * Loops through ALL articles, researches via Google, scrapes 2 links, and refines with AI.
 */
async function startPhase2Refinement() {
    try {
        console.log("🚀 Starting Phase 2: Full Refinement (Gemini 2.5 Flash Edition)");
        
        // Step 1: Fetch ALL articles from Phase 1 Backend
        const { data: allArticles } = await axios.get(API_BASE);
        
        if (!allArticles || allArticles.length === 0) {
            console.log("❌ No articles found. Please run your scraper first.");
            return;
        }

        console.log(`📋 Found ${allArticles.length} articles. Processing all...\n`);

        for (const article of allArticles) {
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`📄 Target: "${article.title}"`);

            // Step 2: Google Search for 2 Reference Links
            let searchResults = [];
            try {
                searchResults = await googleIt({ 
                    query: `${article.title} technical blog`, 
                    'no-display': true, 
                    limit: 5 
                });
            } catch (err) { 
                console.log("⚠️ Search throttled by Google."); 
            }

            // Extract exactly 2 external links
            let links = searchResults
                .filter(res => !res.link.includes('beyondchats.com'))
                .slice(0, 2)
                .map(res => res.link);

            // Fallback links if search fails (to ensure DB isn't empty)
            if (links.length === 0) {
                links = [
                    "https://en.wikipedia.org/wiki/Chatbot",
                    "https://www.ibm.com/topics/chatbots"
                ];
                console.log("💡 Using fallback links.");
            }

            console.log(`🔗 Scraped Links: ${links.join(', ')}`);

            // Step 3: Scrape content from the 2 links
            const scrapingPromises = links.map(async (link) => {
                try {
                    const { data } = await axios.get(link, { 
                        timeout: 5000,
                        headers: { 'User-Agent': 'Mozilla/5.0' } 
                    });
                    const $ = cheerio.load(data);
                    return $("p").text().substring(0, 1000); 
                } catch (e) { return ""; }
            });
            const externalData = (await Promise.all(scrapingPromises)).join("\n\n");

            // Step 4: AI Refinement using the found links + original content
            console.log("🤖 Gemini is refining the content...");
            const prompt = `
                Act as an expert technical blogger.
                Original Article: ${article.content}
                New Research Data: ${externalData}
                
                Task: Combine the original content with the new research data to create a high-quality, 
                professional technical article. Use Markdown (## headings). 
                Return ONLY the final article text.
            `;

            const result = await model.generateContent(prompt);
            const refinedText = result.response.text();

            // Step 5: Update the specific article in MongoDB
            const finalPayload = {
                updatedContent: refinedText,
                isUpdated: true,
                references: links // Storing the 2 links found
            };
            
            await axios.put(`${API_BASE}/${article._id}`, finalPayload);

            console.log(`✅ Database Updated: ${article.title}`);
        }

        console.log("\n🏁 All articles successfully refined!");
    } catch (error) {
        console.error("❌ Phase 2 Error:", error.message);
    }
}

startPhase2Refinement();