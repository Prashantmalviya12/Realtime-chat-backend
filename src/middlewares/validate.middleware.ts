import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

export const validate =
  (schema: ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!result.success) {
      next(result.error);
      return;
    }

    // Use parsed values so defaults/coercions (e.g. query limit) are applied.
    req.body = result.data.body ?? req.body;
    req.params = result.data.params ?? req.params;
    Object.assign(req.query, result.data.query ?? {});
    next();
  };
