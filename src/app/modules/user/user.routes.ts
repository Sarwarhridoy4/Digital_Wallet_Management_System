import { Router } from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { userRegisterSchema } from "./user.validation";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post(
  "/register",
  multerUpload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "identifier_image", maxCount: 1 },
  ]),
  validateRequest(userRegisterSchema),
  UserControllers.createUser
);

export const UserRoutes = router;
