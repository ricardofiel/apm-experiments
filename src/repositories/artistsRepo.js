'use strict';
const db = require('../db');

const now = () => new Date().toISOString();

const stmts = {
  list: db.prepare(`SELECT id, handle, display_name AS displayName, bio, avatar_url AS avatarUrl, created_at AS createdAt, updated_at AS updatedAt FROM artists ORDER BY display_name ASC`),
  getByHandle: db.prepare(`SELECT id, handle, display_name AS displayName, bio, avatar_url AS avatarUrl, created_at AS createdAt, updated_at AS updatedAt FROM artists WHERE handle = ?`),
  insert: db.prepare(`INSERT INTO artists (handle, display_name, bio, avatar_url, created_at, updated_at) VALUES (@handle, @displayName, @bio, @avatarUrl, @createdAt, @updatedAt)`),
  update: db.prepare(`UPDATE artists SET handle = @handle, display_name = @displayName, bio = @bio, avatar_url = @avatarUrl, updated_at = @updatedAt WHERE handle = @oldHandle`),
  delete: db.prepare(`DELETE FROM artists WHERE handle = ?`),
};

function list() {
  return stmts.list.all();
}

function getByHandle(handle) {
  return stmts.getByHandle.get(handle) || null;
}

function create({ handle, displayName, bio = null, avatarUrl = null }) {
  const ts = now();
  const info = stmts.insert.run({ handle, displayName, bio, avatarUrl, createdAt: ts, updatedAt: ts });
  return getByHandle(handle);
}

function updateByHandle(oldHandle, fields) {
  const existing = getByHandle(oldHandle);
  if (!existing) return null;
  const ts = now();
  stmts.update.run({
    oldHandle,
    handle: fields.handle ?? existing.handle,
    displayName: fields.displayName ?? existing.displayName,
    bio: fields.bio !== undefined ? fields.bio : existing.bio,
    avatarUrl: fields.avatarUrl !== undefined ? fields.avatarUrl : existing.avatarUrl,
    updatedAt: ts,
  });
  return getByHandle(fields.handle ?? existing.handle);
}

function deleteByHandle(handle) {
  const info = stmts.delete.run(handle);
  return info.changes > 0;
}

module.exports = { list, getByHandle, create, updateByHandle, deleteByHandle };
