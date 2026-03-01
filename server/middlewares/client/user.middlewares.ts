import type { Response, Request, NextFunction } from "express";
import User from "../../models/users.model.js";
import { verifyJWT } from "../JWT.middlewares.js";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(401).json({ error: "Vui lòng gửi kèm theo token" });
    }

    const token: string | undefined = authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Người dùng chưa đăng nhập" });
    }

    // Verify JWT token
    const decoded = verifyJWT(token) as { userId: string; role: string };
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: "Token không hợp lệ" });
    }

    // Find user in database
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(403).json({ error: "Người dùng không tồn tại" });
    }

    req.user = user;
    req.tokenVerify = token;
    next();
  } catch (error: any) {
    if (error.message === "TokenExpiredError") {
      return res.status(401).json({ error: "Token đã hết hạn. Vui lòng đăng nhập lại." });
    }
    return res.status(401).json({ error: "Token không hợp lệ" });
  }
};
