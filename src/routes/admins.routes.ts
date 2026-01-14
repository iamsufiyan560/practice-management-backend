import { Router } from "express";
import {
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAllAdminsByPractice,
  getAdminById,
  getAllInactiveAdminsByPractice,
} from "../controllers/index.js";
import { practiceContext, requireAuth } from "../middleware/index.js";

const router = Router();

router.post("/create", practiceContext, requireAuth, createAdmin);
router.put("/:adminId", practiceContext, requireAuth, updateAdmin);
router.delete("/:adminId", practiceContext, requireAuth, deleteAdmin);

router.get("/list", practiceContext, requireAuth, getAllAdminsByPractice);
router.get("/:adminId", practiceContext, requireAuth, getAdminById);

router.get(
  "/inactive",
  practiceContext,
  requireAuth,
  getAllInactiveAdminsByPractice,
);

export default router;
