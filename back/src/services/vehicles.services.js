"use strict";
// File: ./back/src/services/vehicles.services.ts
// Last change: Enhanced debug logging for raw DB values
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
exports.VehicleService = exports.GET_ALL_RECENT_DELIVERIES_QUERY = void 0;
var db_js_1 = require("../configs/db.js");
var vehicle_constants_js_1 = require("../constants/vehicle.constants.js");
exports.GET_ALL_RECENT_DELIVERIES_QUERY = "\nSELECT DISTINCT ON (d.id)\n    d.id,\n    d.vehicle_type,\n    d.delivery_id,\n    d.delivery_date,\n    d.delivery_time,\n    d.delivery_country,\n    d.delivery_city,\n    d.weight,\n    d.id_pp,\n    d.id_carrier,\n    d.name_carrier,\n    COALESCE(p.latitude, NULL) AS latitude,\n    COALESCE(p.longitude, NULL) AS longitude\nFROM deliveries d\nLEFT JOIN LATERAL (\n    SELECT latitude, longitude\n    FROM geo.postal_codes p\n    WHERE p.country_code = d.delivery_country \n      AND p.postal_code = d.delivery_zip\n    ORDER BY latitude DESC\n    LIMIT 1\n) p ON TRUE\nWHERE \n    (d.delivery_date::timestamp + d.delivery_time::interval) > (NOW() AT TIME ZONE 'UTC' - INTERVAL '".concat(vehicle_constants_js_1.DELIVERY_CONSTANTS.MAX_PAST_TIME_HOURS, " hours')\nORDER BY \n    d.id, d.delivery_date DESC, d.delivery_time DESC;\n\n\n\n\n\n");
var VehicleService = /** @class */ (function () {
    function VehicleService() {
        this.isHealthy = true;
        console.log("🔧 VehicleService instance created");
        this.checkHealth().catch(function (err) { return console.error("Initial health check failed:", err); });
    }
    VehicleService.getInstance = function () {
        if (!VehicleService.instance) {
            console.log("➕ Creating new VehicleService instance");
            VehicleService.instance = new VehicleService();
        }
        return VehicleService.instance;
    };
    VehicleService.prototype.checkHealth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("🔍 Starting database health check for vehicle service");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, db_js_1.pool.query("SELECT 1")];
                    case 2:
                        result = _a.sent();
                        this.isHealthy = true;
                        console.log("✅ Vehicle service database health check passed:", result.rows);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        this.isHealthy = false;
                        console.error("❌ Vehicle service database health check failed:", error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    VehicleService.prototype.searchVehicles = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var result, deliveries, vehicles, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!!this.isHealthy) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.checkHealth()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        console.log("\uD83D\uDD0D Fetching all vehicles from last ".concat(vehicle_constants_js_1.DELIVERY_CONSTANTS.MAX_PAST_TIME_HOURS, " hours"));
                        return [4 /*yield*/, db_js_1.pool.query(exports.GET_ALL_RECENT_DELIVERIES_QUERY)];
                    case 3:
                        result = _a.sent();
                        deliveries = result.rows;
                        console.log("[VehicleService] Query returned ".concat(deliveries.length, " raw delivery records"));
                        if (deliveries.length === 0) {
                            console.warn("\u26A0\uFE0F No deliveries found in the last ".concat(vehicle_constants_js_1.DELIVERY_CONSTANTS.MAX_PAST_TIME_HOURS, " hours"));
                            return [2 /*return*/, []];
                        }
                        vehicles = deliveries.map(function (delivery) {
                            var _a;
                            var datePart = delivery.delivery_date
                                ? "".concat(delivery.delivery_date.getFullYear(), "-").concat(String(delivery.delivery_date.getMonth() + 1).padStart(2, '0'), "-").concat(String(delivery.delivery_date.getDate()).padStart(2, '0'))
                                : new Date().toISOString().split("T")[0];
                            var timePart = delivery.delivery_time
                                ? String(delivery.delivery_time).padEnd(8, ":00").substring(0, 8)
                                : "00:00:00";
                            console.log("[VehicleService] Raw DB - id_pp: ".concat(delivery.id_pp, ", delivery_date: ").concat(delivery.delivery_date, ", delivery_time: ").concat(delivery.delivery_time));
                            console.log("[VehicleService] Processed - id_pp: ".concat(delivery.id_pp, ", delivery_date: ").concat(datePart, ", delivery_time: ").concat(timePart));
                            return {
                                id: delivery.id.toString(),
                                vehicle_type: delivery.vehicle_type || "UNKNOWN",
                                registration_number: delivery.delivery_id || "N/A",
                                carrier_id: ((_a = delivery.id_carrier) === null || _a === void 0 ? void 0 : _a.toString()) || "N/A",
                                carrier_name: delivery.name_carrier || "Unknown Carrier",
                                capacity: delivery.id_pp || 0,
                                max_weight: delivery.weight || 0,
                                current_location: {
                                    lat: delivery.latitude || 0,
                                    lng: delivery.longitude || 0,
                                    country_code: delivery.delivery_country || "N/A",
                                    city: delivery.delivery_city || "N/A",
                                },
                                delivery_date: datePart,
                                delivery_time: timePart,
                                id_pp: delivery.id_pp || 0,
                            };
                        });
                        console.log("[VehicleService] Processed ".concat(vehicles.length, " vehicles from last ").concat(vehicle_constants_js_1.DELIVERY_CONSTANTS.MAX_PAST_TIME_HOURS, " hours"));
                        return [2 /*return*/, vehicles];
                    case 4:
                        error_2 = _a.sent();
                        console.error("❌ Failed to fetch vehicles:", error_2);
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return VehicleService;
}());
exports.VehicleService = VehicleService;
