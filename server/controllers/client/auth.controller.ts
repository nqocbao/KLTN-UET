import type { Request, Response } from "express";
import User from "../../models/users.model.js";
import bcrypt from "bcrypt";
import { createJWT } from "../../middlewares/JWT.middlewares.js";

/**
 * Register new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, mật khẩu và họ tên là bắt buộc"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      phone,
      role: "user", // Default role
      created_at: new Date(),
      updated_at: new Date()
    });

    // Generate JWT token
    const token = createJWT({
      userId: user._id,
      role: user.role || "user",
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      data: userResponse,
      token,
    });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi khi đăng ký"
    });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email và mật khẩu là bắt buộc"
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng"
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng"
      });
    }

    // Generate JWT token with user info
    const token = createJWT({
      userId: user._id,
      role: user.role || "user",
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      data: userResponse,
      token,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi khi đăng nhập"
    });
  }
};

/**
 * Get current user info (requires JWT auth)
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // req.user is set by requireAuth middleware via JWT verification
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
