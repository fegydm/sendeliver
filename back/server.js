const app = require('./app'); // Načítanie Express aplikácie z app.js
const port = process.env.PORT || 5000; // Definovanie portu

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
