// File: back/src/routes/index.ts
// Last change: Complete routes organization with all routes

import { Router } from 'express';
import { authenticateJWT, checkRole } from "../middlewares/auth.middleware.js";

// Import all routes
import aiRouter from "./ai.routes.js";
import geoCountriesRouter from "./geo.countries.routes.js";
import geoLanguagesRouter from "./geo.languages.routes.js";
import geoTranslationsRouter from "./geo.translations.routes.js";
import mapsRouter from "./maps.routes.js";
import contactMessagesRoutes from "./contact.messages.routes.js";
import vehiclesRouter from "./vehicles.routes.js";
import deliveryRouter from "./delivery.routes.js";
import externalDeliveriesRouter from "./external.deliveries.routes.js";
import { publicAuthRouter, authenticatedAuthRouter } from "./auth.routes.js";
import verifyPinRouter from "./verify-pin.routes.js";
import gpsRouter from "./gps-enhanced.routes.js";
import { deviceTypeTestRouter } from "./device-type-test.routes.js";

const mainApiRouter = Router();

console.log('[ROUTES INDEX] Loading all routes...');

// Public routes (no authentication)
mainApiRouter.use('/auth', publicAuthRouter);
mainApiRouter.use('/auth', authenticatedAuthRouter);

mainApiRouter.use("/ai", aiRouter);
mainApiRouter.use("/geo/countries", geoCountriesRouter);
mainApiRouter.use("/geo/languages", geoLanguagesRouter);
mainApiRouter.use("/geo/translations", geoTranslationsRouter);
mainApiRouter.use("/maps", mapsRouter);
mainApiRouter.use("/vehicles", vehiclesRouter);
mainApiRouter.use("/gps", gpsRouter);
mainApiRouter.use('/contact', contactMessagesRoutes);
mainApiRouter.use('/verify-pin', verifyPinRouter);

// Protected routes (with authentication middleware)
mainApiRouter.use("/external/deliveries", authenticateJWT, externalDeliveriesRouter);
mainApiRouter.use("/delivery", authenticateJWT, deliveryRouter);
mainApiRouter.use("/device-type-test", authenticateJWT, deviceTypeTestRouter);

// Health check
mainApiRouter.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

console.log('[ROUTES INDEX] All routes loaded successfully');

export default mainApiRouter;