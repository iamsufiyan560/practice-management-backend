import { Router } from "express";
import {
  userLogin,
  userLogout,
  getLoggedInUser,
  userForgotPassword,
  userResetPassword,
  userChangePassword,
} from "../controllers/index.js";
import {
  authLimiter,
  requireAuth,
  userLimiter,
  validate,
} from "../middleware/index.js";

import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from "../validations/index.js";

const router = Router();

router.post("/login", validate(loginSchema), userLogin);
router.post("/logout", requireAuth, userLogout);
router.get("/me", requireAuth, getLoggedInUser);

router.post(
  "/forgot-password",
  authLimiter(60 * 60 * 1000, 5),
  validate(forgotPasswordSchema),
  userForgotPassword,
);

router.post(
  "/reset-password",
  authLimiter(60 * 60 * 1000, 5),
  validate(resetPasswordSchema),
  userResetPassword,
);

router.put(
  "/change-password",
  requireAuth,
  userLimiter(60 * 60 * 1000, 5),
  validate(changePasswordSchema),
  userChangePassword,
);

export default router;
