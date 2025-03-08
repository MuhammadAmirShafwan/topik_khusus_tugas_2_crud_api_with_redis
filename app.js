const express = require('express');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

// Setup Express
const app = express();
app.use(express.json());

// Routes
app.use('/', userRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ returnCode: '99', returnDesc: 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT || 8089;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
