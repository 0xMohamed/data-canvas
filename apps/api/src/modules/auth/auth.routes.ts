import { Router } from "express";
import { login, refresh, register, logout, me } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schema";
import { validate } from "../../middlewares/validate";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;
