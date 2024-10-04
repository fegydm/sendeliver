const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000; // Nastav port na 5000 alebo použij port z prostredia

// Nastav statické súbory na servírovanie z build priečinka
app.use(express.static(path.join(__dirname, '../front/build')));

// Route pre obsluhu hlavnej stránky
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../front/build/index.html'));
});

// Spusti server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
