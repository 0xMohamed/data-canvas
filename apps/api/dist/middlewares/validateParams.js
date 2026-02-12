"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = void 0;
const validateParams = (schema) => (req, _res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success)
        return next(result.error);
    req.params = result.data;
    next();
};
exports.validateParams = validateParams;
