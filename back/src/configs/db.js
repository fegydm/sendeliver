"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
var pg_1 = require("pg");
var Pool = pg_1.default.Pool;
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
exports.pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: ((_a = process.env.DATABASE_URL) === null || _a === void 0 ? void 0 : _a.includes('render.com'))
        ? { rejectUnauthorized: false }
        : false
});
exports.pool.query('SELECT NOW()', function (err) {
    var _a;
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        var sanitizedUrl = (_a = process.env.DATABASE_URL) === null || _a === void 0 ? void 0 : _a.replace(/:[^:@]*@/, ':****@');
        console.error('Using connection:', sanitizedUrl);
    }
    else {
        console.log('✅ Database connected successfully');
    }
});
exports.default = exports.pool;
