import { Router } from "express";
import {
  createPatient,
  getAllPatientsByPractice,
  getPatientById,
  updatePatient,
  deletePatient,
  getPatientsByTherapist,
} from "@/controllers";

const router = Router();

router.post("/create", createPatient);
router.get("/list", getAllPatientsByPractice);
router.get("/:patientId", getPatientById);
router.put("/:patientId", updatePatient);
router.delete("/:patientId", deletePatient);

router.get("/therapist/:therapistId", getPatientsByTherapist);

export default router;
