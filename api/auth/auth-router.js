const router = require("express").Router();
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const db = require("../../data/dbConfig");

router.post("/register", async (req, res) => {
  // res.end("implement register, please!");
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  } else if (await db("users").where({ username }).first()) {
    return res.status(400).json({ message: "username taken" });
  } else {
    const hashedPassword = bcrypt.hashSync(password, 8);
    await db("users")
      .insert({ username, password: hashedPassword })
      .then(([id]) => {
        res.status(201).json({
          id: id,
          username,
          password: hashedPassword,
        });
      });
  }
});

router.post("/login", async (req, res) => {
  // res.end("implement login, please!");
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  } else {
    const user = await db("users").where({ username }).first();
    if (!user) {
      return res.status(400).json({ message: "invalid credentials" });
    } else {
      if (bcrypt.compareSync(password, user.password)) {
        const token = jsonwebtoken.sign(
          { username },
          process.env.JWT_SECRET || "shh",
          { expiresIn: "7d" }
        );
        return res.status(200).json({ message: "welcome, " + username, token });
      } else {
        return res.status(400).json({ message: "invalid credentials" });
      }
    }
  }
});

module.exports = router;
