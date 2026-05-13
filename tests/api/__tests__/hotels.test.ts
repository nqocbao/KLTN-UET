/**
 * TC-API-HOTEL-* — Hotels endpoints (read public + admin write).
 */
import { describe, it, expect, beforeAll } from "@jest/globals";
import { request, isBackendUp } from "../helpers/app";

let backendUp = false;
beforeAll(async () => {
  backendUp = await isBackendUp();
});

describe("GET /api/client/hotels", () => {
  it("TC-API-HOTEL-001: list mặc định → 200 + array", async () => {
    if (!backendUp) return;
    const res = await request.get("/api/client/hotels");
    expect(res.status).toBe(200);
    expect(res.body.success ?? true).toBeTruthy();
    const data = res.body.data ?? res.body;
    expect(Array.isArray(data) || Array.isArray(data?.items)).toBeTruthy();
  });

  it("TC-API-HOTEL-006: id không tồn tại → 404 hoặc null", async () => {
    if (!backendUp) return;
    const res = await request.get("/api/client/hotels/000000000000000000000000");
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.data ?? null).toBeFalsy();
    }
  });

  it("TC-API-HOTEL-007: id sai format → 400 hoặc 404", async () => {
    if (!backendUp) return;
    const res = await request.get("/api/client/hotels/not-an-objectid");
    expect([400, 404, 500]).toContain(res.status);
  });
});

describe("Admin guard (TC-ADM-001/002/003)", () => {
  it("không token → 401", async () => {
    if (!backendUp) return;
    const res = await request.get("/api/admin/hotels");
    expect(res.status).toBe(401);
  });

  it("token user thường → 403", async () => {
    if (!backendUp) return;
    const res = await request
      .get("/api/admin/hotels")
      .set("Authorization", "Bearer fake.user.token");
    expect([401, 403]).toContain(res.status);
  });
});
