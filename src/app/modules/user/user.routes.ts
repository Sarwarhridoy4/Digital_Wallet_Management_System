import { Router } from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { userRegisterSchema } from "./user.validation";
import { multerUpload } from "../../config/multer.config";
import { Role } from "../../types";
import { checkAuth } from "../../middlewares/authCheck";

const router = Router();

/**
 * @openapi
 * tags:
 *   name: User
 *   description: User and agent management endpoints
 */

/**
 * @openapi
 * /user/register:
 *   post:
 *     summary: Register a new user (with profile and identifier images)
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, email, phone, password, role]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [user, agent] }
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *               identifier_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201: { description: User created successfully }
 *       400: { description: Validation or upload error }
 */
router.post(
  "/register",
  multerUpload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "identifier_image", maxCount: 1 },
  ]),
  validateRequest(userRegisterSchema),
  UserControllers.createUser
);

/**
 * @openapi
 * /user/:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of all users }
 *       401: { description: Unauthorized }
 */
router.get("/", checkAuth(Role.ADMIN), UserControllers.getAllUsers);

/**
 * @openapi
 * /user/me:
 *   get:
 *     summary: View own profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Own profile retrieved successfully }
 *       401: { description: Unauthorized }
 */
router.get(
  "/me",
  checkAuth(...Object.values(Role)),
  UserControllers.getMyProfile
);

/**
 * @openapi
 * /user/me:
 *   patch:
 *     summary: Update own profile (name, phone, password, profile picture)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               password: { type: string }
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200: { description: Profile updated successfully }
 *       404: { description: User not found }
 */
router.patch(
  "/me",
  checkAuth(...Object.values(Role)),
  multerUpload.single("profile_picture"),
  UserControllers.updateProfile
);

/**
 * @openapi
 * /user/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: User ID to delete
 *     responses:
 *       200: { description: User deleted successfully }
 *       401: { description: Unauthorized }
 */
router.delete("/:id", checkAuth(Role.ADMIN), UserControllers.deleteUser);

// Block/Unblock wallet
router.patch(
  "/:id/block",
  checkAuth(Role.ADMIN),
  UserControllers.blockUserWallet
);
router.patch(
  "/:id/unblock",
  checkAuth(Role.ADMIN),
  UserControllers.unblockUserWallet
);

// Approve/Suspend agent accounts
router.patch(
  "/:id/approve",
  checkAuth(Role.ADMIN),
  UserControllers.approveAgent
);
router.patch(
  "/:id/suspend",
  checkAuth(Role.ADMIN),
  UserControllers.suspendAgent
);

export const UserRoutes = router;
