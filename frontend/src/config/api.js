// Local dev
const LOCAL = "http://localhost:5000";

// Vercel serverless API (nanti kita ganti sesuai domain setelah deploy)
const PROD = "/api"; 

export const baseURL = import.meta.env.DEV ? LOCAL : PROD;

