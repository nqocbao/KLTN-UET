import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const SECRET_CODE = process.env.JWT_SECRET || process.env.SECRET_CODE;

if (!SECRET_CODE) {
  console.warn("⚠️  WARNING: SECRET_CODE is not set in .env. JWT authentication will not work properly!");
}

export const createJWT = (payload: any) => {
  let token = null;
  try {
    token = jwt.sign(payload, SECRET_CODE || "kltn-travel-secret-fallback", {
      expiresIn: "1d",
    });
  } catch (error) {
    console.log(error);
  }
  return token;
};

export const verifyJWT = (token: string) => {
  let data = null;
  try {
    let decoded = jwt.verify(token, SECRET_CODE || "kltn-travel-secret-fallback");
    data = decoded;
  } catch (error) {
    console.log(error);
    if (error instanceof Error && error.name === "TokenExpiredError") {
      throw new Error("TokenExpiredError");
    }
    throw new Error("InvalidTokenError");
  }
  return data;
};
