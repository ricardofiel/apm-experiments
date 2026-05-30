'use strict';
const express = require('express');
const router = express.Router();
const repo = require('../repositories/artistsRepo');
const { validateHandle, requireFields, RESERVED } = require('../validation');

// List all artists
router.get('/artists', (req, res) => {
  res.json(repo.list());
});

// Create artist
router.post('/artists', (req, res) => {
  const { handle, displayName, bio, avatarUrl } = req.body || {};

  const req1 = requireFields(req.body || {}, ['handle', 'displayName']);
  if (!req1.ok) return res.status(400).json({ error: req1.error });

  const hv = validateHandle(handle);
  if (!hv.ok) return res.status(400).json({ error: hv.error });

  if (repo.getByHandle(handle)) {
    return res.status(409).json({ error: { code: 'HANDLE_TAKEN', message: `Handle '${handle}' is already taken.` } });
  }

  const artist = repo.create({ handle, displayName, bio, avatarUrl });
  res.status(201).json(artist);
});

// Get artist by handle
router.get('/artists/:handle', (req, res) => {
  const artist = repo.getByHandle(req.params.handle);
  if (!artist) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Artist not found.' } });
  res.json(artist);
});

// Update artist
router.patch('/artists/:handle', (req, res) => {
  const { handle: newHandle, displayName, bio, avatarUrl } = req.body || {};

  if (newHandle !== undefined) {
    const hv = validateHandle(newHandle);
    if (!hv.ok) return res.status(400).json({ error: hv.error });
    if (newHandle !== req.params.handle && repo.getByHandle(newHandle)) {
      return res.status(409).json({ error: { code: 'HANDLE_TAKEN', message: `Handle '${newHandle}' is already taken.` } });
    }
  }

  const updated = repo.updateByHandle(req.params.handle, { handle: newHandle, displayName, bio, avatarUrl });
  if (!updated) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Artist not found.' } });
  res.json(updated);
});

// Delete artist
router.delete('/artists/:handle', (req, res) => {
  const deleted = repo.deleteByHandle(req.params.handle);
  if (!deleted) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Artist not found.' } });
  res.status(204).end();
});

module.exports = router;
