import { Router } from "express";
import {
  createSession,
  getSessionById,
  updateSession,
  deleteSession,
  getPatientSessionHistory,
  getLatestPatientSession,
  getDraftSessionsByTherapist,
  getUpcomingSessionsByTherapist,
  getPendingReviewSessions,
  sendSessionForReview,
  approveSession,
  rejectSession,
} from "../controllers/index.js";
import { requireAuth, validate, practiceContext } from "../middleware/index.js";
import {
  createSessionSchema,
  updateSessionSchema,
  reviewSessionSchema,
} from "../validations/index.js";

const router = Router();

router.use(requireAuth, practiceContext);

router.post("/create", validate(createSessionSchema), createSession);
router.get("/:sessionId", getSessionById);
router.put("/:sessionId", validate(updateSessionSchema), updateSession);
router.delete("/:sessionId", deleteSession);

router.get("/patient/:patientId/history", getPatientSessionHistory);
router.get("/patient/:patientId/latest", getLatestPatientSession);

router.get("/my-drafts", getDraftSessionsByTherapist);
router.get("/my-upcoming", getUpcomingSessionsByTherapist);
router.get("/pending-review", getPendingReviewSessions);

router.put("/send-for-review/:sessionId", sendSessionForReview);
router.put(
  "/approve/:sessionId",
  validate(reviewSessionSchema),
  approveSession,
);
router.put("/reject/:sessionId", validate(reviewSessionSchema), rejectSession);

export default router;
