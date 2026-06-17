import { Router } from "express";
import { searchController } from "../controllers/searchController";
import { validateRequest } from "../middlewares/validation.middleware";
import { paginationValidator } from "../validators/common.validator";

export const searchRouter = Router();

searchRouter.get("/", paginationValidator, validateRequest, searchController.search);
