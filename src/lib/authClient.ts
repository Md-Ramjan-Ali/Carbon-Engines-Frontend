const API_BASE = process.env.NEXT_PUBLIC_API_BASE;


async function parseJsonResponse(res) {
    const payload = await res.json().catch(() => ({}));
    const body = payload.data ?? payload;
    return { ok: res.ok, status: res.status, payload, body };
}


function saveToken(token) {
    if (!token) return;
    localStorage.setItem('ce_token', token);
}


function saveUser(user) {
    if (!user) return;
    try { localStorage.setItem('ce_user', JSON.stringify(user)); } catch (e) { }
}

export async function login(email, password) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const { ok, body, payload } = await parseJsonResponse(res);
    if (!ok) throw payload;
    if (body.token) saveToken(body.token);
    if (body.user) saveUser(body.user);
    return body;
}


export async function signup(name, email, password) {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    const { ok, body, payload } = await parseJsonResponse(res);
    if (!ok) throw payload;
    if (body.token) saveToken(body.token);
    if (body.user) saveUser(body.user);
    return body;
}

export async function requestPasswordReset(email) {
    const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    const { body, ok, payload } = await parseJsonResponse(res);
    if (!ok) throw payload;
    return body;
}


export async function resetPassword(token, password) {
    const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
    });
    const { body, ok, payload } = await parseJsonResponse(res);
    if (!ok) throw payload;
    return body;
}

export async function verifyEmail(token) {
    const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    });
    const { body, ok, payload } = await parseJsonResponse(res);
    if (!ok) throw payload;
    return body;
}


export async function verifyOtp(email, otp) {
    const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
    });
    const { ok, body, payload } = await parseJsonResponse(res);
    if (!ok) throw payload;
    if (body.token) saveToken(body.token);
    if (body.user) saveUser(body.user);
    return body;
}

export function logout() {
    localStorage.removeItem('ce_token');
    localStorage.removeItem('ce_user');
}


export function getToken() {
    return localStorage.getItem('ce_token');
}


export function getUserFromStorage() {
    const s = localStorage.getItem('ce_user');
    if (!s) return null;
    try { return JSON.parse(s); } catch { return null; }
}


export async function fetchWithAuth(path, opts = {}) {
    const token = getToken();
    const headers = { ...(opts.headers || {}), 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
    return res;
}