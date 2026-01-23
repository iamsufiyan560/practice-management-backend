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
} from "@/controllers";

const router = Router();

router.post("/login", ownerLogin);
router.post("/logout", ownerLogout);
router.get("/me", getOwnerMe);

router.get("/profile/:ownerId", getOwnerProfile);
router.put("/profile/:ownerId", updateOwnerProfile);
router.delete("/profile/:ownerId", deleteOwnerProfile);

router.get("/dashboard", getOwnerDashboard);

router.post("/forgot-password", ownerForgotPassword);
router.post("/reset-password", ownerResetPassword);
router.put("/change-password", ownerChangePassword);

export default router;
