'use strict';
const express = require('express');
const router = express.Router();
const artistsRepo = require('../repositories/artistsRepo');
const linksRepo = require('../repositories/linksRepo');
const { validateUrl, requireFields } = require('../validation');

// List links for artist
router.get('/artists/:handle/links', (req, res) => {
  const artist = artistsRepo.getByHandle(req.params.handle);
  if (!artist) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Artist not found.' } });
  res.json(linksRepo.listByArtistId(artist.id));
});

// Create link for artist
router.post('/artists/:handle/links', (req, res) => {
  const artist = artistsRepo.getByHandle(req.params.handle);
  if (!artist) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Artist not found.' } });

  const { label, url, icon } = req.body || {};
  const rf = requireFields(req.body || {}, ['label', 'url']);
  if (!rf.ok) return res.status(400).json({ error: rf.error });

  const uv = validateUrl(url);
  if (!uv.ok) return res.status(400).json({ error: uv.error });

  const link = linksRepo.create({ artistId: artist.id, label, url, icon });
  res.status(201).json(link);
});

// Reorder links
router.post('/artists/:handle/links/reorder', (req, res) => {
  const artist = artistsRepo.getByHandle(req.params.handle);
  if (!artist) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Artist not found.' } });

  const { order } = req.body || {};
  if (!Array.isArray(order)) {
    return res.status(400).json({ error: { code: 'INVALID_ORDER', message: '`order` must be an array of link ids.' } });
  }

  const result = linksRepo.reorderForArtist(artist.id, order);
  if (!result) {
    return res.status(400).json({ error: { code: 'INVALID_ORDER', message: 'Order must include exactly all link ids owned by this artist.' } });
  }
  res.json(result);
});

// Update link
router.patch('/links/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Invalid link id.' } });

  const { url } = req.body || {};
  if (url !== undefined) {
    const uv = validateUrl(url);
    if (!uv.ok) return res.status(400).json({ error: uv.error });
  }

  const updated = linksRepo.updateById(id, req.body);
  if (!updated) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Link not found.' } });
  res.json(updated);
});

// Delete link
router.delete('/links/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Invalid link id.' } });

  const deleted = linksRepo.deleteById(id);
  if (!deleted) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Link not found.' } });
  res.status(204).end();
});

module.exports = router;
