import { Router } from "express";
import {
  userLogin,
  userLogout,
  getLoggedInUser,
  userForgotPassword,
  userResetPassword,
  userChangePassword,
} from "../controllers/index.js";
import { requireAuth } from "../middleware/index.js";

const router = Router();

router.post("/login", userLogin);
router.post("/logout", requireAuth, userLogout);
router.get("/me", requireAuth, getLoggedInUser);

router.post("/forgot-password", userForgotPassword);
router.post("/reset-password", userResetPassword);
router.put("/change-password", requireAuth, userChangePassword);

export default router;
