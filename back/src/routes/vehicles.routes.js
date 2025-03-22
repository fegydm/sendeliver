"use strict";
// File: ./back/src/routes/vehicles.routes.ts
// Router for vehicle search API endpoint, updated with centralized constants
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var express_1 = require("express");
var vehicles_services_js_1 = require("../services/vehicles.services.js");
var fs = require("fs/promises");
var url_1 = require("url");
var path = require("path");
var vehicle_constants_js_1 = require("../constants/vehicle.constants.js"); // Import centralized constants
var router = (0, express_1.Router)();
var vehicleService = vehicles_services_js_1.VehicleService.getInstance();
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path.dirname(__filename);
var logFilePath = path.join(__dirname, "vehicle_search_logs.txt");
// Function to append log entries to a file
function logToFile(message) {
    return __awaiter(this, void 0, void 0, function () {
        var timestamp, logEntry, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    timestamp = new Date().toISOString();
                    logEntry = "[".concat(timestamp, "] ").concat(message, "\n");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.appendFile(logFilePath, logEntry)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error("Failed to write to log file:", err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Earth's radius in kilometers
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
// Convert degrees to radians
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
// Filter vehicles based on form criteria (distance, capacity, weight, time)
function filterVehiclesByFormCriteria(vehicles, params) {
    if (!Array.isArray(vehicles)) {
        var errorMessage = "❌ filterVehiclesByFormCriteria: Expected array, got: " + typeof vehicles;
        console.error(errorMessage);
        logToFile(errorMessage);
        return [];
    }
    var withDistances = vehicles.map(function (vehicle) {
        var _a, _b, _c, _d;
        var distance = 0;
        if (((_a = params.pickup) === null || _a === void 0 ? void 0 : _a.lat) !== undefined &&
            ((_b = params.pickup) === null || _b === void 0 ? void 0 : _b.lng) !== undefined &&
            ((_c = vehicle.current_location) === null || _c === void 0 ? void 0 : _c.lat) !== undefined &&
            ((_d = vehicle.current_location) === null || _d === void 0 ? void 0 : _d.lng) !== undefined) {
            distance = calculateDistance(params.pickup.lat, params.pickup.lng, vehicle.current_location.lat, vehicle.current_location.lng);
        }
        return __assign(__assign({}, vehicle), { distance: Math.round(distance), availability_date: vehicle.delivery_date, availability_time: vehicle.delivery_time });
    });
    var withinDistance = withDistances.filter(function (vehicle) { return vehicle.distance <= vehicle_constants_js_1.DELIVERY_CONSTANTS.MAX_DISTANCE_KM; });
    return withinDistance.filter(function (vehicle) {
        var _a, _b, _c;
        if (((_a = params.cargo) === null || _a === void 0 ? void 0 : _a.pallets) !== undefined &&
            params.cargo.pallets > 0 &&
            vehicle.capacity < params.cargo.pallets) {
            return false;
        }
        if (((_b = params.cargo) === null || _b === void 0 ? void 0 : _b.weight) !== undefined &&
            params.cargo.weight > 0 &&
            vehicle.max_weight < params.cargo.weight) {
            return false;
        }
        if (((_c = params.pickup) === null || _c === void 0 ? void 0 : _c.time) && vehicle.availability_date && vehicle.availability_time) {
            var pickupTime = new Date(params.pickup.time);
            var vehicleAvailTime = new Date("".concat(vehicle.availability_date, "T").concat(vehicle.availability_time, "Z"));
            if (vehicleAvailTime > pickupTime)
                return false;
        }
        return true;
    });
}
// Handle vehicle search request
var handleSearchVehicles = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var errorMsg, _a, pickup_1, delivery, cargo, errorMsg, warnLog, searchParams, vehiclesResult, vehicles, totalVehiclesCount, filteredVehicles, vehiclesWithinDistance, summaryLog, serviceError_1, errorMessage, errorLog, error_1, errorMessage, errorTrace, errorLog;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 14, , 16]);
                console.log("🔍 Received vehicle search request");
                return [4 /*yield*/, logToFile("Received request body: ".concat(JSON.stringify(req.body, null, 2)))];
            case 1:
                _c.sent();
                if (!!req.body) return [3 /*break*/, 3];
                errorMsg = "Request body is missing";
                console.error("\u274C ".concat(errorMsg));
                return [4 /*yield*/, logToFile("\u274C ".concat(errorMsg))];
            case 2:
                _c.sent();
                res.status(400).json({ error: errorMsg });
                return [2 /*return*/];
            case 3:
                _a = req.body, pickup_1 = _a.pickup, delivery = _a.delivery, cargo = _a.cargo;
                if (!!pickup_1) return [3 /*break*/, 5];
                errorMsg = "Missing pickup data in request";
                console.error("\u274C ".concat(errorMsg));
                return [4 /*yield*/, logToFile("\u274C ".concat(errorMsg))];
            case 4:
                _c.sent();
                res.status(400).json({ error: errorMsg });
                return [2 /*return*/];
            case 5:
                if (!(!pickup_1.lat || !pickup_1.lng)) return [3 /*break*/, 7];
                warnLog = "⚠️ Missing pickup location coordinates";
                console.warn(warnLog);
                return [4 /*yield*/, logToFile(warnLog)];
            case 6:
                _c.sent();
                res.status(400).json({
                    error: "Missing pickup coordinates",
                    message: "Pickup location must include latitude and longitude",
                });
                return [2 /*return*/];
            case 7:
                console.log("📋 Search with parameters:", {
                    pickup: {
                        coords: "".concat(pickup_1.lat, ",").concat(pickup_1.lng),
                        country: (_b = pickup_1.country) === null || _b === void 0 ? void 0 : _b.cc,
                        city: pickup_1.city,
                    },
                    cargo: cargo,
                });
                searchParams = {
                    pickup: {
                        country: pickup_1.country || { cc: "", flag: "" },
                        psc: pickup_1.psc || "",
                        city: pickup_1.city || "",
                        time: pickup_1.time || new Date().toISOString(),
                        lat: pickup_1.lat,
                        lng: pickup_1.lng,
                    },
                    delivery: {
                        country: (delivery === null || delivery === void 0 ? void 0 : delivery.country) || { cc: "", flag: "" },
                        psc: (delivery === null || delivery === void 0 ? void 0 : delivery.psc) || "",
                        city: (delivery === null || delivery === void 0 ? void 0 : delivery.city) || "",
                        time: (delivery === null || delivery === void 0 ? void 0 : delivery.time) || "",
                        lat: (delivery === null || delivery === void 0 ? void 0 : delivery.lat) || 0,
                        lng: (delivery === null || delivery === void 0 ? void 0 : delivery.lng) || 0,
                    },
                    cargo: {
                        pallets: (cargo === null || cargo === void 0 ? void 0 : cargo.pallets) || 0,
                        weight: (cargo === null || cargo === void 0 ? void 0 : cargo.weight) || 0,
                    },
                };
                console.log("\uD83D\uDD0D Searching vehicles with MAX_DISTANCE=".concat(vehicle_constants_js_1.DELIVERY_CONSTANTS.MAX_DISTANCE_KM, "km"));
                _c.label = 8;
            case 8:
                _c.trys.push([8, 11, , 13]);
                return [4 /*yield*/, vehicleService.searchVehicles(searchParams)];
            case 9:
                vehiclesResult = _c.sent();
                console.log("\u2705 Service returned ".concat(vehiclesResult.length, " total vehicles"));
                vehicles = Array.isArray(vehiclesResult) ? vehiclesResult : [];
                if (vehicles.length === 0) {
                    console.log("⚠️ No vehicles found in the database");
                    res.json({
                        totalCount: 0,
                        filtered: 0,
                        vehicles: [],
                    });
                    return [2 /*return*/];
                }
                totalVehiclesCount = vehicles.length;
                filteredVehicles = filterVehiclesByFormCriteria(vehicles, req.body);
                vehiclesWithinDistance = vehicles.filter(function (vehicle) {
                    var distance = calculateDistance(pickup_1.lat, pickup_1.lng, vehicle.current_location.lat, vehicle.current_location.lng);
                    return distance <= vehicle_constants_js_1.DELIVERY_CONSTANTS.MAX_DISTANCE_KM;
                }).length;
                filteredVehicles.sort(function (a, b) { return a.distance - b.distance; });
                summaryLog = "\uD83D\uDCCA Found ".concat(totalVehiclesCount, " total vehicles, ").concat(vehiclesWithinDistance, " within ").concat(vehicle_constants_js_1.DELIVERY_CONSTANTS.MAX_DISTANCE_KM, "km, ").concat(filteredVehicles.length, " after all filters");
                console.log(summaryLog);
                return [4 /*yield*/, logToFile(summaryLog)];
            case 10:
                _c.sent();
                res.json({
                    totalCount: totalVehiclesCount,
                    withinDistance: vehiclesWithinDistance,
                    filtered: filteredVehicles.length,
                    vehicles: filteredVehicles,
                });
                return [3 /*break*/, 13];
            case 11:
                serviceError_1 = _c.sent();
                errorMessage = serviceError_1 instanceof Error ? serviceError_1.message : "Unknown service error";
                errorLog = "\u274C Vehicle service error: ".concat(errorMessage);
                console.error(errorLog);
                console.error(serviceError_1);
                return [4 /*yield*/, logToFile(errorLog)];
            case 12:
                _c.sent();
                res.status(500).json({ error: "Vehicle service error: ".concat(errorMessage) });
                return [3 /*break*/, 13];
            case 13: return [3 /*break*/, 16];
            case 14:
                error_1 = _c.sent();
                errorMessage = error_1 instanceof Error ? error_1.message : "Unknown error";
                errorTrace = error_1 instanceof Error && error_1.stack ? error_1.stack : "No stack trace";
                errorLog = "\u274C Vehicle search failed: ".concat(errorMessage);
                console.error(errorLog);
                console.error(errorTrace);
                return [4 /*yield*/, logToFile("".concat(errorLog, "\nStack: ").concat(errorTrace))];
            case 15:
                _c.sent();
                res.status(500).json({ error: "Failed to search for vehicles: ".concat(errorMessage) });
                return [3 /*break*/, 16];
            case 16: return [2 /*return*/];
        }
    });
}); };
router.post("/search", handleSearchVehicles);
exports.default = router;
