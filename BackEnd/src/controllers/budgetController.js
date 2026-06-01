const pool = require("../config/db");

const sendError = (res, status, message) =>
  res.status(status).json({ error: message });
 
const setBudget = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { category_id, month, year, monthly_limit } = req.body;
 
    if (!category_id || !month || !year || !monthly_limit)
      return sendError(res, 400, "All fields are required");
    if (month < 1 || month > 12)
      return sendError(res, 400, "Month must be between 1-12");
    if (monthly_limit <= 0)
      return sendError(res, 400, "Monthly limit must be greater than 0");
 
    const { rows: cat } = await pool.query(
      "SELECT id FROM categories WHERE id = $1",
      [category_id]
    );
    if (cat.length === 0) return sendError(res, 400, "Invalid category");
 
    const { rows: existing } = await pool.query(
      `SELECT id FROM budgets
       WHERE user_id = $1 AND category_id = $2 AND month = $3 AND year = $4`,
      [user_id, category_id, month, year]
    );
 
    const { rows } = existing.length > 0
      ? await pool.query(
          `UPDATE budgets SET monthly_limit = $1 WHERE id = $2 RETURNING *`,
          [monthly_limit, existing[0].id]
        )
      : await pool.query(
          `INSERT INTO budgets (user_id, category_id, month, year, monthly_limit)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [user_id, category_id, month, year, monthly_limit]
        );
 
    res.json({ message: "Budget saved successfully", budget: rows[0] });
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Server error");
  }
};
 
const getBudgetTracker = async (req, res) => {
  try {
    const user_id = req.user.id;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
 
    const { rows: budgetRows } = await pool.query(
      `SELECT
         budgets.id,
         budgets.category_id,
         budgets.monthly_limit,
         categories.name AS category_name
       FROM budgets
       JOIN categories ON budgets.category_id = categories.id
       WHERE budgets.user_id = $1
         AND budgets.month = $2
         AND budgets.year = $3`,
      [user_id, month, year]
    );
 
    if (budgetRows.length === 0) {
      return res.json({ total_budget: 0, total_spent: 0, total_remaining: 0, budgets: [] });
    }
 
    const categoryIds = budgetRows.map((b) => b.category_id);
    const { rows: spentRows } = await pool.query(
      `SELECT
         category_id,
         COALESCE(SUM(total_price), 0) AS spent
       FROM transactions
       WHERE user_id = $1
         AND category_id = ANY($2)
         AND EXTRACT(MONTH FROM transaction_date) = $3
         AND EXTRACT(YEAR FROM transaction_date) = $4
       GROUP BY category_id`,
      [user_id, categoryIds, month, year]
    );
 
    const spentMap = Object.fromEntries(
      spentRows.map((r) => [r.category_id, Number(r.spent)])
    );
 
    let total_budget = 0;
    let total_spent = 0;
 
    const budgets = budgetRows.map((budget) => {
      const spent = spentMap[budget.category_id] ?? 0;
      const remaining = budget.monthly_limit - spent;
 
      total_budget += Number(budget.monthly_limit);
      total_spent += spent;
 
      return {
        ...budget,
        spent,
        remaining,
        percentage_used: Number(((spent / budget.monthly_limit) * 100).toFixed(1)),
        is_over_budget: spent > budget.monthly_limit,
      };
    });
 
    res.json({ total_budget, total_spent, total_remaining: total_budget - total_spent, budgets });
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Server error");
  }
};
 
module.exports = { setBudget, getBudgetTracker };