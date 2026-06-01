const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getInventoryItems,
  addInventoryItem,
  updateInventoryStock,
  deleteInventoryItem,
} = require("../controllers/inventoryController");
 
const router = express.Router();
 
router.use(authMiddleware);
 
router.get("/", getInventoryItems);
router.post("/", addInventoryItem);
router.put("/:id", updateInventoryStock);
router.delete("/:id", deleteInventoryItem);
 
module.exports = router;