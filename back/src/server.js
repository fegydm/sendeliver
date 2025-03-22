"use strict";
// File: back/src/server.ts
// Last change: Adjusted imports to ensure correct type recognition
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var http_1 = require("http");
var ws_1 = require("ws");
var path_1 = require("path");
var url_1 = require("url");
var fs_1 = require("fs");
var dotenv_1 = require("dotenv");
var ai_routes_js_1 = require("./routes/ai.routes.js");
var geo_routes_js_1 = require("./routes/geo.routes.js");
var delivery_routes_js_1 = require("./routes/delivery.routes.js");
var vehicles_routes_js_1 = require("./routes/vehicles.routes.js");
var language_routes_js_1 = require("./routes/language.routes.js");
dotenv_1.default.config();
var requiredEnv = ["FRONTEND_PATH", "PUBLIC_PATH", "PORT"];
requiredEnv.forEach(function (envVar) {
    if (!process.env[envVar]) {
        process.exit(1);
    }
});
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
var projectRoot = path_1.default.resolve(__dirname, "../..");
var frontendPath = path_1.default.join(projectRoot, process.env.FRONTEND_PATH);
var publicPath = path_1.default.join(projectRoot, process.env.PUBLIC_PATH);
var app = (0, express_1.default)();
var server = http_1.default.createServer(app);
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://sendeliver.com",
    ],
    credentials: true,
}));
app.use(express_1.default.static(frontendPath));
app.use(express_1.default.static(publicPath));
var staticRoutes = [
    { url: "/pics", path: path_1.default.join(publicPath, "pics") },
    { url: "/flags", path: path_1.default.join(publicPath, "flags") },
    { url: "/animations", path: path_1.default.join(publicPath, "animations") },
    { url: "/assets", path: path_1.default.join(frontendPath, "assets") },
];
staticRoutes.forEach(function (route) {
    return app.use(route.url, express_1.default.static(route.path));
});
app.use("/api/ai", ai_routes_js_1.default);
app.use("/api/geo", geo_routes_js_1.default);
app.use("/api/vehicles", vehicles_routes_js_1.default);
app.use("/api", delivery_routes_js_1.default);
app.use("/api", language_routes_js_1.default);
app.get("*", function (req, res) {
    var possibleStaticFile = path_1.default.join(publicPath, req.path);
    if (fs_1.default.existsSync(possibleStaticFile)) {
        return res.sendFile(possibleStaticFile);
    }
    res.sendFile(path_1.default.join(frontendPath, "index.html"));
});
var setupWebSocketServer = function (server) {
    var wss = new ws_1.WebSocketServer({ server: server });
    var heartbeatInterval = 30000;
    wss.on("connection", function (ws) {
        ws.isAlive = true;
        ws.on("pong", function () {
            ws.isAlive = true;
        });
        ws.on("message", function (message) {
            try {
                var data = JSON.parse(message.toString());
                if (data.type === "ping") {
                    ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
                }
            }
            catch (error) {
                // No logging
            }
        });
        ws.on("error", function () {
            // No logging
        });
        ws.on("close", function () {
            // No logging
        });
    });
    var interval = setInterval(function () {
        wss.clients.forEach(function (ws) {
            if (!ws.isAlive)
                return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, heartbeatInterval);
    wss.on("close", function () {
        clearInterval(interval);
    });
};
setupWebSocketServer(server);
app.get("/api/health", function (_req, res) {
    res.json({ status: "ok" });
});
var PORT = parseInt(process.env.PORT || "5000", 10);
server.listen(PORT, "0.0.0.0");
