import fs from "fs";
import path from "path";
import multer from "multer";
import { BadRequestError } from "@/utils/AppError";

export const UPLOADS_DIR = path.join(process.cwd(), "uploads", "avatars");

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.user?.id}-${Date.now()}${ext}`);
  },
});

export const avatarUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new BadRequestError("Only JPEG, PNG, WEBP or GIF images are allowed"));
      return;
    }
    cb(null, true);
  },
});
