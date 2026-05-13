/**
 * Test helper: trỏ Supertest tới backend đang chạy.
 *
 * Cách 1 (recommended cho integration test): chạy server thật ở localhost:5000
 * rồi `supertest(BASE_URL)`.
 *
 * Cách 2 (in-process): import express app từ server/index.ts. Hiện
 * `server/index.ts` đã `app.listen(...)` nên muốn dùng cách 2 thì cần
 * refactor tách `app` ra module riêng. Không bắt buộc cho phạm vi KLTN.
 */
import axios from "axios";
import supertest from "supertest";

export const BASE_URL = process.env.TEST_API_URL || "http://localhost:5000";

export const request = supertest(BASE_URL);

export async function isBackendUp(): Promise<boolean> {
  try {
    const res = await axios.get(`${BASE_URL}/`, { timeout: 3000 });
    return res.status === 200;
  } catch {
    return false;
  }
}

export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || `qa_${Date.now()}@vivu.test`,
  password: process.env.TEST_USER_PASSWORD || "QaPass@1234",
  name: "QA Test User",
};

export const TEST_ADMIN = {
  email: process.env.TEST_ADMIN_EMAIL || "admin@vivu.test",
  password: process.env.TEST_ADMIN_PASSWORD || "AdminPass@1234",
};
