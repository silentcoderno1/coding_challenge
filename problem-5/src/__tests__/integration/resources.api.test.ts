import request from "supertest";
import { createApp } from "../../app";
import { FakeResourceRepository, resetFakeResourceStore } from "../helpers/fake-resource.repository";

describe("Resources API (integration)", () => {
  const fakeRepo = new FakeResourceRepository();
  const app = createApp({ repository: fakeRepo, cache: null });

  beforeEach(() => {
    resetFakeResourceStore();
  });

  describe("POST /api/v1/resources", () => {
    it("creates resource and returns 201 with success payload", async () => {
      const res = await request(app)
        .post("/api/v1/resources")
        .send({ name: "My Resource", description: "Optional desc" })
        .expect(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        name: "My Resource",
        description: "Optional desc",
        status: "active",
      });
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.createdAt).toBeDefined();
    });

    it("returns 400 when name is invalid (validation)", async () => {
      const res = await request(app)
        .post("/api/v1/resources")
        .send({ name: "ab" })
        .expect(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Validation failed|name/);
    });
  });

  describe("GET /api/v1/resources", () => {
    it("returns empty list then list with created resource", async () => {
      const listRes = await request(app).get("/api/v1/resources").expect(200);
      expect(listRes.body.data).toEqual([]);
      expect(listRes.body.meta).toEqual(expect.objectContaining({ total: 0, page: 1, limit: 20 }));

      await request(app).post("/api/v1/resources").send({ name: "First" }).expect(201);

      const listRes2 = await request(app).get("/api/v1/resources").expect(200);
      expect(listRes2.body.data).toHaveLength(1);
      expect(listRes2.body.data[0].name).toBe("First");
      expect(listRes2.body.meta.total).toBe(1);
    });
  });

  describe("GET /api/v1/resources/:id", () => {
    it("returns 404 for non-existent id", async () => {
      const res = await request(app).get("/api/v1/resources/non-existent-id").expect(404);
      expect(res.body.success).toBe(false);
    });

    it("returns resource when found", async () => {
      const createRes = await request(app)
        .post("/api/v1/resources")
        .send({ name: "Get Me" })
        .expect(201);
      const id = createRes.body.data.id;

      const getRes = await request(app).get(`/api/v1/resources/${id}`).expect(200);
      expect(getRes.body.success).toBe(true);
      expect(getRes.body.data.id).toBe(id);
      expect(getRes.body.data.name).toBe("Get Me");
    });
  });

  describe("PUT /api/v1/resources/:id", () => {
    it("updates resource", async () => {
      const createRes = await request(app)
        .post("/api/v1/resources")
        .send({ name: "Original" })
        .expect(201);
      const id = createRes.body.data.id;

      const updateRes = await request(app)
        .put(`/api/v1/resources/${id}`)
        .send({ name: "Updated Name", status: "inactive" })
        .expect(200);
      expect(updateRes.body.data.name).toBe("Updated Name");
      expect(updateRes.body.data.status).toBe("inactive");
    });

    it("returns 404 for non-existent id", async () => {
      await request(app)
        .put("/api/v1/resources/non-existent")
        .send({ name: "Any" })
        .expect(404);
    });
  });

  describe("DELETE /api/v1/resources/:id", () => {
    it("soft deletes and returns 200", async () => {
      const createRes = await request(app)
        .post("/api/v1/resources")
        .send({ name: "To Delete" })
        .expect(201);
      const id = createRes.body.data.id;

      await request(app).delete(`/api/v1/resources/${id}`).expect(200);

      await request(app).get(`/api/v1/resources/${id}`).expect(404);
    });

    it("returns 404 for non-existent id", async () => {
      await request(app).delete("/api/v1/resources/non-existent").expect(404);
    });
  });
});
