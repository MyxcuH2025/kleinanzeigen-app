const express = require('express');
const path = require('path');
const app = express();
const PORT = 5173;

// Statische Dateien aus public und src ausliefern
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/@vite', express.static(path.join(__dirname, 'node_modules/vite/dist/client')));

// Für alle anderen Routen index.html ausliefern (SPA-Fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple server running on http://localhost:${PORT}/`);
  console.log('Serving index.html for all routes');
});
