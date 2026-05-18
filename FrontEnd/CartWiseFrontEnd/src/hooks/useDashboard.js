import { useEffect, useState } from "react";
import { fetchDashboard } from "../api/dashboardApi";

export default function useDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard()
      .then(setDashboardData)
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { dashboardData, loading, error };
}