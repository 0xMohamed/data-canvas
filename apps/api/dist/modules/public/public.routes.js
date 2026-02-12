"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateParams_1 = require("../../middlewares/validateParams");
const zod_1 = require("zod");
const public_controller_1 = require("./public.controller");
const router = (0, express_1.Router)();
const publicTokenParamsSchema = zod_1.z.object({
    token: zod_1.z.string().min(10),
});
router.get("/canvases/:token", (0, validateParams_1.validateParams)(publicTokenParamsSchema), public_controller_1.getPublicCanvas);
exports.default = router;
