const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getReportsData } = require("../controllers/reportController");
 
const router = express.Router();
 
router.use(authMiddleware);
 
router.get("/", getReportsData);
 
module.exports = router;