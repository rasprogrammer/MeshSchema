import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

interface ValidationSchemas {
  body?: AnyZodObject;
  params?: AnyZodObject;
  query?: AnyZodObject;
}

/**
 * Validates and (re)assigns req.body/params/query from parsed Zod schemas.
 * Throws ZodError on failure, caught by the global error handler.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.params) req.params = schemas.params.parse(req.params) as any;
    if (schemas.query) req.query = schemas.query.parse(req.query) as any;
    next();
  };
}
