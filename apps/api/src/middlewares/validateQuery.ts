import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

export const validateQuery =
    (schema: ZodSchema) =>
    (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.query);

        if (!result.success) return next(result.error);

        req.query = result.data as any;
        next();
};
