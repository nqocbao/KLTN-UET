import type { Response, Request, NextFunction } from "express";
import User from "../../models/users.model.js";
import { verifyJWT } from "../JWT.middlewares.js";

/**
 * Admin authentication middleware
 * Verifies JWT token AND checks that user has "admin" role
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(401).json({
        success: false,
        error: "Yêu cầu đăng nhập để truy cập",
      });
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Token không hợp lệ",
      });
    }

    // Verify JWT
    const decoded = verifyJWT(token) as { userId: string; role: string };
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        error: "Token không hợp lệ",
      });
    }

    // Check admin role from JWT payload first (fast check)
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Bạn không có quyền truy cập trang quản trị",
      });
    }

    // Verify user still exists and is still admin in DB
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(403).json({
        success: false,
        error: "Tài khoản không tồn tại",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Bạn không có quyền truy cập trang quản trị",
      });
    }

    req.user = user;
    req.tokenVerify = token;
    next();
  } catch (error: any) {
    if (error.message === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      });
    }
    return res.status(401).json({
      success: false,
      error: "Xác thực thất bại",
    });
  }
};
