import { Request, Response } from "express";

export const createSession = async (req: Request, res: Response) => {
  const practiceId = req.practiceId;
};

export const getSessionById = async (req: Request, res: Response) => {};

export const updateSession = async (req: Request, res: Response) => {};

export const deleteSession = async (req: Request, res: Response) => {};

export const getAllSessionsByPractice = async (req: Request, res: Response) => {
  const practiceId = req.practiceId;
};

export const getSessionsByTherapist = async (req: Request, res: Response) => {
  const practiceId = req.practiceId;
};

export const getSessionsByPatient = async (req: Request, res: Response) => {
  const practiceId = req.practiceId;
};

export const getPatientSessionHistory = async (req: Request, res: Response) => {
  const practiceId = req.practiceId;
};

export const getLatestPatientSession = async (req: Request, res: Response) => {
  const practiceId = req.practiceId;
};

export const getDraftSessionsByTherapist = async (
  req: Request,
  res: Response,
) => {
  const practiceId = req.practiceId;
};

export const getUpcomingSessionsByTherapist = async (
  req: Request,
  res: Response,
) => {
  const practiceId = req.practiceId;
};

export const getPendingReviewSessions = async (req: Request, res: Response) => {
  const practiceId = req.practiceId;
};

export const sendSessionForReview = async (req: Request, res: Response) => {
  const practiceId = req.practiceId;
};

export const approveSession = async (req: Request, res: Response) => {
  const practiceId = req.practiceId;
};

export const rejectSession = async (req: Request, res: Response) => {
  const practiceId = req.practiceId;
};
