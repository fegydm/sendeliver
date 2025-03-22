"use strict";
// File: .back/src/routes/geo.routes.ts
// Last change: Fixed type issues for Express and query parsing types
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
var geo_services_js_1 = require("../services/geo.services.js");
var geo_constants_js_1 = require("../constants/geo.constants.js");
var router = (0, express_1.Router)();
var geoService = geo_services_js_1.GeoService.getInstance();
// Handler for getting countries list
var handleGetCountries = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var q, countries, result, searchTerm_1, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                q = req.query.q;
                return [4 /*yield*/, geoService.getCountries()];
            case 1:
                countries = _a.sent();
                if (!countries) {
                    console.error("❌ No countries data received");
                    res.status(500).json({ error: "Failed to fetch countries" });
                    return [2 /*return*/];
                }
                result = countries;
                if (q && typeof q === 'string') {
                    searchTerm_1 = q.toLowerCase();
                    result = countries.filter(function (country) {
                        return country.name_en.toLowerCase().includes(searchTerm_1) ||
                            country.name_sk.toLowerCase().includes(searchTerm_1);
                    });
                }
                result.sort(function (a, b) { return a.name_en.localeCompare(b.name_en); });
                console.log("✅ Countries fetched:", result.length);
                res.json(result);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error("❌ Error fetching countries:", error_1);
                res.status(500).json({ error: "Failed to fetch countries" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Handler for getting locations
var handleGetLocation = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, psc, city, cc, _b, limit, lastPsc, lastCity, checkExists, checkExistsBoolean, exists, limitValue, searchParams, searchResults, hasMore, error_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                _a = req.query, psc = _a.psc, city = _a.city, cc = _a.cc, _b = _a.limit, limit = _b === void 0 ? geo_constants_js_1.DEFAULT_FETCH_SIZE.toString() : _b, lastPsc = _a.lastPsc, lastCity = _a.lastCity, checkExists = _a.checkExists;
                // Log incoming parameters for debugging
                console.log('🔍 Search params:', {
                    psc: psc === 'empty' ? undefined : psc,
                    city: city === 'empty' ? undefined : city,
                    cc: cc === 'empty' ? undefined : cc
                });
                checkExistsBoolean = checkExists === 'true';
                if (checkExists !== undefined && checkExists !== 'true' && checkExists !== 'false') {
                    res.status(400).json({ error: "Invalid checkExists value" });
                    return [2 /*return*/];
                }
                if (!checkExistsBoolean) return [3 /*break*/, 2];
                return [4 /*yield*/, geoService.checkLocationExists(psc === 'empty' ? undefined : psc, city === 'empty' ? undefined : city, cc === 'empty' ? undefined : cc)];
            case 1:
                exists = _c.sent();
                res.json({ exists: exists });
                return [2 /*return*/];
            case 2:
                limitValue = parseInt(limit, 10);
                if (isNaN(limitValue) || limitValue <= 0 || limitValue > geo_constants_js_1.MAX_QUERY_SIZE) {
                    res.status(400).json({
                        error: "Invalid limit value (must be between 1 and ".concat(geo_constants_js_1.MAX_QUERY_SIZE, ")")
                    });
                    return [2 /*return*/];
                }
                // Validate input parameters
                if (psc && typeof psc !== 'string') {
                    res.status(400).json({ error: "Invalid postal code (psc) value" });
                    return [2 /*return*/];
                }
                if (city && typeof city !== 'string') {
                    res.status(400).json({ error: "Invalid city value" });
                    return [2 /*return*/];
                }
                if (cc && typeof cc !== 'string') {
                    res.status(400).json({ error: "Invalid country code (cc) value" });
                    return [2 /*return*/];
                }
                searchParams = {
                    psc: psc === 'empty' ? undefined : psc,
                    city: city === 'empty' ? undefined : city,
                    cc: cc === 'empty' ? undefined : cc,
                    limit: limitValue,
                    pagination: {
                        lastPsc: lastPsc === 'empty' ? undefined : lastPsc,
                        lastCity: lastCity === 'empty' ? undefined : lastCity
                    }
                };
                return [4 /*yield*/, geoService.searchLocations(searchParams)];
            case 3:
                searchResults = _c.sent();
                hasMore = (!searchParams.psc && !searchParams.city)
                    ? searchResults.results.length === limitValue
                    : false;
                console.log("\uD83D\uDCCA Found ".concat(searchResults.results.length, " locations"));
                res.json({
                    results: searchResults.results,
                    hasMore: hasMore
                });
                return [3 /*break*/, 5];
            case 4:
                error_2 = _c.sent();
                console.error("❌ Search failed:", error_2);
                res.status(500).json({ error: "Failed to search locations" });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
// Handler for getting postal format for a country
var handleGetCountryPostalFormat = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cc, postalFormat, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                cc = req.query.cc;
                if (!cc || typeof cc !== 'string') {
                    res.status(400).json({ error: "Invalid or missing country code" });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, geoService.getCountryPostalFormat(cc)];
            case 1:
                postalFormat = _a.sent();
                if (!postalFormat) {
                    res.status(404).json({ error: "Postal format not found for given country code" });
                    return [2 /*return*/];
                }
                res.json(postalFormat);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error("❌ Failed to get country postal format:", error_3);
                res.status(500).json({ error: "Failed to retrieve postal format" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
router.get("/countries", handleGetCountries);
router.get("/location", handleGetLocation);
router.get("/country_formats", handleGetCountryPostalFormat); // New route
exports.default = router;
