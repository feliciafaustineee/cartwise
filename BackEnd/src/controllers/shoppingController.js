const pool = require("../config/db");
 
const sendError = (res, status, message) =>
  res.status(status).json({ error: message });
 
const findItemOrFail = async (res, item_id, user_id) => {
  const { rows } = await pool.query(
    "SELECT id FROM shopping_items WHERE id = $1 AND user_id = $2",
    [item_id, user_id]
  );
  if (rows.length === 0) {
    sendError(res, 404, "Shopping item not found");
    return null;
  }
  return rows[0];
};

const getShoppingItems = async (req, res) => {
  try {
    const user_id = req.user.id;
    const search = req.query.search || "";
    const { category_id } = req.query;
 
    let query = `
      SELECT
        shopping_items.id,
        shopping_items.name,
        shopping_items.quantity,
        shopping_items.price_per_unit,
        shopping_items.is_purchased,
        shopping_items.created_at,
        categories.name AS category_name,
        (shopping_items.quantity * shopping_items.price_per_unit) AS total_price
      FROM shopping_items
      JOIN categories ON shopping_items.category_id = categories.id
      WHERE shopping_items.user_id = $1
    `;
    const values = [user_id];
 
    if (search) {
      values.push(`%${search}%`);
      query += ` AND shopping_items.name ILIKE $${values.length}`;
    }
 
    if (category_id) {
      values.push(category_id);
      query += ` AND shopping_items.category_id = $${values.length}`;
    }
 
    query += ` ORDER BY shopping_items.is_purchased ASC, shopping_items.created_at DESC`;
 
    const { rows } = await pool.query(query, values);
    const subtotal = rows.reduce((sum, item) => sum + Number(item.total_price), 0);
 
    res.json({ subtotal, total_items: rows.length, items: rows });
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Server error");
  }
};
 
const addShoppingItem = async (req, res) => {
  try {
    const { name, quantity, price_per_unit, category_id } = req.body;
    const user_id = req.user.id;
 
    if (!name || !quantity || !price_per_unit || !category_id)
      return sendError(res, 400, "All fields are required");
    if (name.length < 2 || name.length > 100)
      return sendError(res, 400, "Item name must be 2-100 characters");
    if (quantity < 1 || quantity > 1000)
      return sendError(res, 400, "Quantity must be between 1-1000");
    if (price_per_unit <= 0)
      return sendError(res, 400, "Price per unit must be greater than 0");
 
    const { rows: cat } = await pool.query(
      "SELECT id FROM categories WHERE id = $1",
      [category_id]
    );
    if (cat.length === 0) return sendError(res, 400, "Invalid category");
 
    const { rows } = await pool.query(
      `INSERT INTO shopping_items (user_id, category_id, name, quantity, price_per_unit)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, category_id, name, quantity, price_per_unit]
    );
 
    res.status(201).json({ message: "Shopping item added successfully", item: rows[0] });
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Server error");
  }
};
 
const updateShoppingQuantity = async (req, res) => {
  try {
    const user_id = req.user.id;
    const item_id = req.params.id;
    const { quantity } = req.body;
 
    if (!quantity) return sendError(res, 400, "Quantity is required");
    if (quantity < 1 || quantity > 1000)
      return sendError(res, 400, "Quantity must be between 1-1000");
 
    if (!(await findItemOrFail(res, item_id, user_id))) return;
 
    const { rows } = await pool.query(
      `UPDATE shopping_items
       SET quantity = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [quantity, item_id]
    );
 
    res.json({ message: "Quantity updated successfully", item: rows[0] });
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Server error");
  }
};
 
const togglePurchasedStatus = async (req, res) => {
  try {
    const user_id = req.user.id;
    const item_id = req.params.id;
 
    const item = await findItemOrFail(res, item_id, user_id);
    if (!item) return;
 
    const { rows: current } = await pool.query(
      "SELECT is_purchased FROM shopping_items WHERE id = $1",
      [item_id]
    );
 
    const { rows } = await pool.query(
      `UPDATE shopping_items
       SET is_purchased = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [!current[0].is_purchased, item_id]
    );
 
    res.json({ message: "Purchased status updated", item: rows[0] });
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Server error");
  }
};
 
const deleteShoppingItem = async (req, res) => {
  try {
    const user_id = req.user.id;
    const item_id = req.params.id;
 
    if (!(await findItemOrFail(res, item_id, user_id))) return;
 
    await pool.query("DELETE FROM shopping_items WHERE id = $1", [item_id]);
 
    res.json({ message: "Shopping item deleted successfully" });
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Server error");
  }
};
 
const getCategories = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM categories ORDER BY name ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Server error");
  }
};
 
const checkoutShoppingList = async (req, res) => {
  const user_id = req.user.id;
  const client = await pool.connect();
 
  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const expiry = expiryDate.toISOString().split("T")[0];
 
    await client.query("BEGIN");
 
    const { rows: purchased } = await client.query(
      `SELECT * FROM shopping_items WHERE user_id = $1 AND is_purchased = TRUE`,
      [user_id]
    );
 
    if (purchased.length === 0) {
      await client.query("ROLLBACK");
      return sendError(res, 400, "No purchased items to check out.");
    }
 
    await Promise.all(
      purchased.map((item) =>
        Promise.all([
          client.query(
            `INSERT INTO inventory_items (user_id, category_id, name, stock, price_per_unit, expiration_date)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [user_id, item.category_id, item.name, item.quantity, item.price_per_unit, expiry]
          ),
          client.query(
            `INSERT INTO transactions (user_id, category_id, item_name, quantity, price_per_item, total_price)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [user_id, item.category_id, item.name, item.quantity, item.price_per_unit,
              item.quantity * item.price_per_unit]
          ),
        ])
      )
    );
 
    await client.query(
      "DELETE FROM shopping_items WHERE user_id = $1 AND is_purchased = TRUE",
      [user_id]
    );
 
    await client.query("COMMIT");
 
    res.json({ message: "Checkout successful", checked_out: purchased.length });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Checkout error:", error);
    sendError(res, 500, "Checkout failed. Please try again.");
  } finally {
    client.release();
  }
};
 
module.exports = {
  getShoppingItems,
  addShoppingItem,
  updateShoppingQuantity,
  togglePurchasedStatus,
  deleteShoppingItem,
  getCategories,
  checkoutShoppingList,
};