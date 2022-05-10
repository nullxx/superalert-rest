import * as controller from "../controllers/key.controller";

import { Router } from "express";
import { applyValidation } from "../validations/index.validation";
import * as keyValidation from "../validations/key.validation";
import { injectUser } from "../middlewares/auth.middleware";

const keysRouter = Router();

keysRouter
    .route("/")
    .post(injectUser,...keyValidation.createKey, applyValidation, controller.createKey);

keysRouter.route("/").get(injectUser, controller.getKeys);

export { keysRouter };
