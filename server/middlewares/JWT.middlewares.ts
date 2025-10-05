import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const SECRET_CODE = process.env.SECRET_CODE;

export const createJWT = (payload: any) => {
  let token = null;
  try {
    token = jwt.sign(payload, SECRET_CODE || "", {
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
    let decoded = jwt.verify(token, SECRET_CODE || "");
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
