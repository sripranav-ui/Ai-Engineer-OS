import { Router } from "express";
import { chatCompletions } from "../controllers/aiController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authenticate);
router.post("/chat", chatCompletions);

export default router;
