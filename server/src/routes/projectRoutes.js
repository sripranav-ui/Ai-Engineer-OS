import { Router } from "express";
import { getProjects, createProject } from "../controllers/projectController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authenticate);
router.get("/", getProjects);
router.post("/", createProject);

export default router;
