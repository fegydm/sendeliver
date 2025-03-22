"use strict";
// File: back/src/constants/pagination.constants.ts
// Last change: Adjusted constants for bulk loading approach
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_QUERY_SIZE = exports.DEFAULT_FETCH_SIZE = void 0;
// Server-side pagination
exports.DEFAULT_FETCH_SIZE = 100; // Standard fetch size for locations
exports.MAX_QUERY_SIZE = 1000; // Maximum allowed query size for safety
