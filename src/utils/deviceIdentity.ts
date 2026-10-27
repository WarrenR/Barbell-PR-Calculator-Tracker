const DEVICE_COOKIE_NAME = 'barbell_device_id';

/**
 * Gets a cookie by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Sets a persistent cookie (1 year duration)
 */
export function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Generates a random friendly identifier (e.g., "GYM-7F3A-9B21")
 */
function generateDeviceId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    const raw = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
    return `GYM-${raw.slice(0, 4)}-${raw.slice(4)}`;
  }
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `GYM-${randomPart.slice(0, 4)}-${randomPart.slice(4)}`;
}

/**
 * Gets or initializes the device identity cookie and syncs with localStorage
 */
export function getOrCreateDeviceId(): string {
  // Check cookie first
  let id = getCookie(DEVICE_COOKIE_NAME);

  // Fallback to localStorage if cookie was cleared
  if (!id && typeof localStorage !== 'undefined') {
    id = localStorage.getItem('barbell_device_id');
  }

  // If still not found, create new ID
  if (!id) {
    id = generateDeviceId();
  }

  // Persist to both cookie and localStorage
  setCookie(DEVICE_COOKIE_NAME, id);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('barbell_device_id', id);
  }

  return id;
}
