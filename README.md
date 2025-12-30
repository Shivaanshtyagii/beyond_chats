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
    A[User/Client] -->|Triggers Actions| B(React Frontend)
    B -->|API Requests| C(Express Backend)
    C -->|Axios/Cheerio| D[External Blogs/URLs]
    D -->|Raw Data| C
    C -->|Store/Fetch| E[(MongoDB Atlas)]
    C -->|Prompt Engineering| F[Google Gemini AI]
    F -->|Refined Insights| C
    C -->|Surgical Update| E
    E -->|Real-time Updates| B
