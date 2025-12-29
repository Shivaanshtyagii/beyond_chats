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
 * Takes Phase 1 "content", researches via Google, 
 * and saves to Phase 2 "updatedContent".
 */
async function startPhase2Refinement() {
    try {
        console.log("🚀 Starting Phase 2: Refining Phase 1 Data into Phase 2 Content");
        
        // Step 1: Fetch ALL articles (which currently have Raw Content in the 'content' field)
        const { data: allArticles } = await axios.get(API_BASE);
        
        if (!allArticles || allArticles.length === 0) {
            console.log("❌ No articles found in DB. Please run your Phase 1 Scraper first.");
            return;
        }

        console.log(`📋 Found ${allArticles.length} articles. Processing...\n`);

        for (const article of allArticles) {
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`📄 Processing: "${article.title}"`);

            // Skip if the content is just the old placeholder (Safety check)
            if (article.content === "Original blog content placeholder...") {
                console.log("⚠️ Skipping: This article still has the placeholder. Re-run Phase 1 Scraper.");
                continue;
            }

            // Step 2: Google Search for Technical Context
            let searchResults = [];
            try {
                searchResults = await googleIt({ 
                    query: `${article.title} technical explanation tutorial`, 
                    'no-display': true, 
                    limit: 4 
                });
            } catch (err) { 
                console.log("⚠️ Search throttled by Google. Using fallbacks."); 
            }

            // Extract external links (excluding the source blog)
            let links = searchResults
                .filter(res => !res.link.includes('beyondchats.com'))
                .slice(0, 2)
                .map(res => res.link);

            if (links.length === 0) {
                links = ["https://en.wikipedia.org/wiki/Special:Random"]; // Dynamic fallback
            }

            // Step 3: Scrape external data to provide more "meat" to Gemini
            const scrapingPromises = links.map(async (link) => {
                try {
                    const { data } = await axios.get(link, { timeout: 4000 });
                    const $ = cheerio.load(data);
                    return $("p").text().substring(0, 800); 
                } catch (e) { return ""; }
            });
            const externalResearch = (await Promise.all(scrapingPromises)).join("\n\n");

            // Step 4: AI Refinement
            // We give Gemini the Original Scrape + External Research
            console.log("🤖 Gemini is generating the 'Updated Version'...");
            const prompt = `
                Context: You are a Lead Technical Content Writer.
                
                Phase 1 Raw Content (Scraped from Blog): 
                "${article.content}"
                
                Supporting Technical Research: 
                "${externalResearch}"
                
                Task:
                1. Expand the Phase 1 Raw Content using the Supporting Research.
                2. Write a comprehensive, professional technical article.
                3. Use Markdown formatting (## headings, **bold**, bullet points).
                4. Maintain the core message of the original title: "${article.title}".
                
                Return ONLY the final Markdown article.
            `;

            const result = await model.generateContent(prompt);
            const refinedText = result.response.text();

            // Step 5: Update MongoDB via PUT
            // We preserve 'content' (Phase 1) and fill 'updatedContent' (Phase 2)
            const finalPayload = {
                updatedContent: refinedText,
                isUpdated: true,
                references: links
            };
            
            await axios.put(`${API_BASE}/${article._id}`, finalPayload);

            console.log(`✅ Successfully Refined: ${article.title}`);
        }

        console.log("\n🏁 Phase 2 Complete! Your DB now has both 'Previous' and 'Updated' versions.");
    } catch (error) {
        console.error("❌ Phase 2 Error:", error.message);
    }
}

startPhase2Refinement();