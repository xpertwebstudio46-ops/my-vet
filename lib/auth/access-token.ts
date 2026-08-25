const storageKey = "myvet_access_token";

let accessToken: string | null = null;

function readStoredToken() {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

export function getAccessToken() {
  accessToken ??= readStoredToken();
  return accessToken;
}

export function setAccessToken(value: string | null) {
  accessToken = value;
  if (typeof window === "undefined") return;
  try {
    if (value) window.sessionStorage.setItem(storageKey, value);
    else window.sessionStorage.removeItem(storageKey);
  } catch {
    // Authentication still works in memory when browser storage is unavailable.
  }
}
