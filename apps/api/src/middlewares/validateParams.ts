import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

export const validateParams =
    (schema: ZodSchema) =>
    (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.params);

        if (!result.success) return next(result.error);

        req.params = result.data as any;
        next();
};
