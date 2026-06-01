const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getShoppingItems,
  addShoppingItem,
  updateShoppingQuantity,
  togglePurchasedStatus,
  deleteShoppingItem,
  getCategories,
  checkoutShoppingList,
} = require("../controllers/shoppingController");
 
const router = express.Router();
 
router.use(authMiddleware); // semua route butuh auth
 
router.get("/categories/all", getCategories);
router.get("/", getShoppingItems);
router.post("/", addShoppingItem);
router.post("/checkout", checkoutShoppingList);
router.put("/:id", updateShoppingQuantity);
router.patch("/:id/purchased", togglePurchasedStatus);
router.delete("/:id", deleteShoppingItem);
 
module.exports = router;