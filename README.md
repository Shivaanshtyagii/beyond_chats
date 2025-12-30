# BeyondChats | Knowledge Evolution 🚀

**BeyondChats** is an AI-powered platform designed to transform dense, technical blog posts into structured, actionable insights. By leveraging the **Gemini 1.5 Flash** model, the system automates the extraction of key concepts, providing users with a side-by-side comparison of original content versus AI-enhanced intelligence.

---

## 🔗 Live Demo
* **Frontend Application:** [https://beyondchats-frontend-sepia.vercel.app](https://beyondchats-frontend-sepia.vercel.app)
* **Backend API:** [https://beyondchats-backend-lrwz.onrender.com](https://beyondchats-backend-lrwz.onrender.com)

---

## 🏗️ Project Architecture & Data Flow

The application utilizes a decoupled MERN architecture with an integrated AI processing pipeline.

### Architecture Diagram
```mermaid
graph TD
    A[User/Client] -->|Triggers Scrape/Refine| B(React Frontend)
    B -->|API Requests| C(Express Backend)
    
    %% Scraping Flow
    C -->|1. Scrape Request| D[External Blogs/URLs]
    D -->|2. Raw HTML| C
    C -->|3. Initial Save| E[(MongoDB Atlas)]
    
    %% Refinement Flow
    C <-->|4. Read Raw| E
    C -->|5. Prompt Request| F[Google Gemini AI]
    F -->|6. Structured Insights or AI Refined| C
    
    %% UI Update
    C -->|7. API Response| B
    B -->|8. Render Update| A


Shivansh Tyagi, ECE SVNIT ’26
