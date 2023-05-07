const { verify } = require("jsonwebtoken");
const db = require("../db/db-connection");

const isAuth = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.header("authorization");
    const token = authHeader.split(" ")[1];

    // Verify the token using the secret key
    verify(token, "d6f260c94d1e9557cb6e42478aa86b3e", async (err, decode) => {
      if (err) throw { message: "Token Expired.." };
      try {
        const isExist = await db.query(
          `SELECT id FROM users WHERE id = ${db.escape(Number(decode.id))}`
        );

        if (isExist[0].length === 0) throw { message: "User not found.." };
      } catch (e) {
        res.status(401).json({ success: false, message: e.message });
      }
    });

    return next();
  } catch (e) {
    res.status(401).json({ success: false, message: e.message });
  }
};

module.exports = { isAuth };
