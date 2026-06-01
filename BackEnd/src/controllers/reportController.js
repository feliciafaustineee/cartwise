const pool = require("../config/db");
 
// ── helpers ───────────────────────────────────────────────────────────────────
 
const sendError = (res, status, message) =>
  res.status(status).json({ error: message });
 
// ── controllers ───────────────────────────────────────────────────────────────
 
const getReportsData = async (req, res) => {
  try {
    const user_id = req.user.id;
    const now = new Date();
    const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1;
    const year = req.query.year ? Number(req.query.year) : now.getFullYear();
 
    // Previous month via Date to handle January → December rollover
    const prevDate = new Date(year, month - 2);
    const previousMonth = prevDate.getMonth() + 1;
    const previousYear = prevDate.getFullYear();
 
    // All 4 queries are independent — run in parallel
    const [monthlyResult, topCategoryResult, previousMonthResult, mostPurchasedResult] =
      await Promise.all([
        pool.query(
          `SELECT COALESCE(SUM(total_price), 0) AS monthly_spending
           FROM transactions
           WHERE user_id = $1
             AND EXTRACT(MONTH FROM transaction_date) = $2
             AND EXTRACT(YEAR FROM transaction_date) = $3`,
          [user_id, month, year]
        ),
        pool.query(
          `SELECT categories.name AS category_name, SUM(transactions.total_price) AS total_spent
           FROM transactions
           JOIN categories ON transactions.category_id = categories.id
           WHERE transactions.user_id = $1
             AND EXTRACT(MONTH FROM transaction_date) = $2
             AND EXTRACT(YEAR FROM transaction_date) = $3
           GROUP BY categories.name
           ORDER BY total_spent DESC
           LIMIT 1`,
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
          `SELECT
             item_name,
             SUM(quantity) AS frequency,
             ROUND(AVG(price_per_item)::numeric, 2) AS avg_price,
             SUM(total_price) AS total_spent
           FROM transactions
           WHERE user_id = $1
             AND EXTRACT(MONTH FROM transaction_date) = $2
             AND EXTRACT(YEAR FROM transaction_date) = $3
           GROUP BY item_name
           ORDER BY frequency DESC
           LIMIT 10`,
          [user_id, month, year]
        ),
      ]);
 
    const monthly_spending = Number(monthlyResult.rows[0].monthly_spending);
    const previous_spending = Number(previousMonthResult.rows[0].previous_spending);
 
    const savings_velocity = previous_spending > 0
      ? Number((((previous_spending - monthly_spending) / previous_spending) * 100).toFixed(1))
      : 0;
 
    res.json({
      month,
      year,
      monthly_spending,
      top_category: topCategoryResult.rows[0] ?? null,
      savings_velocity,
      most_purchased_items: mostPurchasedResult.rows,
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Server error");
  }
};
 
module.exports = { getReportsData };