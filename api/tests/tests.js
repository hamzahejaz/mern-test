import request from "supertest";
import app from "../server.js";

describe("API Tests Auth & AUthentication", () => {
	let adminToken;
	let userToken;

	beforeAll(async () => {
		const adminLogin = await request(app)
			.post("/api/login")
			.send({ username: "admin", password: "password2" });
		expect(adminLogin.status).toBe(200);
		adminToken = adminLogin.body.token;

		const userLogin = await request(app)
			.post("/api/login")
			.send({ username: "user", password: "password1" });

		expect(userLogin.status).toBe(200);
		userToken = userLogin.body.token;
	});
});

describe("GET /feed", () => {
    it("should return paginated posts", async () => {
        const res = await request(app).get("/feed?page=1&limit=5");

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("posts");
        expect(res.body).toHaveProperty("totalCount");
        expect(res.body).toHaveProperty("hasMore");
    });

    it("should return 400 on invalid page or limit", async () => {
        const res = await request(app).get("/feed?page=-1&limit=500");
        expect(res.statusCode).toBe(400);
    });
});

describe("GET /feed/:id", () => {
    it("should return single post by id", async () => {
        const list = await request(app).get("/posts");
        if (list.statusCode === 200 && list.body.posts.length > 0) {
            const id = list.body.posts[0].id;
            postIdToDelete = id;

            const res = await request(app).get(`/feed/${id}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("id", id);
        } else {
            console.warn("No post available for ID-based tests");
        }
    });

    it("should return 404 for non-existing post", async () => {
        const res = await request(app).get("/feed/nonexistent-id");
        expect(res.statusCode).toBe(404);
    });
});

describe("DELETE /feed/:id", () => {
    it("should delete a post with admin token", async () => {
        if (!postIdToDelete) return;

        const res = await request(app)
            .delete(`/feed/${postIdToDelete}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Post deleted successfully");
        expect(res.body).toHaveProperty("deletedPost");
    });

    it("should not allow deletion without token", async () => {
        const res = await request(app).delete("/feed/any-id");
        expect(res.statusCode).toBe(401);
    });

    it("should not allow user role to delete post", async () => {
        const res = await request(app)
            .delete("/feed/any-id")
            .set("Authorization", `Bearer ${userToken}`);
        expect([401, 403]).toContain(res.statusCode);
    });
});

