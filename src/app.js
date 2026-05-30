'use strict';
const express = require('express');
const morgan = require('morgan');
const artistsRouter = require('./routes/artists');
const linksRouter = require('./routes/links');

const app = express();
app.use(morgan('dev'));
app.use(express.json());

// Static assets
app.use(express.static('public'));

// API
app.use('/api', artistsRouter);
app.use('/api', linksRouter);

// JSON 404 for /api/*
app.use('/api', (req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API route not found.' } });
});

// JSON error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: { code: err.code || 'SERVER_ERROR', message: err.message || 'Internal server error.' } });
});

module.exports = app;
