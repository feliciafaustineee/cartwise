const pool = require("../config/db");
 
const sendError = (res, status, message) =>
  res.status(status).json({ error: message });
 
const getDashboardData = async (req, res) => {
  try {
    const user_id = req.user.id;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
 
    const prevDate = new Date(year, now.getMonth() - 1);
    const previousMonth = prevDate.getMonth() + 1;
    const previousYear = prevDate.getFullYear();
 
    const [
      budgetResult,
      spendingResult,
      previousSpendingResult,
      expiringSoonResult,
      shoppingPendingResult,
      lowStockResult,
      recentTransactionsResult,
    ] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(monthly_limit), 0) AS total_budget
         FROM budgets
         WHERE user_id = $1 AND month = $2 AND year = $3`,
        [user_id, month, year]
      ),
      pool.query(
        `SELECT COALESCE(SUM(total_price), 0) AS total_spent
         FROM transactions
         WHERE user_id = $1
           AND EXTRACT(MONTH FROM transaction_date) = $2
           AND EXTRACT(YEAR FROM transaction_date) = $3`,
        [user_id, month, year]
      ),
      pool.query(
        `SELECT COALESCE(SUM(total_price), 0) AS previous_spending
         FROM transactions
         WHERE user_id = $1
           AND EXTRACT(MONTH FROM transaction_date) = $2
           AND EXTRACT(YEAR FROM transaction_date) = $3`,
        [user_id, previousMonth, previousYear]
      ),
      pool.query(
        `SELECT name, expiration_date
         FROM inventory_items
         WHERE user_id = $1
           AND expiration_date >= CURRENT_DATE
           AND expiration_date <= CURRENT_DATE + INTERVAL '3 days'
         ORDER BY expiration_date ASC
         LIMIT 3`,
        [user_id]
      ),
      pool.query(
        `SELECT COUNT(*) AS pending_count
         FROM shopping_items
         WHERE user_id = $1 AND is_purchased = false`,
        [user_id]
      ),
      pool.query(
        `SELECT COUNT(*) AS low_stock_count
         FROM inventory_items
         WHERE user_id = $1 AND stock <= minimum_stock`,
        [user_id]
      ),
      pool.query(
        `SELECT
           transactions.id,
           transactions.item_name,
           transactions.total_price,
           transactions.transaction_date,
           categories.name AS category_name
         FROM transactions
         JOIN categories ON transactions.category_id = categories.id
         WHERE transactions.user_id = $1
         ORDER BY transaction_date DESC
         LIMIT 3`,
        [user_id]
      ),
    ]);
 
    const total_budget = Number(budgetResult.rows[0].total_budget);
    const total_spent = Number(spendingResult.rows[0].total_spent);
    const previous_spending = Number(previousSpendingResult.rows[0].previous_spending);
 
    const spending_change_percentage = previous_spending > 0
      ? Number((((total_spent - previous_spending) / previous_spending) * 100).toFixed(1))
      : 0;
 
    const total_remaining = total_budget - total_spent;
    const percentage_used = total_budget > 0
      ? Number(((total_spent / total_budget) * 100).toFixed(1))
      : 0;
 
    res.json({
      budget_progress: {
        total_budget,
        total_spent,
        total_remaining,
        percentage_used,
        spending_change_percentage,
      },
      expiring_soon: expiringSoonResult.rows,
      monthly_spending: total_spent,
      shopping_pending: Number(shoppingPendingResult.rows[0].pending_count),
      inventory_alerts: Number(lowStockResult.rows[0].low_stock_count),
      recent_transactions: recentTransactionsResult.rows,
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Server error");
  }
};
 
module.exports = { getDashboardData };