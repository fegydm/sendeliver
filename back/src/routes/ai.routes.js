"use strict";
// File: ./back/src/routes/ai.routes.ts
// Last change: Fixed TypeScript errors related to request body typing and response methods
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
var ai_services_js_1 = require("../services/ai.services.js");
var geocoding_services_js_1 = require("../services/geocoding.services.js");
var error_handler_js_1 = require("../utils/error-handler.js");
var router = (0, express_1.Router)();
var logRawData = function (label, data) {
    console.log("[LOG][".concat(label, "] Raw Data:"), JSON.stringify(data, null, 2));
};
// Prompts for AI
var createPromptByType = {
    sender: function (message) { return "\n    You are a JSON extraction API. Extract logistics details from: \"".concat(message, "\"\n    Rulez:\n    1. ONLY respond with JSON\n    2. DO NOT add any other text\n    3. DO NOT ask questions\n    4. Extract ONLY mentioned information\n\n    Return in this format (include only fields that were mentioned):\n    {\n      \"pickupLocation\": \"City name if mentioned\",\n      \"deliveryLocation\": \"City name if mentioned\",\n      \"pickupTime\": \"YYYY-MM-DD if date mentioned\",\n      \"deliveryTime\": \"YYYY-MM-DD if date mentioned\",\n      \"weight\": \"value with kg if mentioned\",\n      \"palletCount\": number if mentioned\n    }\n  "); },
    hauler: function (message) { return "\n    You are a JSON extraction API. Extract vehicle details from: \"".concat(message, "\"\n    Rules:\n    1. ONLY respond with JSON\n    2. DO NOT add any other text\n    3. DO NOT ask questions\n    4. Extract ONLY mentioned information\n\n    Return in this format (include only fields that were mentioned):\n    {\n      \"pickupLocation\": \"Starting city if mentioned\",\n      \"deliveryLocation\": \"Destination city if mentioned\",\n      \"pickupTime\": \"YYYY-MM-DD if date mentioned\",\n      \"deliveryTime\": \"YYYY-MM-DD if date mentioned\"\n    }\n  "); },
    chat: function (message) { return "\n    You are a conversational assistant. Respond informatively to: \"".concat(message, "\"\n    Rules:\n    1. Respond in natural language\n    2. Provide helpful and concise answers\n    3. Do not include JSON unless explicitly requested\n  "); },
};
// AI Extraction Endpoint
router.post("/extract", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var message, prompt_1, aiResponse, extractedData, error_1, _a, status_1, body;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                message = req.body.message;
                logRawData("Extract Request", req.body);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                prompt_1 = createPromptByType.sender(message);
                return [4 /*yield*/, ai_services_js_1.AIService.getInstance().sendMessage({
                        message: prompt_1,
                        type: "sender",
                        lang1: "sk",
                        temperature: 0,
                    })];
            case 2:
                aiResponse = _b.sent();
                logRawData("AI Extract Response", aiResponse.content);
                extractedData = JSON.parse(aiResponse.content);
                res.json(extractedData);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                _a = (0, error_handler_js_1.handleAIError)(error_1), status_1 = _a.status, body = _a.body;
                logRawData("Extract Error", error_1);
                res.status(status_1).json(body);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// AI Chat Endpoint
router.post("/chat", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var message, prompt_2, aiResponse, error_2, _a, status_2, body;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                message = req.body.message;
                logRawData("Chat Request", req.body);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                prompt_2 = createPromptByType.chat(message);
                return [4 /*yield*/, ai_services_js_1.AIService.getInstance().sendMessage({
                        message: prompt_2,
                        type: "chat",
                        lang1: "sk",
                        temperature: 0.7,
                    })];
            case 2:
                aiResponse = _b.sent();
                logRawData("AI Chat Response", aiResponse.content);
                res.json({ reply: aiResponse.content });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _b.sent();
                _a = (0, error_handler_js_1.handleAIError)(error_2), status_2 = _a.status, body = _a.body;
                logRawData("Chat Error", error_2);
                res.status(status_2).json(body);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Geocoding Endpoint
router.post("/geo", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, pickup, delivery, results, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, pickup = _a.pickup, delivery = _a.delivery;
                logRawData("Geo Request", req.body);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, Promise.all([
                        pickup ? geocoding_services_js_1.GeocodingService.getInstance().getCoordinates(pickup) : null,
                        delivery ? geocoding_services_js_1.GeocodingService.getInstance().getCoordinates(delivery) : null,
                    ])];
            case 2:
                results = _b.sent();
                logRawData("Geo Results", results);
                res.json({
                    pickup: results[0],
                    delivery: results[1],
                });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _b.sent();
                logRawData("Geo Error", error_3);
                res.status(500).json({ error: "Failed to fetch coordinates", details: error_3 });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
