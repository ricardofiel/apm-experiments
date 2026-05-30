'use strict';

const HANDLE_RE = /^[a-z0-9][a-z0-9\-_]{1,29}$/;
const RESERVED = new Set(['api', 'admin', 'assets', 'css', 'js']);

function validateHandle(handle) {
  if (typeof handle !== 'string' || !HANDLE_RE.test(handle)) {
    return { ok: false, error: { code: 'INVALID_HANDLE', message: 'Handle must be 2-30 chars, lowercase alphanumeric, hyphens, underscores; cannot start with hyphen/underscore.' } };
  }
  if (RESERVED.has(handle)) {
    return { ok: false, error: { code: 'INVALID_HANDLE', message: `'${handle}' is a reserved path and cannot be used as a handle.` } };
  }
  return { ok: true };
}

function validateUrl(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error();
    return { ok: true };
  } catch {
    return { ok: false, error: { code: 'INVALID_URL', message: 'URL must be a valid http or https URL.' } };
  }
}

function requireFields(obj, fields) {
  for (const f of fields) {
    if (obj[f] === undefined || obj[f] === null || (typeof obj[f] === 'string' && obj[f].trim() === '')) {
      return { ok: false, error: { code: 'INVALID_INPUT', message: `Field '${f}' is required and must be non-empty.` } };
    }
  }
  return { ok: true };
}

module.exports = { validateHandle, validateUrl, requireFields, RESERVED };
