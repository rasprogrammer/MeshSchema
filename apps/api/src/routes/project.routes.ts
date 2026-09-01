import { Router } from "express";
import { projectController } from "../controllers/project.controller";
import { requireAuth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdParamSchema,
  createWithStarterTemplateSchema,
  listProjectsQuerySchema,
} from "../validators/project.validator";
import schemaRoutes from "./schema.routes";
import inviteRoutes from "./projectInvite.routes";
import memberRoutes from "./projectMember.routes";
import { projectInviteController } from "@/controllers/projectInvite.controller";
import { starterTemplateController } from "@/controllers/starterTemplate.controller";

const router = Router();

router.use(requireAuth);

router.get("/", validate({ query: listProjectsQuerySchema }), projectController.list);
router.post("/", validate({ body: createProjectSchema }), projectController.create);

router.get("/starter-template", starterTemplateController.list);
router.get("/trash", projectController.trash);

// Token is opaque and global, not scoped under /:id — must be registered before the "/:id" routes below.
router.post("/invites/accept/:token", projectInviteController.accept);

router.get("/:id", validate({ params: projectIdParamSchema }), projectController.getById);
router.patch(
  "/:id",
  validate({ params: projectIdParamSchema, body: updateProjectSchema }),
  projectController.update
);
router.post("/starter-template", validate({ body: createWithStarterTemplateSchema}), projectController.createWithStarterTemplate);

router.delete("/:id", validate({ params: projectIdParamSchema }), projectController.delete);
router.post("/:id/restore", validate({ params: projectIdParamSchema }), projectController.restore);
router.delete("/:id/purge", validate({ params: projectIdParamSchema }), projectController.purge);
router.post("/:id/duplicate", validate({ params: projectIdParamSchema }), projectController.duplicate);
router.post("/:id/favorite", validate({ params: projectIdParamSchema }), projectController.toggleFavorite);

// Nested: /api/projects/:id/schema/* (includes /:id/schema/locks/*)
router.use("/:id/schema", schemaRoutes);
router.use("/:id/invites", inviteRoutes);
router.use("/:id/members", memberRoutes);

export default router;
