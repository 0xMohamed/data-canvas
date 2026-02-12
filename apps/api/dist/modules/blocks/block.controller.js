"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpdate = exports.remove = exports.update = exports.create = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const block_service_1 = require("./block.service");
exports.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const ownerId = req.user.id;
    const canvasId = req.params.id;
    const body = req.body;
    const block = await (0, block_service_1.createBlock)(ownerId, canvasId, body);
    return res.status(201).json({
        message: "Block created",
        data: block,
    });
});
exports.update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const ownerId = req.user.id;
    const { blockId } = req.params;
    const body = req.body;
    const block = await (0, block_service_1.updateBlock)(ownerId, blockId, body);
    return res.status(200).json({
        message: "Block updated",
        data: block,
    });
});
exports.remove = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const ownerId = req.user.id;
    const { blockId } = req.params;
    await (0, block_service_1.deleteBlock)(ownerId, blockId);
    return res.status(204).send();
});
exports.bulkUpdate = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const ownerId = req.user.id;
    const canvasId = req.params.id;
    const body = req.body;
    const blocks = await (0, block_service_1.bulkUpdateBlocks)(ownerId, canvasId, body);
    return res.status(200).json({
        message: "Blocks updated",
        data: { blocks },
    });
});
