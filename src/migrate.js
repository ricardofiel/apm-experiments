'use strict';
const db = require('./db');

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS artists (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      handle       TEXT    UNIQUE NOT NULL,
      display_name TEXT    NOT NULL,
      bio          TEXT,
      avatar_url   TEXT,
      created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS links (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      artist_id  INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
      label      TEXT    NOT NULL,
      url        TEXT    NOT NULL,
      icon       TEXT,
      position   INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `);
}

module.exports = { migrate };
