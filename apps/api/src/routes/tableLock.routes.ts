import { Router } from "express";
import { validate } from "@/middlewares/validate";
import { tableLockController } from "@/controllers/tableLock.controller";
import { tableNameParamSchema } from "@/validators/tableLock.validator";
import { projectIdParamSchema } from "@/validators/project.validator";

// mergeParams so :id from the parent /projects/:id router is available here
const router = Router({ mergeParams: true });

router.get("/", validate({ params: projectIdParamSchema }), tableLockController.list);
router.post("/:tableName", validate({ params: tableNameParamSchema }), tableLockController.acquire);
router.delete("/:tableName", validate({ params: tableNameParamSchema }), tableLockController.release);

export default router;
