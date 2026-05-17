const pool = require("../config/db");

const getReportsData = async (req, res) => {
  try {
    const user_id = req.user.id;

    const currentDate = new Date();

    const month = req.query.month
      ? Number(req.query.month)
      : currentDate.getMonth() + 1;

    const year = req.query.year
      ? Number(req.query.year)
      : currentDate.getFullYear();

    const monthlySpendingResult =
      await pool.query(
        `
        SELECT
          COALESCE(
            SUM(total_price),
            0
          ) AS monthly_spending
        FROM transactions
        WHERE user_id = $1
        AND EXTRACT(MONTH FROM transaction_date) = $2
        AND EXTRACT(YEAR FROM transaction_date) = $3
        `,
        [user_id, month, year]
      );

    const monthly_spending = Number(
      monthlySpendingResult.rows[0]
        .monthly_spending
    );

    const topCategoryResult =
      await pool.query(
        `
        SELECT
          categories.name AS category_name,
          SUM(transactions.total_price)
          AS total_spent
        FROM transactions
        JOIN categories
        ON transactions.category_id =
        categories.id
        WHERE transactions.user_id = $1
        AND EXTRACT(MONTH FROM transaction_date) = $2
        AND EXTRACT(YEAR FROM transaction_date) = $3
        GROUP BY categories.name
        ORDER BY total_spent DESC
        LIMIT 1
        `,
        [user_id, month, year]
      );

    const top_category =
      topCategoryResult.rows[0] || null;

    // LAST MONTH SPENDING
    let previousMonth = month - 1;

    let previousYear = year;

    if (previousMonth === 0) {
      previousMonth = 12;
      previousYear--;
    }

    const previousMonthResult =
      await pool.query(
        `
        SELECT
          COALESCE(
            SUM(total_price),
            0
          ) AS previous_spending
        FROM transactions
        WHERE user_id = $1
        AND EXTRACT(MONTH FROM transaction_date) = $2
        AND EXTRACT(YEAR FROM transaction_date) = $3
        `,
        [
          user_id,
          previousMonth,
          previousYear,
        ]
      );

    const previous_spending = Number(
      previousMonthResult.rows[0]
        .previous_spending
    );

    let savings_velocity = 0;

    if (previous_spending > 0) {
      savings_velocity = Number(
        (
          ((previous_spending -
            monthly_spending) /
            previous_spending) *
          100
        ).toFixed(1)
      );
    }

    // MOST PURCHASED ITEMS
    const mostPurchasedResult =
      await pool.query(
        `
        SELECT
          item_name,

          SUM(quantity)
          AS frequency,

          ROUND(
            AVG(price_per_item)::numeric,
            2
          ) AS avg_price,

          SUM(total_price)
          AS total_spent

        FROM transactions

        WHERE user_id = $1

        AND EXTRACT(MONTH FROM transaction_date) = $2

        AND EXTRACT(YEAR FROM transaction_date) = $3

        GROUP BY item_name

        ORDER BY frequency DESC

        LIMIT 10
        `,
        [user_id, month, year]
      );

    res.json({
      month,
      year,

      monthly_spending,

      top_category,

      savings_velocity,

      most_purchased_items:
        mostPurchasedResult.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error",
    });
  }
};

module.exports = {
  getReportsData,
};