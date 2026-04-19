// src/api/analytics.js
import api from "./axios";

/**
 * Fetch analytics summary for logged-in user
 * Backend: GET /api/analytics/summary
 */
export const getAnalyticsSummary = async () => {
  const res = await api.get("/analytics");
  return res.data;
};
