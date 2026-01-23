import { Router } from "express";
import {
  createSession,
  getSessionById,
  updateSession,
  deleteSession,
  getAllSessionsByPractice,
  getSessionsByTherapist,
  getSessionsByPatient,
  getPatientSessionHistory,
  getLatestPatientSession,
  getDraftSessionsByTherapist,
  getUpcomingSessionsByTherapist,
  getPendingReviewSessions,
  sendSessionForReview,
  approveSession,
  rejectSession,
} from "@/controllers";

const router = Router();

router.post("/create", createSession);
router.get("/:sessionId", getSessionById);
router.put("/:sessionId", updateSession);
router.delete("/:sessionId", deleteSession);

router.get("/list", getAllSessionsByPractice);
router.get("/therapist/:therapistId", getSessionsByTherapist);
router.get("/patient/:patientId", getSessionsByPatient);

router.get("/patient/:patientId/history", getPatientSessionHistory);
router.get("/patient/:patientId/latest", getLatestPatientSession);

router.get("/draft/:therapistId", getDraftSessionsByTherapist);
router.get("/upcoming/:therapistId", getUpcomingSessionsByTherapist);
router.get("/pending-review/:supervisorId", getPendingReviewSessions);

router.put("/send-for-review/:sessionId", sendSessionForReview);
router.put("/approve/:sessionId", approveSession);
router.put("/reject/:sessionId", rejectSession);

export default router;
