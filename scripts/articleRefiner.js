const axios = require('axios');
const googleIt = require('google-it');
const cheerio = require('cheerio');
const model = require('./config/geminiConfig');

const API_BASE = 'http://localhost:5001/api/articles';

async function refineArticles() {
  try {
    console.log("Starting Phase 2: Refinement Process...");

    // 1. Fetch articles from your Phase 1 API
    const { data: articles } = await axios.get(API_BASE);

    for (const article of articles) {
      console.log(`\n📄 Processing: "${article.title}"`);

      // 2. Google Search for the title
      const searchResults = await googleIt({ query: article.title });
      
      // 3. Get top 2 external links
      const links = searchResults
        .filter(res => !res.link.includes('beyondchats.com'))
        .slice(0, 2)
        .map(res => res.link);

      console.log(`🔗 Found References: ${links.join(', ')}`);

      // 4. Scrape content from these links
      let externalData = "";
      for (const link of links) {
        try {
          const { data } = await axios.get(link, { timeout: 5000 });
          const $ = cheerio.load(data);
          externalData += $("p").text().substring(0, 1500) + "\n\n";
        } catch (e) {
          console.log(`Skipping ${link}`);
        }
      }

      // 5. Ask Gemini to rewrite
      console.log("Gemini is generating improved content...");
      const prompt = `
        Original Title: ${article.title}
        Original Content: ${article.content}
        
        Reference Information from Google: ${externalData}
        
        Task: Rewrite the original content to be more professional, in-depth, and well-formatted. 
        Match the quality of the top-ranking reference articles. 
        Return ONLY the rewritten text.
      `;

      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text();

      // 6. Update the Database using your Phase 1 PUT API
      const finalVersion = `${aiResponse}\n\n---\n**Sources:**\n${links.join('\n')}`;
      
      await axios.put(`${API_BASE}/${article._id}`, {
        updatedContent: finalVersion,
        isUpdated: true,
        references: links
      });

      console.log(`✅ Successfully refined: ${article.title}`);
    }
    console.log("\n🏁 Phase 2 Complete!");
  } catch (error) {
    console.error("Refinement Error:", error.message);
  }
}

refineArticles();