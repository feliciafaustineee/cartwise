const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getReportsData,
} = require("../controllers/reportController");

router.get(
  "/",
  authMiddleware,
  getReportsData
);

module.exports = router;