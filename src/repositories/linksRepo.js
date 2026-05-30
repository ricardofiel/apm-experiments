'use strict';
const db = require('../db');

const now = () => new Date().toISOString();

const stmts = {
  listByArtistId: db.prepare(`SELECT id, artist_id AS artistId, label, url, icon, position, created_at AS createdAt, updated_at AS updatedAt FROM links WHERE artist_id = ? ORDER BY position ASC`),
  maxPosition: db.prepare(`SELECT COALESCE(MAX(position), -1) AS maxPos FROM links WHERE artist_id = ?`),
  insert: db.prepare(`INSERT INTO links (artist_id, label, url, icon, position, created_at, updated_at) VALUES (@artistId, @label, @url, @icon, @position, @createdAt, @updatedAt)`),
  getById: db.prepare(`SELECT id, artist_id AS artistId, label, url, icon, position, created_at AS createdAt, updated_at AS updatedAt FROM links WHERE id = ?`),
  update: db.prepare(`UPDATE links SET label = @label, url = @url, icon = @icon, updated_at = @updatedAt WHERE id = @id`),
  delete: db.prepare(`DELETE FROM links WHERE id = ?`),
  setPosition: db.prepare(`UPDATE links SET position = @position, updated_at = @updatedAt WHERE id = @id`),
  listIdsByArtistId: db.prepare(`SELECT id FROM links WHERE artist_id = ? ORDER BY position ASC`),
};

function listByArtistId(artistId) {
  return stmts.listByArtistId.all(artistId);
}

function create({ artistId, label, url, icon = null }) {
  const ts = now();
  const { maxPos } = stmts.maxPosition.get(artistId);
  const position = maxPos + 1;
  const info = stmts.insert.run({ artistId, label, url, icon, position, createdAt: ts, updatedAt: ts });
  return stmts.getById.get(info.lastInsertRowid);
}

function updateById(id, fields) {
  const existing = stmts.getById.get(id);
  if (!existing) return null;
  const ts = now();
  stmts.update.run({
    id,
    label: fields.label ?? existing.label,
    url: fields.url ?? existing.url,
    icon: fields.icon !== undefined ? fields.icon : existing.icon,
    updatedAt: ts,
  });
  return stmts.getById.get(id);
}

function deleteById(id) {
  const info = stmts.delete.run(id);
  return info.changes > 0;
}

const reorderForArtist = db.transaction((artistId, orderedIds) => {
  const existingIds = stmts.listIdsByArtistId.all(artistId).map(r => r.id);
  if (
    orderedIds.length !== existingIds.length ||
    !orderedIds.every(id => existingIds.includes(id))
  ) {
    return null; // signals invalid order
  }
  const ts = now();
  for (let i = 0; i < orderedIds.length; i++) {
    stmts.setPosition.run({ id: orderedIds[i], position: i, updatedAt: ts });
  }
  return stmts.listByArtistId.all(artistId);
});

module.exports = { listByArtistId, create, updateById, deleteById, reorderForArtist };
