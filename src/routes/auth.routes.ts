import { Router } from "express";
import {
  userLogin,
  userLogout,
  getLoggedInUser,
  userForgotPassword,
  userResetPassword,
  userChangePassword,
} from "../controllers/index.js";

const router = Router();

router.post("/login", userLogin);
router.post("/logout", userLogout);
router.get("/me", getLoggedInUser);

router.post("/forgot-password", userForgotPassword);
router.post("/reset-password", userResetPassword);
router.put("/change-password", userChangePassword);

export default router;
