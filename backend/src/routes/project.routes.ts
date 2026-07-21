import { Router } from "express";
import { projectController } from "../controllers/project.controller";
import { requireAuth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdParamSchema,
} from "../validators/project.validator";
import schemaRoutes from "./schema.routes";

const router = Router();

router.use(requireAuth);

router.get("/", projectController.list);
router.post("/", validate({ body: createProjectSchema }), projectController.create);
router.get("/:id", validate({ params: projectIdParamSchema }), projectController.getById);
router.patch(
  "/:id",
  validate({ params: projectIdParamSchema, body: updateProjectSchema }),
  projectController.update
);
router.delete("/:id", validate({ params: projectIdParamSchema }), projectController.delete);

// Nested: /api/projects/:id/schema/*
router.use("/:id/schema", schemaRoutes);

export default router;
