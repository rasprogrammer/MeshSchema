import { Router } from "express";
// import { }
import { validate } from "@/middlewares/validate";
import { requireAuth } from "@/middlewares/auth";
import { profileUpdateSchema } from "@/validators/profile.validator";
import { profileController } from "@/controllers/profile.controller";


const router = Router();

router.post('/', requireAuth, validate({body: profileUpdateSchema}), profileController.profileUpdate)

export default router;