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
} from "../controllers/index.js";
import { requireAuth, validate } from "../middleware/index.js";
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

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  ownerForgotPassword,
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  ownerResetPassword,
);
router.put(
  "/change-password",
  validate(changePasswordSchema),
  requireAuth,
  ownerChangePassword,
);

export default router;
