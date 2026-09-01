import { Request, Response } from "express";
import { projectService } from "../services/project.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ListProjectsQuery } from "../validators/project.validator";

export const projectController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListProjectsQuery;
    const projects = await projectService.list(req.user!.id, query);
    res.status(200).json({ projects });
  }),

  trash: asyncHandler(async (req: Request, res: Response) => {
    const projects = await projectService.trash(req.user!.id);
    res.status(200).json({ projects });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.getById(req.params.id!, req.user!.id);
    res.status(200).json({ project });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.create(req.user!.id, req.body);
    res.status(201).json({ project });
  }),

  // create project with starter template 
  createWithStarterTemplate: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.createWithStarterTemplate(req.user!.id, req.body);
    res.status(201).json({ project });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.update(req.params.id!, req.user!.id, req.body);
    res.status(200).json({ project });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await projectService.delete(req.params.id!, req.user!.id);
    res.status(204).send();
  }),

  restore: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.restore(req.params.id!, req.user!.id);
    res.status(200).json({ project });
  }),

  purge: asyncHandler(async (req: Request, res: Response) => {
    await projectService.purge(req.params.id!, req.user!.id);
    res.status(204).send();
  }),

  duplicate: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.duplicate(req.params.id!, req.user!.id);
    res.status(201).json({ project });
  }),

  toggleFavorite: asyncHandler(async (req: Request, res: Response) => {
    const result = await projectService.toggleFavorite(req.params.id!, req.user!.id);
    res.status(200).json(result);
  }),
};

