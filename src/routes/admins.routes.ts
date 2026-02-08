import { Router } from "express";
import {
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAllAdminsByPractice,
  getAdminById,
  getAllInactiveAdminsByPractice,
} from "../controllers/index.js";
import { practiceContext, requireAuth, validate } from "../middleware/index.js";
import { createAdminSchema, updateAdminSchema } from "../validations/index.js";

const router = Router();

router.post(
  "/create",
  practiceContext,
  requireAuth,
  validate(createAdminSchema),
  createAdmin,
);
router.put(
  "/:adminId",
  practiceContext,
  requireAuth,
  validate(updateAdminSchema),
  updateAdmin,
);
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
