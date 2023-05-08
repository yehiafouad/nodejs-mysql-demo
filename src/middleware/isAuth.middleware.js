const jwt = require("jsonwebtoken");
const db = require("../db/db-connection");

const isAuth = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.header("authorization");
    const token = authHeader.split(" ")[1];

    // Verify the token using the secret key
    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decode) throw { message: "Token Expired.." };

    const isExist = await db.query(
      `SELECT id FROM users WHERE id = ${db.escape(Number(decode.id))}`
    );

    if (isExist[0].length === 0) throw { message: "User not found.." };

    return next();
  } catch (e) {
    res.status(401).json({ success: false, message: e.message });
  }
};

module.exports = { isAuth };
