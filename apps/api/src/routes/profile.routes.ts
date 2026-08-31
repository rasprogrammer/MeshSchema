import { Router } from "express";
// import { }
import { validate } from "@/middlewares/validate";
import { requireAuth } from "@/middlewares/auth";
import { avatarUpload } from "@/middlewares/upload";
import { profileUpdateSchema, updatePasswordSchema } from "@/validators/profile.validator";
import { profileController } from "@/controllers/profile.controller";


const router = Router();

router.post('/', requireAuth, validate({body: profileUpdateSchema}), profileController.profileUpdate);

// `avatarUpload` pulls in a nested @types/express@5 copy transitively, so its
// RequestHandler shape clashes with this app's express@4 types — wrap it in a
// plain function matching the express@4 signature to sidestep the conflict.
router.post(
  '/avatar',
  requireAuth,
  (req, res, next) => (avatarUpload.single('avatar') as any)(req, res, next),
  profileController.updateAvatar
);

router.post('/update-password', requireAuth, validate({body: updatePasswordSchema}), profileController.updatePassword);

export default router;