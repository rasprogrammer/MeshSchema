import { Router } from "express";
import { validate } from "@/middlewares/validate";
import { projectInviteController } from "@/controllers/projectInvite.controller";
import { createInviteSchema, inviteIdParamSchema } from "@/validators/projectInvite.validator";
import { projectIdParamSchema } from "@/validators/project.validator";

// mergeParams so :id from the parent /projects/:id router is available here
const router = Router({ mergeParams: true });

router.post("/", validate({ params: projectIdParamSchema, body: createInviteSchema }), projectInviteController.create);
router.get("/", validate({ params: projectIdParamSchema }), projectInviteController.list);
router.delete("/:inviteId", validate({ params: inviteIdParamSchema }), projectInviteController.revoke);

export default router;
