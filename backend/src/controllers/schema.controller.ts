import { Request, Response } from "express";
import { schemaService } from "../services/schema.service";
import { asyncHandler } from "../utils/asyncHandler";

export const schemaController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    const schema = await schemaService.get(req.params.id, req.user!.id);
    res.status(200).json({ schema });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const schema = await schemaService.update(req.params.id, req.user!.id, req.body);
    res.status(200).json({ schema });
  }),

  listVersions: asyncHandler(async (req: Request, res: Response) => {
    const versions = await schemaService.listVersions(req.params.id, req.user!.id);
    res.status(200).json({ versions });
  }),

  structure: asyncHandler(async (req: Request, res: Response) => {
    const structure = await schemaService.structure(req.params.id, req.user!.id);
    res.status(200).json({ structure });
  }),

  exportDbml: asyncHandler(async (req: Request, res: Response) => {
    const dbml = await schemaService.exportDbml(req.params.id, req.user!.id);
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", 'attachment; filename="schema.dbml"');
    res.status(200).send(dbml);
  }),

  exportSql: asyncHandler(async (req: Request, res: Response) => {
    const sql = await schemaService.exportSql(req.params.id, req.user!.id);
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", 'attachment; filename="schema.sql"');
    res.status(200).send(sql);
  }),
};
