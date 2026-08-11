import { Router } from "express";
// import { }
import { validate } from "@/middlewares/validate";
import { requireAuth } from "@/middlewares/auth";
import { profileUpdateSchema, updatePasswordSchema } from "@/validators/profile.validator";
import { profileController } from "@/controllers/profile.controller";


const router = Router();

router.post('/', requireAuth, validate({body: profileUpdateSchema}), profileController.profileUpdate);

router.post('/update-password', requireAuth, validate({body: updatePasswordSchema}), profileController.updatePassword);

export default router;