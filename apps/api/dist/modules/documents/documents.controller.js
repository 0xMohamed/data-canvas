"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSnapshot = exports.getById = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const documents_service_1 = require("./documents.service");
exports.getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const data = await (0, documents_service_1.getDocument)(userId, id);
    return res.status(200).json(data);
});
exports.updateSnapshot = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const body = req.body;
    const data = await (0, documents_service_1.updateDocumentSnapshot)(userId, id, body);
    return res.status(200).json(data);
});
