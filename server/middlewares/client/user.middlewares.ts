import type { Response, Request, NextFunction } from "express";
import User from "../../models/users.model.js";

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

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(403).json({ error: "Token không hợp lệ" });
    }

    req.user = user;
    req.tokenVerify = token;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Lỗi xác thực" });
  }
};
