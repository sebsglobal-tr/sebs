// ULID Generator for unique user publicId
import { monotonicFactory } from 'ulid';

const ulid = monotonicFactory();

export function generateULID() {
  return ulid();
}

export function isValidULID(str) {
  return typeof str === 'string' && str.length === 26 && /^[0-9A-Z]{26}$/.test(str);
}

