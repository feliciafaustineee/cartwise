const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { setBudget, getBudgetTracker } = require("../controllers/budgetController");
 
const router = express.Router();
 
router.use(authMiddleware);
 
router.get("/", getBudgetTracker);
router.post("/", setBudget);
 
module.exports = router;