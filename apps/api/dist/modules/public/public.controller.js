"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicCanvas = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const public_service_1 = require("./public.service");
exports.getPublicCanvas = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const token = req.params.token;
    const data = await (0, public_service_1.getPublicCanvasWithBlocks)(token);
    return res.status(200).json({ data });
});
