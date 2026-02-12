"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = void 0;
const validateQuery = (schema) => (req, _res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success)
        return next(result.error);
    req.query = result.data;
    next();
};
exports.validateQuery = validateQuery;
