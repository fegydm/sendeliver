"use strict";
// File: src/services/geocoding.services.ts
// Last change: Enhanced error handling and added detailed logging
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
exports.GeocodingService = void 0;
var rate_limiter_js_1 = require("../utils/rate-limiter.js");
var GeocodingService = /** @class */ (function () {
    function GeocodingService() {
        // Rate limiter to ensure we respect Nominatim's rate limits (1 request per second)
        this.rateLimiter = new rate_limiter_js_1.RateLimiter(1, 1000);
    }
    GeocodingService.getInstance = function () {
        if (!GeocodingService.instance) {
            GeocodingService.instance = new GeocodingService();
        }
        return GeocodingService.instance;
    };
    /**
     * Validates if the response matches the expected Nominatim format.
     */
    GeocodingService.prototype.isNominatimResponse = function (data) {
        return (Array.isArray(data) &&
            data.every(function (item) {
                return typeof item === "object" &&
                    item !== null &&
                    "lat" in item &&
                    "lon" in item &&
                    "display_name" in item &&
                    "importance" in item;
            }));
    };
    /**
     * Fetches GPS coordinates for a given location using Nominatim API.
     * @param location - The name of the location to geocode.
     * @returns Coordinates object with latitude and longitude.
     */
    GeocodingService.prototype.getCoordinates = function (location) {
        return __awaiter(this, void 0, void 0, function () {
            var params, url, response, rawData, coordinates, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        console.log("[GEO] Fetching coordinates for location: \"".concat(location, "\""));
                        return [4 /*yield*/, this.rateLimiter.acquire()];
                    case 1:
                        _a.sent();
                        params = {
                            q: location,
                            format: "json",
                            limit: "1",
                            "accept-language": "sk",
                        };
                        url = "https://nominatim.openstreetmap.org/search?".concat(new URLSearchParams(params));
                        console.log("[GEO] Request URL: ".concat(url));
                        return [4 /*yield*/, fetch(url, {
                                headers: {
                                    "User-Agent": "SenDeliver/1.0",
                                    Accept: "application/json",
                                },
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Geocoding failed with status: ".concat(response.status));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        rawData = _a.sent();
                        console.log("[GEO] Raw response:", rawData);
                        if (!this.isNominatimResponse(rawData)) {
                            throw new Error("Invalid response format from Nominatim");
                        }
                        if (rawData.length === 0) {
                            throw new Error("Location not found: \"".concat(location, "\""));
                        }
                        coordinates = {
                            lat: parseFloat(rawData[0].lat),
                            lng: parseFloat(rawData[0].lon),
                        };
                        console.log("[GEO] Coordinates for \"".concat(location, "\":"), coordinates);
                        return [2 /*return*/, coordinates];
                    case 4:
                        error_1 = _a.sent();
                        console.error("[GEO] Failed to get coordinates for \"".concat(location, "\":"), error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return GeocodingService;
}());
exports.GeocodingService = GeocodingService;
