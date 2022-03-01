const { expect } = require("chai");
const request = require("supertest");
const Pool = require("pg-pool");

const client = require("../poolClient");

describe("Note route", () => {
  let app;

  before("Mock db connection and load app", async () => {
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
      "CREATE TEMPORARY TABLE notes (LIKE notes INCLUDING ALL)"
    );
  });

  afterEach("Drop temporary tables", async () => {
    await client.query("DROP TABLE IF EXISTS pg_temp.notes");
  });

  describe("POST /note", async () => {
    it("should create a new note", async () => {
      const req = {
        name: "note1",
        content: "content1",
      };

      await postNote(req);

      const { rows } = await client.query(
        "SELECT * FROM notes WHERE name = $1",
        [req.name]
      );
      expect(rows).lengthOf(1);
      expect(rows[0].name).to.equal(req.name);
    });

    it("should fail if name is already exists", async () => {
      const req = {
        name: "note1",
        content: "content1",
      };

      await postNote(req);
      await postNote(req, 400);
    });

    it("should fail if request is missing required params", async () => {
      await postNote({}, 400);
      await postNote({ name: "note1" }, 400);
      await postNote({ content: "content1" }, 400);
    });
  });

  const postNote = async (req, status = 201) => {
    await request(app).post("/note").send(req).expect(status);
  };
});
