import { Router } from "express";
import {
  createPatient,
  createPatientByTherapist,
  getAllPatientsByPractice,
  getPatientById,
  updatePatient,
  deletePatient,
  getPatientsByTherapist,
} from "../controllers/index.js";
import { requireAuth, validate, practiceContext } from "../middleware/index.js";
import {
  createPatientSchema,
  updatePatientSchema,
} from "../validations/index.js";

const router = Router();

router.use(requireAuth, practiceContext);

router.post("/create", validate(createPatientSchema), createPatient);
router.post(
  "/create-by-therapist",
  validate(createPatientSchema),
  createPatientByTherapist,
);
router.put("/:patientId", validate(updatePatientSchema), updatePatient);
router.delete("/:patientId", deletePatient);

router.get("/list", getAllPatientsByPractice);
router.get("/therapist/:therapistId", getPatientsByTherapist);
router.get("/:patientId", getPatientById);

export default router;
