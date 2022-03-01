const { expect } = require("chai");
const Pool = require("pg-pool");
const request = require("supertest");

const client = require("../poolClient");

describe("Register route", async () => {
  let app;
  before("Mock db connection and load app", () => {
    const pool = new Pool({
      database: "postgres",
      host: "localhost",
      port: 5432,
      user: "postgres",
      password: "admin@123",
      max: 1,
      idleTimeoutMillis: 0,
    });

    client.query = (text, params) => pool.query(text, params);

    app = require("../index");
  });

  beforeEach("Create temporary tables", async () => {
    await client.query(
      "CREATE TEMPORARY TABLE users (LIKE users INCLUDING ALL)"
    );
  });

  afterEach("Drop temporary tables", async () => {
    await client.query("DROP TABLE IF EXISTS pg_temp.users");
  });

  describe("POST /register", async () => {
    it("should success when all params valid", async () => {
      const req = {
        name: "user1",
        email: "valan101@gmail.com",
        password: "pass1234",
      };
      await registerUser(req, 201);

      const { rows } = await client.query(
        "SELECT * FROM users WHERE name = $1",
        [req.name]
      );
      expect(rows).lengthOf(1);
      expect(rows[0].name).to.equal(req.name);
    });

    it("should fail if user already exists", async () => {
      const req = {
        name: "user1",
        email: "valan101@gmail.com",
        password: "pass1234",
      };

      await registerUser(req, 201);
      await registerUser(req, 400);
    });
  });
  const registerUser = async (req, status) => {
    await request(app).post("/register").send(req).expect(status);
  };
});
