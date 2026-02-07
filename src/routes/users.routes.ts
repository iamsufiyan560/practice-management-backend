import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from "../controllers/index.js";

const router = Router();

router.get("/:userId", getUserProfile);
router.put("/:userId", updateUserProfile);
router.delete("/:userId", deleteUserProfile);

export default router;
