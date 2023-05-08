const db = require("../db/db-connection");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    // Search user by email to check if exist ot not
    let data = await db.query(
      `SELECT * FROM users WHERE LOWER(email) = LOWER(${db.escape(
        req.body.email
      )});`
    );

    // If exist throw exist message
    if (data[0].length > 0)
      throw { message: "Already registered..", code: 400 };

    // Hash the password
    const hash = await bcrypt.hashSync(req.body.password, 10);

    // Insert data into MySQL Database
    await db.query(
      `INSERT INTO users (name, email, password) VALUES ('${
        req.body.name
      }', ${db.escape(req.body.email)}, ${db.escape(hash)});`
    );

    return res.status(201).json({
      success: true,
      message: "Registered successfully..",
    });
  } catch (e) {
    res
      .status(400)
      .json({ success: false, message: e?.message || "Something went wrong" });
  }
};

const login = async (req, res) => {
  try {
    // Search user by email to check if exist ot not
    let data = await db.query(
      `SELECT * FROM users WHERE LOWER(email) = LOWER(${db.escape(
        req.body.email
      )});`
    );
    data = data[0];

    // If not exist throw not exist message
    if (data[0].length === 0)
      throw { message: "User not Found, please resgiter..", code: 400 };

    // Compare the entered password by the input
    const isMatched = await bcrypt.compareSync(
      req.body.password,
      data[0]["password"]
    );

    // If not match throw error
    if (!isMatched) throw { message: "Password is not matched..", code: 400 };

    const token = await jwt.sign(
      { id: data[0]["id"] },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    await db.query(
      `UPDATE users SET lastLogin = now(), token = '${token}' WHERE id = '${data[0]["id"]}'`
    );

    return res.status(200).json({
      success: true,
      message: "Logged in successfully..",
      data: { token },
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e?.message || "Something went wrong",
    });
  }
};

const users = async (req, res) => {
  try {
    // Get all users query
    let data = await db.query(`SELECT id, name, email FROM users`);
    data = data[0];

    return res.status(200).json({
      success: true,
      data: data,
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e?.message || "Something went wrong",
    });
  }
};

const usersById = async (req, res) => {
  try {
    // Get all users query
    let data = await db.query(
      `SELECT id, name, email FROM users WHERE LOWER(id) = ${db.escape(
        Number(req.params.id)
      )}`
    );

    data = data[0];

    if (!data[0]) throw { message: "User not found with this ID.." };

    return res.status(200).json({
      success: true,
      data: data[0],
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e?.message || "Something went wrong",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const isExist = await db.query(
      `SELECT * FROM users WHERE id = ${db.escape(Number(req.params.id))};`
    );

    if (isExist[0].length === 0) throw { message: "Invalid ID.." };

    let query = `UPDATE users SET `;

    if (req.body.password && !req.body.oldPassword)
      throw { message: "old password is missing.." };

    let hash;
    if (req.body.password) {
      const isMatched = await bcrypt.compare(
        req.body.oldPassword,
        isExist[0][0].password
      );

      if (!isMatched) throw { message: "Password is not matched..." };
      hash = bcrypt.hashSync(req.body.password, 10);
      delete req.body["oldPassword"];
    }
    let bodyKeys = Object.keys(req.body);

    bodyKeys.forEach((o, i) => {
      !["oldpassword"].includes(o.toLowerCase())
        ? (query = query.concat(
            `${o} = ${
              o === "password" ? `'${hash}'` : `${db.escape(req.body[o])}`
            }${i === bodyKeys.length - 1 ? "" : ","} `
          ))
        : null;
    });
    query.concat(`WHERE id = ${db.escape(Number(req.query.id))}`);

    await db.query(query);

    return res.status(200).json({
      success: true,
      message: "User updated..",
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e?.message || "Something went wrong",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const isExist = await db.query(
      `SELECT * FROM users WHERE id = ${db.escape(Number(req.params.id))}`
    );

    if (isExist[0].length === 0) throw { message: "Invalid ID.." };

    await db.query(
      `DELETE FROM users WHERE id = ${db.escape(Number(req.params.id))}`
    );

    return res.status(200).json({
      success: true,
      message: "User deleted..",
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e?.message || "Something went wrong",
    });
  }
};

module.exports = { register, login, users, usersById, updateUser, deleteUser };
