import api from "../lib/axios";

export const fetchDashboard = () =>
  api.get("/dashboard").then((res) => res.data);