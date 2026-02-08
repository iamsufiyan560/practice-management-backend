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
import { createOwnerSchema, updateOwnerSchema } from "../validations/index.js";

const router = Router();

router.post("/generate-first-owner", generateFirstOwner);

router.post(
  "/create-owner",
  requireAuth,
  validate(createOwnerSchema),
  createOwner,
);

router.post("/login", ownerLogin);
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

router.post("/forgot-password", ownerForgotPassword);
router.post("/reset-password", ownerResetPassword);
router.put("/change-password", requireAuth, ownerChangePassword);

export default router;
