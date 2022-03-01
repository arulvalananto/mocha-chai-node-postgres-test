const express = require("express");

const poolClient = require("./poolClient");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.post("/note", async (req, res, next) => {
  try {
    const { name, content } = req.body;
    if (!name || !content) return next(new Error("Missing name or content"));

    await poolClient.query(
      "INSERT INTO notes (name, content) VALUES ($1, $2)",
      [name, content]
    );

    console.log(`Note successfully added: ${name}`);
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
});

app.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next(new Error("Missing name, email or password"));
    }

    const { rows } = await poolClient.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (rows.length > 0) {
      return next(new Error("User already exists"));
    }

    const query = `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)`;
    await poolClient.query(query, [name, email, password]);
    res.status(201).json({ isCreated: true });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

app.listen(PORT, () => console.log(`Server at ${PORT}`));

module.exports = app;
