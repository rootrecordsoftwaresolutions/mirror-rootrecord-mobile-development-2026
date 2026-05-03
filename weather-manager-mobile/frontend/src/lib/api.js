import axios from 'axios';
import { attachAxiosNetworkResilience } from './httpResilience';

// Default: custom domain for `rootrecord-primary` Worker (base URL only — no trailing slash, no /api; client adds /api).
const DEFAULT_BACKEND = 'https://api.rootrecord.info';

function normalizeBackendBase(raw) {
  let base = String(raw ?? '')
    .trim()
    .replace(/\/+$/, '');
  if (!base) return '';
  // Avoid https://host/api + /locations → …/api/api/locations (404 / “Network Error”)
  if (base.toLowerCase().endsWith('/api')) {
    base = base.slice(0, -4).replace(/\/+$/, '');
  }
  return base;
}

/** Hosts that only work with a dev machine / emulator — never use in a production bundle. */
function isLocalDevBackend(base) {
  if (!base) return false;
  try {
    const withProto = /^https?:\/\//i.test(base) ? base : `http://${base}`;
    const { hostname } = new URL(withProto);
    const h = hostname.toLowerCase();
    if (h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '0.0.0.0') return true;
    if (h === '10.0.2.2') return true;
    return false;
  } catch {
    return false;
  }
}

const fromEnv = normalizeBackendBase(process.env.REACT_APP_BACKEND_URL);
const useProdFallback =
  process.env.NODE_ENV === 'production' && fromEnv && isLocalDevBackend(fromEnv);
const BACKEND = useProdFallback ? DEFAULT_BACKEND : fromEnv || DEFAULT_BACKEND;
const API = `${BACKEND}/api`;

/** Ecosystem id for per-app earn/reward analytics (server + this build). */
export const RR_APP_ID = String(process.env.REACT_APP_RR_APP_ID || 'rootrecord_weather_manager_android');

export function isBackendConfigured() {
  return Boolean(BACKEND);
}

export function formatApiError(err) {
  const d = err?.response?.data?.detail;
  if (d !== undefined && d !== null && d !== '') {
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x?.msg || JSON.stringify(x)).join(' · ');
    return String(d);
  }
  const code = err?.code;
  if (code === 'ECONNABORTED') {
    return 'Request timed out. Check your connection and try again.';
  }
  const msg = String(err?.message || '');
  if (code === 'ERR_NETWORK' || msg.toLowerCase().includes('network error')) {
    try {
      const host = new URL(API).host;
      return `Could not reach ${host}. Check Wi‑Fi or cellular data, or try again after disabling VPN. If this persists, reinstall from a build that uses the production API.`;
    } catch {
      return 'Could not reach the server. Check your internet connection and try again.';
    }
  }
  return msg || 'Something went wrong.';
}

const STORAGE_KEYS = {
  token: 'rrwm.token',
  email: 'rrwm.email',
  guest: 'rrwm.guestId',
  pro: 'rrwm.pro',
  life: 'rrwm.life_member',
  proCheckedAt: 'rrwm.pro_checked_at',
  units: 'rrwm.units',
  activeLocId: 'rrwm.activeLocationId',
  locationsCache: 'rrwm.locationsCache.v1',
};

const ACCESS_EVENT = 'rrwm.access.changed';

function ensureGuestId() {
  let g = localStorage.getItem(STORAGE_KEYS.guest);
  if (!g) {
    g = 'g_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEYS.guest, g);
  }
  return g;
}

function authHeaders() {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}

const client = axios.create({ baseURL: API, timeout: 30000 });
attachAxiosNetworkResilience(client, { maxRetries: 3 });
// Do not assign `cfg.headers = { ...spread }` — axios 1.x uses AxiosHeaders; spreading drops adapter state.
client.interceptors.request.use((cfg) => {
  const auth = authHeaders();
  if (auth.Authorization) cfg.headers.Authorization = auth.Authorization;
  return cfg;
});

export function getCachedLocations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.locationsCache);
    const data = JSON.parse(raw || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function setCachedLocations(rows) {
  try {
    const safe = Array.isArray(rows) ? rows : [];
    localStorage.setItem(STORAGE_KEYS.locationsCache, JSON.stringify(safe));
  } catch {
    /* quota / private mode */
  }
}

export const session = {
  getToken: () => localStorage.getItem(STORAGE_KEYS.token),
  getEmail: () => localStorage.getItem(STORAGE_KEYS.email) || '',
  isAuthed: () => Boolean(localStorage.getItem(STORAGE_KEYS.token)),
  isGuest: () => !localStorage.getItem(STORAGE_KEYS.token),
  isPro: () => localStorage.getItem(STORAGE_KEYS.pro) === '1',
  isLifeMember: () => localStorage.getItem(STORAGE_KEYS.life) === '1',
  getProCheckedAtMs: () => {
    const raw = localStorage.getItem(STORAGE_KEYS.proCheckedAt);
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  },
  setSession: (token, email, pro, lifeMember) => {
    localStorage.setItem(STORAGE_KEYS.token, token || '');
    localStorage.setItem(STORAGE_KEYS.email, email || '');
    localStorage.setItem(STORAGE_KEYS.pro, pro ? '1' : '0');
    localStorage.setItem(STORAGE_KEYS.life, lifeMember ? '1' : '0');
    // If this user isn't lifetime, treat sign-in as a tier check.
    if (!lifeMember) localStorage.setItem(STORAGE_KEYS.proCheckedAt, String(Date.now()));
    try { window.dispatchEvent(new Event(ACCESS_EVENT)); } catch { /* ignore */ }
  },
  setAccess: (pro, lifeMember) => {
    localStorage.setItem(STORAGE_KEYS.pro, pro ? '1' : '0');
    localStorage.setItem(STORAGE_KEYS.life, lifeMember ? '1' : '0');
    if (!lifeMember) localStorage.setItem(STORAGE_KEYS.proCheckedAt, String(Date.now()));
    try { window.dispatchEvent(new Event(ACCESS_EVENT)); } catch { /* ignore */ }
  },
  clearSession: () => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.email);
    localStorage.removeItem(STORAGE_KEYS.pro);
    localStorage.removeItem(STORAGE_KEYS.life);
    localStorage.removeItem(STORAGE_KEYS.proCheckedAt);
    try { window.dispatchEvent(new Event(ACCESS_EVENT)); } catch { /* ignore */ }
  },
  guestId: ensureGuestId,
  STORAGE_KEYS,
  ACCESS_EVENT,
};

/** Server min supported semver + Play Store link (sign-in screen). */
export function getMobileVersionPolicy() {
  return client.get('/mobile/version-policy', { params: { app_id: RR_APP_ID } });
}

/** Recent developer notes (Settings). */
export function listDeveloperMessages() {
  return client.get('/mobile/developer-messages', { params: { app_id: RR_APP_ID } });
}

export const api = {
  health: () => client.get('/health'),
  // auth — device_id matches desktop licenseService (Worker forwards to POST /v1/auth/*).
  login: (email, password) =>
    client.post('/auth/login', { email, password, device_id: session.guestId() }),
  signup: (email, password) =>
    client.post('/auth/signup', { email, password, device_id: session.guestId() }),
  me: () => client.post('/auth/me'),
  // prefs
  getPrefs: () => client.get('/me/prefs'),
  setPrefs: (body) => client.post('/me/prefs', body),
  // Beta tester / usage rewards balance (see website for program details)
  getEarnSummary: () => client.get('/earn/summary', { params: { app_id: RR_APP_ID } }),
  earnHeartbeat: (body) => client.post('/earn/heartbeat', body),
  earnCheckin: (body) => client.post('/earn/checkin', body),
  // locations
  listLocations: async () => {
    const res = await client.get('/locations');
    setCachedLocations(res?.data || []);
    return res;
  },
  createLocation: async (loc) => {
    const res = await client.post('/locations', loc);
    const next = res?.data ? [...getCachedLocations().filter((r) => r?.id !== res.data.id), res.data] : getCachedLocations();
    setCachedLocations(next);
    return res;
  },
  updateLocation: (id, patch) => client.patch(`/locations/${id}`, patch),
  deleteLocation: async (id) => {
    const res = await client.delete(`/locations/${id}`);
    setCachedLocations(getCachedLocations().filter((r) => r?.id !== id));
    return res;
  },
  /** Latest device GPS for this account (app open); not a named saved location. */
  reportDeviceLocation: (body) => client.post('/me/device-location', body),
  registerPushToken: (body) => client.post('/me/push-token', body),
  // weather
  current: (lat, lon) => client.get('/weather/current', { params: { lat, lon } }),
  forecast: (lat, lon) => client.get('/weather/forecast', { params: { lat, lon } }),
  alerts: (lat, lon) => client.get('/weather/alerts', { params: { lat, lon } }),
  canada: (lat, lon) => client.get('/canada/alerts', { params: { lat, lon } }),
  dashboard: (lat, lon, opts = {}) =>
    client.get('/dashboard', {
      params: {
        lat,
        lon,
        ...(opts.locationId ? { location_id: opts.locationId } : {}),
        ...(opts.forceRefresh ? { refresh: true } : {}),
      },
    }),
  // hazards
  earthquakes: (lat, lon, opts = {}) =>
    client.get('/usgs/earthquakes', {
      params: { lat, lon, period: opts.period || 'day', min_magnitude: opts.min ?? 2.5, radius_miles: opts.radius ?? 2000 },
    }),
  tsunamis: () => client.get('/usgs/tsunamis'),
  cyclones: () => client.get('/eonet/cyclones'),
  wildfires: () => client.get('/eonet/wildfires'),
  /** In-app feedback → primary Worker → Discord (Bearer required). */
  sendFeedback: (body) => client.post('/feedback', body),
};

export default client;
