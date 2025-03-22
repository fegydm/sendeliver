"use strict";
// File: back/src/routes/delivery.routes.ts
// Last change: Fixed TypeScript errors related to request and response types
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var pg_1 = require("pg");
var Pool = pg_1.default.Pool;
var express_1 = require("express");
var pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
var router = (0, express_1.Router)();
router.post("/import-delivery", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, id, delivery_date, delivery_time, delivery_type, delivery_country, delivery_zip, delivery_city, weight, id_pp, id_carrier, name_carrier, vehicle_type, existing, result, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, id = _a.id, delivery_date = _a.delivery_date, delivery_time = _a.delivery_time, delivery_type = _a.delivery_type, delivery_country = _a.delivery_country, delivery_zip = _a.delivery_zip, delivery_city = _a.delivery_city, weight = _a.weight, id_pp = _a.id_pp, id_carrier = _a.id_carrier, name_carrier = _a.name_carrier, vehicle_type = _a.vehicle_type;
                if (!id_pp || !delivery_date) {
                    res.status(400).json({
                        status: "NOT_OK",
                        error: "Missing required fields: 'id_pp' and 'delivery_date' are mandatory."
                    });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, pool.query("SELECT 1 FROM deliveries WHERE id_pp = $1 LIMIT 1", [id_pp])];
            case 1:
                existing = _b.sent();
                if (existing.rowCount && existing.rowCount > 0) {
                    res.status(200).json({
                        status: "OK",
                        message: "Delivery with ID_PP ".concat(id_pp, " already exists. No action taken.")
                    });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, pool.query("INSERT INTO deliveries \n            (delivery_id, delivery_date, delivery_time, delivery_type, \n            delivery_country, delivery_zip, delivery_city, weight, \n            id_pp, id_carrier, name_carrier, vehicle_type)\n            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *", [id, delivery_date, delivery_time, delivery_type, delivery_country, delivery_zip, delivery_city, weight, id_pp, id_carrier, name_carrier, vehicle_type])];
            case 2:
                result = _b.sent();
                res.status(201).json({
                    status: "OK",
                    message: "\u2705 Delivery with ID_PP ".concat(id_pp, " was successfully recorded."),
                    data: result.rows[0]
                });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                next(error_1); // Forwarding error to error-handling middleware
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
