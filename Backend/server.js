require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/dbConfig');
const userRoutes = require('./routes/userRoutes');
const analyzeRoutes = require('./routes/analyzeRoutes');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/analyze', analyzeRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});