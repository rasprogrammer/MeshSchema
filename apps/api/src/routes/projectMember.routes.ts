import { Router } from "express";
import { z } from "zod";
import { validate } from "@/middlewares/validate";
import { projectMemberController } from "@/controllers/projectMember.controller";
import { projectIdParamSchema } from "@/validators/project.validator";

const memberParamSchema = projectIdParamSchema.extend({ userId: z.string().uuid("Invalid user id") });
const updateRoleBodySchema = z.object({ role: z.enum(["EDITOR", "VIEWER"]) });

// mergeParams so :id from the parent /projects/:id router is available here
const router = Router({ mergeParams: true });

router.get("/", validate({ params: projectIdParamSchema }), projectMemberController.list);
router.patch("/:userId", validate({ params: memberParamSchema, body: updateRoleBodySchema }), projectMemberController.updateRole);
router.delete("/:userId", validate({ params: memberParamSchema }), projectMemberController.remove);

export default router;
