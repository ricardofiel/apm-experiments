'use strict';
const path = require('path');
const { migrate } = require('./migrate');
const app = require('./app');
const { RESERVED } = require('./validation');

migrate();

// Seed if requested
if (process.env.SEED === '1') {
  require('../scripts/seed');
}

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

// Admin routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'admin.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'admin.html')));

// Public artist landing page (exclude reserved paths)
app.get('/:handle', (req, res, next) => {
  const { handle } = req.params;
  if (RESERVED.has(handle)) return next();
  res.sendFile(path.join(__dirname, '..', 'public', 'artist.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Musician Linktree running at http://${HOST}:${PORT}`);
  console.log('⚠  Unauthenticated mode — do not expose this server to the public internet.');
});
