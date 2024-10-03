const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'front/build')));

// API route example
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

// All other requests go to the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'front/build', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
