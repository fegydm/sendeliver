// File: back/src/routes/index.ts
// Last change: Debug version - commenting imports to find the problematic route

import { Router } from 'express';

// Basic imports first - test with these only
import aiRouter from "./ai.routes.js";
// import geoCountriesRouter from "./geo.countries.routes.js";
// import geoLanguagesRouter from "./geo.languages.routes.js";
// import geoTranslationsRouter from "./geo.translations.routes.js";
// import mapsRouter from "./maps.routes.js";
// import contactMessagesRoutes from "./contact.messages.routes.js";
// import vehiclesRouter from "./vehicles.routes.js";
// import deliveryRouter from "./delivery.routes.js";
// import externalDeliveriesRouter from "./external.deliveries.routes.js";
// import { publicAuthRouter, authenticatedAuthRouter } from "./auth.routes.js";
// import verifyPinRouter from "./verify-pin.routes.js";
// import gpsRouter from "./gps-enhanced.routes.js";  // SUSPICIOUS - different from before
// import { deviceTypeTestRouter } from "./device-type-test.routes.js";
import { authenticateJWT, checkRole } from "../middlewares/auth.middleware.js";
import { UserRole } from '@prisma/client';

const mainApiRouter = Router();
// const geoRouter = Router();

// geoRouter.use("/countries", geoCountriesRouter);
// geoRouter.use("/languages", geoLanguagesRouter);
// geoRouter.use("/translations", geoTranslationsRouter);

// mainApiRouter.use('/auth', publicAuthRouter);
// mainApiRouter.use('/auth', authenticatedAuthRouter);

mainApiRouter.use("/ai", aiRouter);
// mainApiRouter.use("/geo", geoRouter);
// mainApiRouter.use("/maps", mapsRouter);
// mainApiRouter.use("/vehicles", vehiclesRouter);
// mainApiRouter.use("/gps", gpsRouter);
// mainApiRouter.use('/contact', contactMessagesRoutes);
// mainApiRouter.use('/verify-pin', verifyPinRouter);

// mainApiRouter.use("/external/deliveries", authenticateJWT, externalDeliveriesRouter);
// mainApiRouter.use("/delivery", authenticateJWT, checkRole(UserRole.individual_customer, UserRole.dispatcher, UserRole.org_admin, UserRole.superadmin), deliveryRouter);
// mainApiRouter.use("/device-type-test", authenticateJWT, deviceTypeTestRouter);

export default mainApiRouter;