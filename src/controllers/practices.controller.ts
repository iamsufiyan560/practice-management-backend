import { Request, Response } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { practices } from "../db/schema/practices.schema.js";
import { logger } from "../config/index.js";
import { response } from "../utils/index.js";

export const createPractice = async (req: Request, res: Response) => {
  try {
    const {
      name,
      legalName,
      taxId,
      npiNumber,
      phone,
      email,
      website,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
    } = req.body;
    const createdBy = req.user?.userId!;

    const inserted = await db
      .insert(practices)
      .values({
        name,
        legalName,
        taxId,
        npiNumber,
        phone,
        email,
        website,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        createdBy,
        updatedBy: createdBy,
      })
      .$returningId();

    if (!inserted.length) {
      logger.error("Practice insert failed");
      return response.error(res, "Failed to create practice");
    }

    const practiceId = inserted[0]!.id;

    logger.info(`Practice created ${name} with id ${practiceId}`);

    return response.created(
      res,
      {
        id: practiceId,
        name,
        legalName,
        taxId,
        npiNumber,
        phone,
        email,
        website,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        createdBy,
        updatedBy: createdBy,
      },
      "Practice created successfully",
    );
  } catch (err) {
    logger.error("Create practice error", { error: err });
    return response.error(res, "Failed to create practice");
  }
};

export const getAllPractices = async (req: Request, res: Response) => {
  try {
    const practiceList = await db
      .select({
        id: practices.id,
        name: practices.name,
        legalName: practices.legalName,
        taxId: practices.taxId,
        npiNumber: practices.npiNumber,
        phone: practices.phone,
        email: practices.email,
        website: practices.website,
        addressLine1: practices.addressLine1,
        addressLine2: practices.addressLine2,
        city: practices.city,
        state: practices.state,
        postalCode: practices.postalCode,
        country: practices.country,
        createdAt: practices.createdAt,
      })
      .from(practices)
      .where(eq(practices.isDeleted, false));

    logger.info(`Retrieved ${practiceList.length} practices`);

    return response.ok(res, practiceList);
  } catch (err) {
    logger.error("Get all practices error", { error: err });
    return response.error(res, "Failed to fetch practices");
  }
};

export const getPracticeById = async (req: Request, res: Response) => {
  try {
    const practiceIdParam = req.params.practiceId;

    const practiceId = Array.isArray(practiceIdParam)
      ? practiceIdParam[0]
      : practiceIdParam;

    if (!practiceId) {
      logger.warn("Get practice called without id");
      return response.badRequest(res, "Practice ID is required");
    }

    const [practice] = await db
      .select({
        id: practices.id,
        name: practices.name,
        legalName: practices.legalName,
        taxId: practices.taxId,
        npiNumber: practices.npiNumber,
        phone: practices.phone,
        email: practices.email,
        website: practices.website,
        addressLine1: practices.addressLine1,
        addressLine2: practices.addressLine2,
        city: practices.city,
        state: practices.state,
        postalCode: practices.postalCode,
        country: practices.country,
        createdAt: practices.createdAt,
      })
      .from(practices)
      .where(and(eq(practices.id, practiceId), eq(practices.isDeleted, false)))
      .limit(1);

    if (!practice) {
      logger.warn(`Practice not found ${practiceId}`);
      return response.notFound(res, "Practice not found");
    }

    logger.info(`Retrieved practice ${practiceId}`);

    return response.ok(res, practice);
  } catch (err) {
    logger.error("Get practice by id error", { error: err });
    return response.error(res, "Failed to fetch practice");
  }
};

export const updatePractice = async (req: Request, res: Response) => {
  try {
    const practiceIdParam = req.params.practiceId;
    const {
      name,
      legalName,
      taxId,
      npiNumber,
      phone,
      email,
      website,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
    } = req.body;
    const updatedBy = req.user?.userId!;

    const practiceId = Array.isArray(practiceIdParam)
      ? practiceIdParam[0]
      : practiceIdParam;

    if (!practiceId) {
      logger.warn("Update practice called without id");
      return response.badRequest(res, "Practice ID is required");
    }

    const [existingPractice] = await db
      .select()
      .from(practices)
      .where(and(eq(practices.id, practiceId), eq(practices.isDeleted, false)))
      .limit(1);

    if (!existingPractice) {
      logger.warn(`Practice not found ${practiceId}`);
      return response.notFound(res, "Practice not found");
    }

    await db
      .update(practices)
      .set({
        name: name ?? existingPractice.name,
        legalName: legalName ?? existingPractice.legalName,
        taxId: taxId ?? existingPractice.taxId,
        npiNumber: npiNumber ?? existingPractice.npiNumber,
        phone: phone ?? existingPractice.phone,
        email: email ?? existingPractice.email,
        website: website ?? existingPractice.website,
        addressLine1: addressLine1 ?? existingPractice.addressLine1,
        addressLine2: addressLine2 ?? existingPractice.addressLine2,
        city: city ?? existingPractice.city,
        state: state ?? existingPractice.state,
        postalCode: postalCode ?? existingPractice.postalCode,
        country: country ?? existingPractice.country,
        updatedBy,
      })
      .where(eq(practices.id, practiceId));

    logger.info(`Practice updated ${practiceId}`);

    return response.ok(res, null, "Practice updated successfully");
  } catch (err) {
    logger.error("Update practice error", { error: err });
    return response.error(res, "Failed to update practice");
  }
};

export const deletePractice = async (req: Request, res: Response) => {
  try {
    const practiceIdParam = req.params.practiceId;
    const updatedBy = req.user?.userId!;

    const practiceId = Array.isArray(practiceIdParam)
      ? practiceIdParam[0]
      : practiceIdParam;

    if (!practiceId) {
      logger.warn("Delete practice called without id");
      return response.badRequest(res, "Practice ID is required");
    }

    const [existingPractice] = await db
      .select()
      .from(practices)
      .where(and(eq(practices.id, practiceId), eq(practices.isDeleted, false)))
      .limit(1);

    if (!existingPractice) {
      logger.warn(`Practice not found ${practiceId}`);
      return response.notFound(res, "Practice not found");
    }

    await db
      .update(practices)
      .set({
        isDeleted: true,
        updatedBy,
      })
      .where(eq(practices.id, practiceId));

    logger.info(`Practice deleted ${practiceId}`);

    return response.ok(res, null, "Practice deleted successfully");
  } catch (err) {
    logger.error("Delete practice error", { error: err });
    return response.error(res, "Failed to delete practice");
  }
};
