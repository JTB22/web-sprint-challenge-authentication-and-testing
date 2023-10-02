const request = require("supertest");
const server = require("./server");
const db = require("../data/dbConfig");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

afterAll(async () => {
  await db.destroy();
});

// Write your tests here
test("sanity", () => {
  expect(process.env.NODE_ENV).toBe("testing");
});

// register endpoint
describe("Register endpoint", () => {
  test("Register endpoint checks for username and password", async () => {
    const response = await request(server)
      .post("/api/auth/register")
      .send({ username: "", password: "foobar" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("username and password required");

    const response2 = await request(server)
      .post("/api/auth/register")
      .send({ username: "Captain Marvel", password: "" });

    expect(response2.status).toBe(400);
    expect(response2.body.message).toBe("username and password required");
  });

  test("Register endpoint checks for unique username", async () => {
    const response = await request(server)
      .post("/api/auth/register")
      .send({ username: "Captain Marvel", password: "foobar" });

    expect(response.status).toBe(201);
    expect(response.body.id).toBe(1);

    const response2 = await request(server)
      .post("/api/auth/register")
      .send({ username: "Captain Marvel", password: "foobar" });

    expect(response2.status).toBe(400);
    expect(response2.body.message).toBe("username taken");
  });
});

// login endpoint
describe("Login endpoint", () => {
  test("Login endpoint checks for username and password", async () => {
    const response = await request(server)
      .post("/api/auth/login")
      .send({ username: "", password: "foobar" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("username and password required");

    const response2 = await request(server)
      .post("/api/auth/login")
      .send({ username: "Captain Marvel", password: "" });

    expect(response2.status).toBe(400);
    expect(response2.body.message).toBe("username and password required");
  });

  test("login validates username and password and returns token", async () => {
    const response = await request(server)
      .post("/api/auth/login")
      .send({ username: "Captain Marvel", password: "foobar" });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});

// jokes endpoint
describe("Jokes endpoint", () => {
  test("Jokes endpoint checks for token", async () => {
    const response = await request(server)
      .get("/api/jokes")
      .send({ token: "" });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("token required");
  });

  test("Returns jokes when token is valid", async () => {
    const login = await request(server)
      .post("/api/auth/login")
      .send({ username: "Captain Marvel", password: "foobar" });

    const response = await request(server)
      .get("/api/jokes")
      .set("Authorization", login.body.token);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);
  });
});
