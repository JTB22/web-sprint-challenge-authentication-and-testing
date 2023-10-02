const jsonwebtoken = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  /*
    IMPLEMENT

    1- On valid token in the Authorization header, call next.

    2- On missing token in the Authorization header,
      the response body should include a string exactly as follows: "token required".

    3- On invalid or expired token in the Authorization header,
      the response body should include a string exactly as follows: "token invalid".
  */
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "token required" });
  } else {
    const { username } = await jsonwebtoken.verify(
      token,
      process.env.JWT_SECRET || "shh"
    );
    if (username) {
      return next();
    } else {
      return res.status(401).json({ message: "token invalid" });
    }
  }
};
