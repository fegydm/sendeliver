"use strict";
// File: .back/src/services/geo.services.ts
// Last change: Added explicit type for row parameter in map function
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
exports.GeoService = void 0;
var db_js_1 = require("../configs/db.js");
var geo_queries_js_1 = require("./geo.queries.js");
var GeoService = /** @class */ (function () {
    function GeoService() {
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
        this.isHealthy = true;
        console.log('🔧 GeoService instance created');
        this.checkHealth().catch(function (err) { return console.error('Initial health check failed:', err); });
    }
    GeoService.getInstance = function () {
        if (!GeoService.instance) {
            console.log('➕ Creating new GeoService instance');
            GeoService.instance = new GeoService();
        }
        return GeoService.instance;
    };
    GeoService.prototype.isCacheValid = function () {
        var _a;
        var cacheAge = Date.now() - GeoService.lastCacheTime;
        var isValid = GeoService.countriesCache !== null && cacheAge < this.CACHE_DURATION;
        console.log('🕵️ Checking cache validity:', {
            hasCache: GeoService.countriesCache !== null,
            cacheLength: ((_a = GeoService.countriesCache) === null || _a === void 0 ? void 0 : _a.length) || 0,
            cacheAge: "".concat(Math.round(cacheAge / 1000), "s"),
            maxAge: "".concat(this.CACHE_DURATION / 1000, "s"),
            isValid: isValid
        });
        return isValid;
    };
    GeoService.prototype.checkHealth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🔍 Starting database health check');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, db_js_1.pool.query('SELECT 1')];
                    case 2:
                        result = _a.sent();
                        this.isHealthy = true;
                        console.log('✅ Database health check passed:', result.rows);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        this.isHealthy = false;
                        console.error('❌ Database health check failed:', error_1 instanceof Error ? error_1.stack : error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GeoService.prototype.shouldUseExactCountryMatch = function (countryCode) {
        console.log('🕵️ Checking exact country match:', {
            countryCode: countryCode,
            isExactMatch: (countryCode === null || countryCode === void 0 ? void 0 : countryCode.length) === 2
        });
        return (countryCode === null || countryCode === void 0 ? void 0 : countryCode.length) === 2;
    };
    GeoService.prototype.hasSearchInput = function (psc, city) {
        return !!(psc || city);
    };
    GeoService.prototype.getCountryCodeFilter = function (countryCode) {
        if (!countryCode)
            return undefined;
        var normalizedCode = countryCode.trim().toUpperCase();
        console.log('🌍 Normalizing country code:', { input: countryCode, normalized: normalizedCode });
        if (normalizedCode.length === 2)
            return normalizedCode;
        if (normalizedCode.length === 1)
            return normalizedCode;
        return undefined;
    };
    GeoService.prototype.getCountries = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('🌍 Starting getCountries');
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        if (!!this.isHealthy) return [3 /*break*/, 3];
                        console.log('⚠️ Service not healthy, running health check');
                        return [4 /*yield*/, this.checkHealth()];
                    case 2:
                        _b.sent();
                        console.log('✅ Health restored after check');
                        _b.label = 3;
                    case 3:
                        if (this.isCacheValid()) {
                            console.log('✅ Returning cached countries:', ((_a = GeoService.countriesCache) === null || _a === void 0 ? void 0 : _a.length) || 0);
                            return [2 /*return*/, GeoService.countriesCache];
                        }
                        console.log('🔄 Fetching fresh countries data');
                        console.log('📜 Query:', geo_queries_js_1.GET_COUNTRIES_QUERY);
                        return [4 /*yield*/, db_js_1.pool.query(geo_queries_js_1.GET_COUNTRIES_QUERY)];
                    case 4:
                        result = _b.sent();
                        console.log('📊 Countries fetched from DB:', {
                            rowCount: result.rowCount,
                            rows: result.rows
                        });
                        GeoService.countriesCache = result.rows;
                        GeoService.lastCacheTime = Date.now();
                        console.log('✅ Countries cached:', {
                            total: result.rows.length,
                            timestamp: new Date(GeoService.lastCacheTime).toISOString()
                        });
                        return [2 /*return*/, result.rows];
                    case 5:
                        error_2 = _b.sent();
                        console.error('❌ Failed to fetch countries:', error_2 instanceof Error ? error_2.stack : error_2);
                        GeoService.countriesCache = null;
                        GeoService.lastCacheTime = 0;
                        throw error_2;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    GeoService.prototype.getCountryPostalFormat = function (cc) {
        return __awaiter(this, void 0, void 0, function () {
            var normalizedCC, result, error_3;
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
                        normalizedCC = cc.trim().toUpperCase();
                        console.log('📮 Fetching postal format for:', normalizedCC);
                        return [4 /*yield*/, db_js_1.pool.query(geo_queries_js_1.GET_COUNTRY_POSTAL_FORMAT_QUERY, [normalizedCC])];
                    case 3:
                        result = _a.sent();
                        console.log('📊 Postal format result:', result.rows);
                        if (result.rows.length === 0) {
                            console.warn("\u26A0\uFE0F No postal format found for country code: ".concat(normalizedCC));
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, {
                                postal_code_format: result.rows[0].postal_code_format,
                                postal_code_regex: result.rows[0].postal_code_regex
                            }];
                    case 4:
                        error_3 = _a.sent();
                        console.error("\u274C Failed to get postal format for ".concat(cc, ":"), error_3);
                        throw error_3;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    GeoService.prototype.searchLocations = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var countryFilter, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        if (!!this.isHealthy) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.checkHealth()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        console.log('🔍 Detailed Search Params:', {
                            cc: params.cc,
                            psc: params.psc,
                            city: params.city,
                            shouldUseExactCountryMatch: this.shouldUseExactCountryMatch(params.cc),
                            countryFilter: this.getCountryCodeFilter(params.cc)
                        });
                        countryFilter = this.getCountryCodeFilter(params.cc);
                        console.log('🌍 Country Filter:', countryFilter);
                        if (!this.hasSearchInput(params.psc, params.city) && !countryFilter) {
                            console.log('⚠️ No search input or country filter, returning empty');
                            return [2 /*return*/, { results: [], hasMore: false }];
                        }
                        result = void 0;
                        if (!this.shouldUseExactCountryMatch(params.cc)) return [3 /*break*/, 4];
                        console.log('🎯 Using Exact Country Match Query');
                        return [4 /*yield*/, db_js_1.pool.query(geo_queries_js_1.SEARCH_LOCATION_BY_COUNTRY_QUERY, [
                                params.psc || null,
                                params.city || null,
                                params.cc,
                                params.pagination.lastPsc || null,
                                params.pagination.lastCity || null,
                                params.limit
                            ])];
                    case 3:
                        result = _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        console.log('🔎 Using General Location Query');
                        return [4 /*yield*/, db_js_1.pool.query(geo_queries_js_1.SEARCH_LOCATION_QUERY, [
                                params.psc || null,
                                params.city || null,
                                countryFilter || null,
                                params.pagination.lastPsc || null,
                                params.pagination.lastCity || null,
                                params.limit
                            ])];
                    case 5:
                        result = _a.sent();
                        _a.label = 6;
                    case 6:
                        console.log("\uD83D\uDCCA Found ".concat(result.rows.length, " locations"));
                        if (result.rows.length > 0) {
                            console.log('🔍 Sample row data:', {
                                firstRow: result.rows[0],
                                hasCoordinates: result.rows[0].latitude !== undefined && result.rows[0].longitude !== undefined
                            });
                        }
                        return [2 /*return*/, {
                                results: result.rows.map(function (row) { return ({
                                    cc: row.country_code,
                                    psc: row.postal_code,
                                    city: row.place_name,
                                    country: row.country,
                                    flag_url: row.flag_url,
                                    logistics_priority: row.logistics_priority,
                                    lat: row.latitude,
                                    lng: row.longitude
                                }); }),
                                hasMore: result.rows.length >= params.limit
                            }];
                    case 7:
                        error_4 = _a.sent();
                        console.error('❌ Failed to search locations:', error_4);
                        throw error_4;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    GeoService.prototype.checkLocationExists = function (psc, city, cc) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!!this.isHealthy) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.checkHealth()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, db_js_1.pool.query(geo_queries_js_1.CHECK_LOCATION_EXISTS_QUERY, [
                            psc || null,
                            city || null,
                            cc || null
                        ])];
                    case 3:
                        result = _a.sent();
                        console.log('🕵️ Location check result:', result.rows[0]);
                        return [2 /*return*/, result.rows[0].found];
                    case 4:
                        error_5 = _a.sent();
                        console.error('❌ Failed to check location:', error_5);
                        throw error_5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    GeoService.countriesCache = null;
    GeoService.lastCacheTime = 0;
    return GeoService;
}());
exports.GeoService = GeoService;
