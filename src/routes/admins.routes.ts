import { Router } from "express";
import {
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAllAdminsByPractice,
  getAdminById,
} from "../controllers/index.js";
import { practiceContext, requireAuth } from "../middleware/index.js";

const router = Router();

router.post("/create", practiceContext, requireAuth, createAdmin);
router.put("/:adminId", practiceContext, requireAuth, updateAdmin);
router.delete("/:adminId", practiceContext, requireAuth, deleteAdmin);

router.get("/list", practiceContext, requireAuth, getAllAdminsByPractice);
router.get("/:adminId", practiceContext, requireAuth, getAdminById);

// TODO: Add route for inactive admins
// router.get("/admins/inactive", practiceContext, requireAuth, getAllInactiveAdminsByPractice);

export default router;
