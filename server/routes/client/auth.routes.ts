import express from "express";
import { register, login, getCurrentUser } from "../../controllers/client/auth.controller.js";
import { requireAuth } from "../../middlewares/client/user.middlewares.js";

const router = express.Router();

/**
 * @route   POST /api/client/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post("/register", register);

/**
 * @route   POST /api/client/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", login);

/**
 * @route   GET /api/client/auth/me
 * @desc    Get current user info
 * @access  Private (requires JWT)
 */
router.get("/me", requireAuth, getCurrentUser);

export default router;
