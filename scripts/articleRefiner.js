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
 * Targets 2 articles, scrapes external data, and enhances content using AI.
 */
async function startPhase2Refinement() {
    try {
        console.log("🚀 Starting Phase 2: Refinement (Gemini 2.5 Flash Edition)");
        
        // Step 1: Fetch articles from Phase 1 Backend
        const { data: allArticles } = await axios.get(API_BASE);
        
        // Step 2: Select exactly 2 articles to fulfill Phase 2 requirements
        const targetArticles = allArticles.slice(0, 2); 
        console.log(`📋 Found ${allArticles.length} articles. Refining the first 2 as per requirement.\n`);

        for (const article of targetArticles) {
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`📄 Target: "${article.title}"`);

            // Step 3: Google Search for External Knowledge
            let searchResults = [];
            try {
                // Broad query to ensure we get results even with bot-detection active
                searchResults = await googleIt({ 
                    query: `${article.title} technical overview`, 
                    'no-display': true, 
                    limit: 5 
                });
            } catch (err) { 
                console.log("⚠️ Search limited. Using internal AI knowledge."); 
            }

            const links = searchResults
                .filter(res => !res.link.includes('beyondchats.com'))
                .slice(0, 2)
                .map(res => res.link);

            console.log(`🔗 Found 2 Reference Links: ${links.length > 0 ? links.join(', ') : "None"}`);

            // Step 4: Parallel Scrape of Reference Sites
            const scrapingPromises = links.map(async (link) => {
                try {
                    const { data } = await axios.get(link, { timeout: 4000 });
                    const $ = cheerio.load(data);
                    return $("p").text().substring(0, 1000); // Grab top 1000 chars of text
                } catch (e) { return ""; }
            });
            const externalData = (await Promise.all(scrapingPromises)).join("\n\n");

            // Step 5: AI Refinement (Very Difficult Task)
            console.log("🤖 Gemini is rewriting content...");
            const prompt = `
                Act as a professional technical content editor.
                Original Article: ${article.content}
                ${externalData ? `Reference Material: ${externalData}` : "No external references available."}
                
                Requirements:
                - Expand the technical depth.
                - Use clear Markdown formatting (## for headers).
                - Maintain a professional tone.
                Return ONLY the rewritten body content.
            `;

            const result = await model.generateContent(prompt);
            const refinedText = result.response.text();

            // Step 6: Update Database via Backend API
            const finalPayload = {
                updatedContent: refinedText,
                isUpdated: true,
                references: links
            };
            
            await axios.put(`${API_BASE}/${article._id}`, finalPayload);

            console.log(`✅ Update Successful: ${article.title}`);
        }

        console.log("\n🏁 Phase 2 successfully finished!");
    } catch (error) {
        console.error("❌ Phase 2 Error:", error.message);
    }
}

startPhase2Refinement();