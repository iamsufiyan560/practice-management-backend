import { Router } from "express";
import {
  userLogin,
  userLogout,
  getLoggedInUser,
  userForgotPassword,
  userResetPassword,
  userChangePassword,
} from "../controllers/index.js";
import { requireAuth, validate } from "../middleware/index.js";

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
  validate(forgotPasswordSchema),
  userForgotPassword,
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  userResetPassword,
);
router.put(
  "/change-password",
  validate(changePasswordSchema),

  requireAuth,
  userChangePassword,
);

export default router;
