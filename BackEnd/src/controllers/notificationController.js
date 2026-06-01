const pool = require("../config/db");
 
const sendError = (res, status, message) =>
  res.status(status).json({ error: message });
 
const PRIORITY = { expired: 1, expiring_soon: 2, budget_alert: 3, low_stock: 4 };

const getNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
 
    const [expiredResult, expiringSoonResult, lowStockResult, budgetsResult] =
      await Promise.all([
        pool.query(
          `SELECT id, name, expiration_date
           FROM inventory_items
           WHERE user_id = $1 AND expiration_date < CURRENT_DATE`,
          [user_id]
        ),
        pool.query(
          `SELECT id, name, expiration_date
           FROM inventory_items
           WHERE user_id = $1
             AND expiration_date >= CURRENT_DATE
             AND expiration_date <= CURRENT_DATE + INTERVAL '3 days'`,
          [user_id]
        ),
        pool.query(
          `SELECT id, name, stock, minimum_stock
           FROM inventory_items
           WHERE user_id = $1 AND stock <= minimum_stock`,
          [user_id]
        ),
        pool.query(
          `SELECT
             budgets.category_id,
             budgets.monthly_limit,
             categories.name AS category_name
           FROM budgets
           JOIN categories ON budgets.category_id = categories.id
           WHERE budgets.user_id = $1
             AND budgets.month = $2
             AND budgets.year = $3`,
          [user_id, month, year]
        ),
      ]);
 
    const categoryIds = budgetsResult.rows.map((b) => b.category_id);
    const spentRows = categoryIds.length > 0
      ? (await pool.query(
          `SELECT category_id, COALESCE(SUM(total_price), 0) AS spent
           FROM transactions
           WHERE user_id = $1
             AND category_id = ANY($2)
             AND EXTRACT(MONTH FROM transaction_date) = $3
             AND EXTRACT(YEAR FROM transaction_date) = $4
           GROUP BY category_id`,
          [user_id, categoryIds, month, year]
        )).rows
      : [];
 
    const spentMap = Object.fromEntries(
      spentRows.map((r) => [r.category_id, Number(r.spent)])
    );
 
    const expired = expiredResult.rows.map((item) => ({
      type: "expired",
      item_id: item.id,
      item_name: item.name,
      expiration_date: item.expiration_date,
    }));
 
    const expiringSoon = expiringSoonResult.rows.map((item) => ({
      type: "expiring_soon",
      item_id: item.id,
      item_name: item.name,
      expiration_date: item.expiration_date,
      days_remaining: Math.ceil(
        (new Date(item.expiration_date) - Date.now()) / (1000 * 60 * 60 * 24)
      ),
    }));
 
    const lowStock = lowStockResult.rows.map((item) => ({
      type: "low_stock",
      item_id: item.id,
      item_name: item.name,
      stock: item.stock,
      minimum_stock: item.minimum_stock,
    }));
 
    const budgetAlerts = budgetsResult.rows.reduce((acc, budget) => {
      const spent = spentMap[budget.category_id] ?? 0;
      const percentage_used = (spent / budget.monthly_limit) * 100;
      if (percentage_used >= 90) {
        acc.push({
          type: "budget_alert",
          category_id: budget.category_id,
          category_name: budget.category_name,
          monthly_limit: budget.monthly_limit,
          spent,
          percentage_used: Number(percentage_used.toFixed(1)),
        });
      }
      return acc;
    }, []);
 
    const notifications = [...expired, ...expiringSoon, ...budgetAlerts, ...lowStock];
    // Arrays already in priority order — sort only needed if order within groups matters
    notifications.sort((a, b) => PRIORITY[a.type] - PRIORITY[b.type]);
 
    res.json({ total_notifications: notifications.length, notifications });
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Server error");
  }
};
 
module.exports = { getNotifications };