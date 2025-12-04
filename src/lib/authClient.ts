// lib/authClient.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
import { setAuthCookie, getAuthCookie, removeAuthCookie } from "../utils/cookies";

async function parseJsonResponse(res) {
  const payload = await res.json().catch(() => ({}));
  const body = payload.data ?? payload;
  return { ok: res.ok, status: res.status, payload, body };
}

/* ---------- AUTH METHODS ---------- */

// Signup not included here – you have separate API
// OTP VERIFY → save cookie
export async function verifyOtp(email, otp) {
  const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  const { ok, body, payload } = await parseJsonResponse(res);
  if (!ok) throw payload;

  if (body.token) {
    setAuthCookie(body.token); // SAVE TOKEN IN COOKIE
  }

  return body;
}

export async function resendOtp(email) {
  const res = await fetch(`${API_BASE}/api/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const { ok, body, payload } = await parseJsonResponse(res);
  if (!ok) throw payload;
  return body;
}

// Login → cookie store
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const { ok, body, payload } = await parseJsonResponse(res);
  if (!ok) throw payload;

  if (body.token) setAuthCookie(body.token);

  return body;
}

/* ---------- PROFILE FETCH WITH COOKIE ---------- */

export async function fetchWithAuth(path, opts = {}) {
  const token = getAuthCookie();

  const headers = {
    ...(opts.headers || {}),
    "Content-Type": "application/json",
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
  });

  return res;
}

/* ---------- LOGOUT ---------- */

export function logout() {
  removeAuthCookie();
}
