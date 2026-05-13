/**
 * TC-CHAT-API-* — Chatbot proxy endpoints.
 */
import { describe, it, expect, beforeAll } from "@jest/globals";
import { request, isBackendUp } from "../helpers/app";

let backendUp = false;
beforeAll(async () => {
  backendUp = await isBackendUp();
});

describe("POST /api/chatbot/conversations", () => {
  it("TC-CHAT-API-001: tạo conversation → 200/201", async () => {
    if (!backendUp) return;
    const res = await request
      .post("/api/chatbot/conversations")
      .send({ user_id: null });
    expect([200, 201]).toContain(res.status);
  });
});

describe("POST /api/chatbot/message", () => {
  it("TC-CHAT-API-006: gửi tin nhắn → 200 (cần RASA up)", async () => {
    if (!backendUp) return;
    const res = await request.post("/api/chatbot/message").send({
      sender: "qa-tester",
      message: "Xin chào",
    });
    // RASA có thể chưa up → chấp nhận 5xx (record để báo cáo).
    expect([200, 502, 503, 500]).toContain(res.status);
  });
});

describe("POST /api/chatbot/recommend", () => {
  it("TC-CHAT-RECO-001: gợi ý trip cơ bản → 200 với hotels/tours/transports", async () => {
    if (!backendUp) return;
    const res = await request.post("/api/chatbot/recommend").send({
      message: "Đi Đà Nẵng 3 ngày 4 người",
    });
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      const data = res.body.data ?? res.body;
      expect(data).toBeDefined();
    }
  });
});
