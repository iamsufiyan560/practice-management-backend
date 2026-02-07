import { Router } from "express";
import {
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAllAdminsByPractice,
  getAdminById,
} from "../controllers/index.js";

const router = Router();

router.post("/create", createAdmin);
router.put("/:adminId", updateAdmin);
router.delete("/:adminId", deleteAdmin);

router.get("/list", getAllAdminsByPractice);
router.get("/:adminId", getAdminById);

export default router;
