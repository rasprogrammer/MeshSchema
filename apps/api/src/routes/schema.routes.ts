import { Router } from "express";
import { schemaController } from "../controllers/schema.controller";
import { validate } from "../middlewares/validate";
import { updateSchemaSchema } from "../validators/schema.validator";
import { projectIdParamSchema } from "../validators/project.validator";

// mergeParams so :id from the parent /projects/:id router is available here
const router = Router({ mergeParams: true });

router.get("/", validate({ params: projectIdParamSchema }), schemaController.get);
router.put(
  "/",
  validate({ params: projectIdParamSchema, body: updateSchemaSchema }),
  schemaController.update
);
router.get("/versions", validate({ params: projectIdParamSchema }), schemaController.listVersions);
router.get("/structure", validate({ params: projectIdParamSchema }), schemaController.structure);
router.get("/export/dbml", validate({ params: projectIdParamSchema }), schemaController.exportDbml);
router.get("/export/sql", validate({ params: projectIdParamSchema }), schemaController.exportSql);

export default router;
