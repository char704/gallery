import { Router } from "express";
import { searchController } from "../controllers/searchController";
import { validateRequest } from "../middlewares/validation.middleware";
import { paginationValidator } from "../validators/common.validator";
import { searchValidator } from "../validators/search.validator";

export const searchRouter = Router();

searchRouter.get("/suggestions", searchValidator, validateRequest, searchController.suggestions);
searchRouter.get("/tags", validateRequest, searchController.tags);
searchRouter.get("/", paginationValidator, searchValidator, validateRequest, searchController.search);
