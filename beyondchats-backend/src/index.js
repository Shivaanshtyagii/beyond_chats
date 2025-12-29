require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  // Allows your live Vercel site OR your local development environment
  origin: [
    process.env.FRONTEND_URL, 
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json()); // Allows the server to accept JSON data in requests

// Routes

app.use('/api', apiRoutes);
app.get('/', (req, res) => {
    res.send('Server is working perfectly!');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));