const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
 
const sendError = (res, status, message) =>
  res.status(status).json({ error: message });
 
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,12}$/;
 
const validateRegisterInput = ({ name, email, password }) => {
  if (!name || !email || !password) return "All fields are required";
  if (name.length < 2) return "Name must be at least 2 characters";
  if (!EMAIL_REGEX.test(email)) return "Invalid email format";
  if (!PASSWORD_REGEX.test(password))
    return "Password must be 8-12 characters, contain 1 uppercase letter and 1 special character";
  return null;
};

const register = async (req, res) => {
  try {
    const validationError = validateRegisterInput(req.body);
    if (validationError) return sendError(res, 400, validationError);
 
    const { name, email, password } = req.body;
 
    const { rows: existing } = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existing.length > 0) return sendError(res, 400, "Email already registered");
 
    const passwordHash = await bcrypt.hash(password, 10);
 
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, passwordHash]
    );
 
    res.status(201).json({ message: "User registered successfully", user: rows[0] });
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Server error");
  }
};
 
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, 400, "All fields are required");
 
    const { rows } = await pool.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = $1",
      [email]
    );
    const user = rows[0];
 
    const validPassword = user && (await bcrypt.compare(password, user.password_hash));
    if (!validPassword) return sendError(res, 400, "Invalid email or password");
 
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
 
    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Server error");
  }
};
 
module.exports = { register, login };