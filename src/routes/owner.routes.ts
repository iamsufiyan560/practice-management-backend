import { Router } from "express";
import {
  ownerLogin,
  ownerLogout,
  getOwnerMe,
  getOwnerProfile,
  updateOwnerProfile,
  deleteOwnerProfile,
  getOwnerDashboard,
  ownerForgotPassword,
  ownerResetPassword,
  ownerChangePassword,
  generateFirstOwner,
  createOwner,
  getAllOwners,
} from "../controllers/index.js";
import {
  authLimiter,
  requireAuth,
  userLimiter,
  validate,
} from "../middleware/index.js";
import {
  changePasswordSchema,
  createOwnerSchema,
  forgotPasswordSchema,
  generateFirstOwnerSchema,
  loginSchema,
  resetPasswordSchema,
  updateOwnerSchema,
} from "../validations/index.js";

const router = Router();

router.post(
  "/generate-first-owner",
  validate(generateFirstOwnerSchema),
  generateFirstOwner,
);

router.post(
  "/create-owner",
  requireAuth,
  validate(createOwnerSchema),
  createOwner,
);

router.post("/login", validate(loginSchema), ownerLogin);
router.post("/logout", requireAuth, ownerLogout);
router.get("/me", requireAuth, getOwnerMe);

router.get("/profile/:ownerId", requireAuth, getOwnerProfile);
router.put(
  "/profile/:ownerId",
  requireAuth,
  validate(updateOwnerSchema),
  updateOwnerProfile,
);
router.delete("/profile/:ownerId", requireAuth, deleteOwnerProfile);

router.get("/dashboard", requireAuth, getOwnerDashboard);

router.get("/list", requireAuth, getAllOwners);

router.post(
  "/forgot-password",
  authLimiter(60 * 60 * 1000, 5),
  validate(forgotPasswordSchema),
  ownerForgotPassword,
);

router.post(
  "/reset-password",
  authLimiter(60 * 60 * 1000, 5),
  validate(resetPasswordSchema),
  ownerResetPassword,
);

router.put(
  "/change-password",
  requireAuth,
  userLimiter(60 * 60 * 1000, 5),
  validate(changePasswordSchema),
  ownerChangePassword,
);

export default router;
