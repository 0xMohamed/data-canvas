"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.list = exports.create = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const canvas_service_1 = require("./canvas.service");
const AppError_1 = require("../../utils/AppError");
exports.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    const ownerId = req.user.id;
    const canvas = await (0, canvas_service_1.createCanvas)(ownerId, body);
    return res.status(201).json({
        message: "Canvas created",
        data: canvas,
    });
});
exports.list = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const ownerId = req.user.id;
    const query = req.query;
    const data = await (0, canvas_service_1.listCanvases)(ownerId, query);
    return res.status(200).json({ data });
});
exports.update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const ownerId = req.user.id;
    const { id } = req.params;
    const body = req.body;
    const canvas = await (0, canvas_service_1.updateCanvas)(ownerId, id, body);
    return res.status(200).json({
        message: "Canvas updated",
        data: canvas,
    });
});
exports.remove = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        throw new AppError_1.AppError({
            status: 400,
            code: "VALIDATION_ERROR",
            message: "Missing document id",
        });
    }
    await (0, canvas_service_1.deleteCanvas)(id, req.user.id);
    return res.status(204).send();
});
