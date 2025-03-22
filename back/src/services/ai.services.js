"use strict";
// File: src/services/ai.services.ts
// Last change: Added bounding box handling and dual-source geodata storage
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
exports.AIService = void 0;
var openai_1 = require("openai");
var openai_config_js_1 = require("../configs/openai.config.js");
var geocoding_services_js_1 = require("./geocoding.services.js");
var fs_1 = require("fs");
var AIService = /** @class */ (function () {
    function AIService() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not set in environment variables");
        }
        this.openai = new openai_1.OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    AIService.getInstance = function () {
        if (!this.instance) {
            this.instance = new AIService();
        }
        return this.instance;
    };
    AIService.prototype.logRawResponse = function (content) {
        console.log("[AI] Raw response:", content);
        fs_1.default.appendFileSync("ai_responses.log", "[".concat(new Date().toISOString(), "] ").concat(content, "\n"));
    };
    AIService.prototype.extractJSON = function (content) {
        try {
            var jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.warn("[AI] No JSON found in response. Raw content:", content);
                return null;
            }
            var parsedData = JSON.parse(jsonMatch[0]);
            console.log("[AI] Extracted JSON data:", parsedData);
            return parsedData;
        }
        catch (error) {
            console.error("[AI] Failed to parse JSON:", error);
            return null;
        }
    };
    AIService.prototype.fetchCoordinates = function (location, source) {
        return __awaiter(this, void 0, void 0, function () {
            var geocodingService, geoData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        geocodingService = geocoding_services_js_1.GeocodingService.getInstance();
                        if (!(source === "GEO")) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, geocodingService.getCoordinates(location)];
                    case 2:
                        geoData = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, geoData), { source: "GEO" })];
                    case 3:
                        error_1 = _a.sent();
                        console.error("[GEO] Failed to fetch coordinates for \"".concat(location, "\""), error_1);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/, null];
                }
            });
        });
    };
    AIService.prototype.sendMessage = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var language, systemPromptText, completion, content, extractedData, geoData, geoPickup, geoDelivery, error_2;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        language = request.lang1 || "en";
                        systemPromptText = "\n      You are a logistics assistant. Based on the user's input, extract the following details:\n\n      1. Pickup location (required)\n      2. Delivery location (optional)\n      3. Pickup time (optional)\n      4. Delivery time (optional)\n      5. Weight (optional)\n      6. Pallet count (optional)\n\n      For the pickup and delivery locations, always provide GPS coordinates (latitude and longitude) and bounding box (if possible).\n\n      Respond in this format:\n      {\n        \"pickupLocation\": \"<city>\",\n        \"pickupCoordinates\": { \"lat\": <latitude>, \"lng\": <longitude>, \"boundingbox\": [<south>, <north>, <west>, <east>] },\n        \"deliveryLocation\": \"<city>\",\n        \"deliveryCoordinates\": { \"lat\": <latitude>, \"lng\": <longitude>, \"boundingbox\": [<south>, <north>, <west>, <east>] },\n        \"pickupTime\": \"<YYYY-MM-DD>\",\n        \"deliveryTime\": \"<YYYY-MM-DD>\",\n        \"weight\": \"<number>kg\",\n        \"palletCount\": <number>\n      }\n\n      For missing optional details, include them as `null` or ask the user for clarification.\n      ";
                        console.log("[AI] Prompt sent to OpenAI:", systemPromptText);
                        return [4 /*yield*/, this.openai.chat.completions.create({
                                model: openai_config_js_1.AI_CONFIG.model,
                                messages: [
                                    { role: "system", content: systemPromptText },
                                    { role: "user", content: request.message },
                                ],
                                temperature: openai_config_js_1.AI_CONFIG.temperature,
                                max_tokens: 1000,
                            })];
                    case 1:
                        completion = _c.sent();
                        content = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "";
                        this.logRawResponse(content);
                        extractedData = this.extractJSON(content);
                        if (!extractedData || !extractedData.pickupLocation) {
                            throw new Error("Failed to extract required data from AI response.");
                        }
                        geoData = {};
                        // Fetch AI and GEO coordinates for pickup
                        if (extractedData.pickupCoordinates) {
                            geoData.pickup = geoData.pickup || [];
                            geoData.pickup.push(__assign(__assign({}, extractedData.pickupCoordinates), { source: "AI" }));
                        }
                        return [4 /*yield*/, this.fetchCoordinates(extractedData.pickupLocation, "GEO")];
                    case 2:
                        geoPickup = _c.sent();
                        if (geoPickup) {
                            geoData.pickup = geoData.pickup || [];
                            geoData.pickup.push(geoPickup);
                        }
                        // Fetch AI and GEO coordinates for delivery
                        if (extractedData.deliveryCoordinates) {
                            geoData.delivery = geoData.delivery || [];
                            geoData.delivery.push(__assign(__assign({}, extractedData.deliveryCoordinates), { source: "AI" }));
                        }
                        if (!extractedData.deliveryLocation) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.fetchCoordinates(extractedData.deliveryLocation, "GEO")];
                    case 3:
                        geoDelivery = _c.sent();
                        if (geoDelivery) {
                            geoData.delivery = geoData.delivery || [];
                            geoData.delivery.push(geoDelivery);
                        }
                        _c.label = 4;
                    case 4:
                        extractedData.geoData = geoData;
                        return [2 /*return*/, {
                                content: content,
                                data: extractedData,
                            }];
                    case 5:
                        error_2 = _c.sent();
                        console.error("[AI] OpenAI API Error:", error_2);
                        throw error_2;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return AIService;
}());
exports.AIService = AIService;
