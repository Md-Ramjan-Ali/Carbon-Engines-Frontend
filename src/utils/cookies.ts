import Cookies from "js-cookie";

/** Save token in browser cookie (front-end readable cookie) */
export function setAuthCookie(token: string) {
  Cookies.set("ce_token", token, {
    expires: 7, // 7 days
    secure: false, // localhost এ secure false হবে
    sameSite: "lax",
    path: "/",
  });
}

export function getAuthCookie() {
  return Cookies.get("ce_token") || null;
}

export function removeAuthCookie() {
  Cookies.remove("ce_token");
}
