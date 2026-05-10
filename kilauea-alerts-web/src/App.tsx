import { useCallback, useEffect, useMemo, useState } from "react";
import { BIG_ISLAND_LOCATIONS, type BigIslandLocation } from "./locations";
import { ensureGuestId } from "./guest";
/** Kīlauea API shard only (override with VITE_ROOTRECORD_API_ORIGIN for staging). */
const API_BASE =
  (import.meta.env.VITE_ROOTRECORD_API_ORIGIN as string | undefined)?.trim() ||
  "https://rootrecord-api-kilauea.rootrecord.workers.dev";

function dashboardUrl(loc: BigIslandLocation, refresh: boolean): string {
  const u = new URL(`${API_BASE}/api/dashboard`);
  u.searchParams.set("lat", String(loc.latitude));
  u.searchParams.set("lon", String(loc.longitude));
  u.searchParams.set("location_id", loc.id);
  if (refresh) u.searchParams.set("refresh", "1");
  return u.toString();
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function fmtTemp(v: unknown): string {
  const n = Number(v);
  return Number.isFinite(n) ? `${Math.round(n)}°` : "—";
}

function fmtWind(cur: Record<string, unknown> | null): string {
  if (!cur) return "—";
  const obs = asRecord(cur.observation) || {};
  const s = Number(obs.Wind_Speed_Imperial ?? obs.Wind_Speed_Metric);
  const d = String(obs.Wind_Direction || "").trim();
  if (!Number.isFinite(s)) return "—";
  return d ? `${d} ${Math.round(s)}` : `${Math.round(s)}`;
}

function fmtHumidity(cur: Record<string, unknown> | null): string {
  if (!cur) return "—";
  const obs = asRecord(cur.observation) || {};
  const hourlyNow = asRecord(cur.hourly_now) || {};
  const raw =
    obs.RelativeHumidity ??
    obs.relativeHumidity ??
    hourlyNow.RelativeHumidity ??
    hourlyNow.relativeHumidity;
  const n = Number(raw);
  return Number.isFinite(n) ? `${Math.round(n)}%` : "—";
}

function tryFormatTime(iso: unknown): string | null {
  if (iso == null) return null;
  if (typeof iso === "number" && Number.isFinite(iso)) {
    const d = new Date(iso > 1e12 ? iso : iso * 1000);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
  }
  const s = String(iso).trim();
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
}

function periodTemp(p: Record<string, unknown>): string {
  const t = p.temperature ?? p.Temperature;
  const u = String(p.temperatureUnit ?? p.TemperatureUnit ?? "").trim();
  if (t == null || t === "") return "—";
  return u ? `${t}°${u}` : `${t}°`;
}

export function App() {
  const defaultLoc = useMemo(
    () => BIG_ISLAND_LOCATIONS.find((l) => l.id === "volcano") ?? BIG_ISLAND_LOCATIONS[0]!,
    [],
  );
  const [location, setLocation] = useState<BigIslandLocation>(defaultLoc);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bundle, setBundle] = useState<Record<string, unknown> | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  const load = useCallback(
    async (refresh: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const guest = ensureGuestId();
        const res = await fetch(dashboardUrl(location, refresh), {
          headers: {
            "X-Guest-Id": guest,
            Accept: "application/json",
          },
          credentials: "include",
        });
        const text = await res.text();
        if (!res.ok) {
          setBundle(null);
          setError(`${res.status} ${res.statusText}\n${text.slice(0, 600)}`);
          return;
        }
        const obj = JSON.parse(text) as Record<string, unknown>;
        setBundle(obj);
        setFetchedAt(new Date().toISOString());
      } catch (e) {
        setBundle(null);
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [location],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  const current = asRecord(bundle?.current);
  const obs = asRecord(current?.observation) || {};
  const hourlyNow = asRecord(current?.hourly_now) || {};
  const phrase =
    String(hourlyNow.Phrase_32char || hourlyNow.ShortPhrase || obs.WeatherText || "—").trim() || "—";
  const temp = fmtTemp(hourlyNow.Temperature ?? current?.temperature ?? obs.Temperature);
  const realFeel = fmtTemp(hourlyNow.RealFeelTemperature ?? obs.RealFeelTemperature);
  const humidity = fmtHumidity(current);

  const alertsBlock = asRecord(bundle?.alerts);
  const caBlock = asRecord(bundle?.canada_alerts);
  const nwsList = Array.isArray(alertsBlock?.alerts) ? (alertsBlock!.alerts as unknown[]) : [];
  const caList = Array.isArray(caBlock?.alerts) ? (caBlock!.alerts as unknown[]) : [];
  const alertRows = [...nwsList, ...caList]
    .map((a) => asRecord(a))
    .filter(Boolean) as Record<string, unknown>[];

  const usgs = asRecord(bundle?.usgs);
  const quakes = Array.isArray(usgs?.events) ? (usgs!.events as unknown[]).slice(0, 8) : [];

  const forecastBlock = asRecord(bundle?.forecast);
  const periodsRaw = Array.isArray(forecastBlock?.periods) ? (forecastBlock!.periods as unknown[]) : [];
  const periods = periodsRaw.map((p) => asRecord(p)).filter(Boolean) as Record<string, unknown>[];
  const hourlyRaw = Array.isArray(forecastBlock?.hourly) ? (forecastBlock!.hourly as unknown[]) : [];
  const hourlySlots = hourlyRaw
    .map((h) => asRecord(h))
    .filter(Boolean)
    .slice(0, 14) as Record<string, unknown>[];

  return (
    <div className="app-root">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="brand-block">
            <div className="brand-kicker">RootRecord</div>
            <h1 className="brand-title">Kīlauea observatory</h1>
            <p className="brand-sub">
              Hawaiʻi Island weather, alerts, and seismic activity — web dashboard using the same API bundle as the
              native app.
            </p>
          </div>
          <div className="toolbar">
            <label className="field">
              <span className="field-label">Location</span>
              <select
                className="select"
                value={location.id}
                onChange={(e) => {
                  const next = BIG_ISLAND_LOCATIONS.find((l) => l.id === e.target.value);
                  if (next) setLocation(next);
                }}
              >
                {BIG_ISLAND_LOCATIONS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="toolbar-actions">
              <button type="button" className="btn btn-secondary" disabled={loading} onClick={() => void load(false)}>
                <span className={loading ? "spin" : ""} aria-hidden>
                  ↻
                </span>
                Refresh
              </button>
              <button type="button" className="btn btn-primary" disabled={loading} onClick={() => void load(true)}>
                Force cache bypass
              </button>
            </div>
            {fetchedAt ? <span className="muted small">Updated {fetchedAt}</span> : null}
          </div>
        </div>
      </header>

      {error ? (
        <div className="error-panel" role="alert">
          <span className="error-icon" aria-hidden>
            ⚠
          </span>
          <pre>{error}</pre>
        </div>
      ) : null}

      <div className="dashboard-layout">
        <div className="dashboard-main">
          <section className="panel panel-hero">
            <div className="panel-head">
              <span className="panel-icon" aria-hidden>
                ◎
              </span>
              <h2>Current conditions</h2>
            </div>
            {loading && !bundle ? (
              <p className="muted">Loading conditions…</p>
            ) : (
              <>
                <div className="hero-metrics">
                  <div className="hero-temp">{temp}</div>
                  <div className="hero-meta">
                    <div className="hero-phrase">{phrase}</div>
                    <div className="hero-sub muted small">Feels like {realFeel}</div>
                  </div>
                </div>
                <div className="metric-strip">
                  <div className="metric-chip">
                    <span className="metric-chip-label">Wind</span>
                    <span className="metric-chip-value">{fmtWind(current)}</span>
                  </div>
                  <div className="metric-chip">
                    <span className="metric-chip-label">Humidity</span>
                    <span className="metric-chip-value">{humidity}</span>
                  </div>
                  <div className="metric-chip">
                    <span className="metric-chip-label">RealFeel®</span>
                    <span className="metric-chip-value">{realFeel}</span>
                  </div>
                </div>
              </>
            )}
          </section>

          {hourlySlots.length > 0 ? (
            <section className="panel">
              <div className="panel-head">
                <span className="panel-icon" aria-hidden>
                  ⏱
                </span>
                <h2>Hourly</h2>
              </div>
              <div className="hourly-scroll" role="list">
                {hourlySlots.map((h, i) => {
                  const t =
                    h.temperature != null
                      ? `${h.temperature}${h.temperatureUnit != null ? `°${String(h.temperatureUnit)}` : "°"}`
                      : "—";
                  const when =
                    tryFormatTime(h.startTime) ||
                    tryFormatTime(h.DateTime) ||
                    tryFormatTime(h.EpochDateTime) ||
                    "—";
                  const blurb = String(h.shortForecast || h.ShortPhrase || "").trim();
                  return (
                    <div key={i} className="hourly-cell" role="listitem">
                      <div className="hourly-time">{when}</div>
                      <div className="hourly-temp">{t}</div>
                      {blurb ? <div className="hourly-desc muted small">{blurb.length > 48 ? `${blurb.slice(0, 48)}…` : blurb}</div> : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {periods.length > 0 ? (
            <section className="panel">
              <div className="panel-head">
                <span className="panel-icon" aria-hidden>
                  ☀
                </span>
                <h2>Forecast periods</h2>
              </div>
              <ul className="period-grid">
                {periods.slice(0, 10).map((p, i) => {
                  const name = String(p.name || p.Name || `Period ${i + 1}`).trim();
                  const sub = String(p.shortForecast || p.ShortPhrase || "").trim();
                  return (
                    <li key={i} className="period-card">
                      <div className="period-name">{name}</div>
                      <div className="period-temp">{periodTemp(p)}</div>
                      {sub ? <div className="period-desc muted small">{sub.length > 120 ? `${sub.slice(0, 120)}…` : sub}</div> : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="dashboard-aside">
          <section className="panel panel-alerts">
            <div className="panel-head">
              <span className="panel-icon" aria-hidden>
                !
              </span>
              <h2>Alerts</h2>
              <span className="badge">{alertRows.length}</span>
            </div>
            {alertRows.length === 0 ? (
              <p className="muted">No active alerts for this view.</p>
            ) : (
              <ul className="alert-list alert-list-scroll">
                {alertRows.map((a, i) => {
                  const head = String(a.headline || a.event || a.title || "Alert").trim();
                  const sev = String(a.severity || "").toLowerCase();
                  return (
                    <li key={i} className={`alert-item sev-${sev || "unknown"}`}>
                      <div className="alert-title">{head}</div>
                      {a.description ? (
                        <div className="alert-desc muted small">
                          {String(a.description).length > 320
                            ? `${String(a.description).slice(0, 320)}…`
                            : String(a.description)}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="panel">
            <div className="panel-head">
              <span className="panel-icon" aria-hidden>
                〜
              </span>
              <h2>Recent earthquakes</h2>
            </div>
            {quakes.length === 0 ? (
              <p className="muted">No recent events in this bundle.</p>
            ) : (
              <ul className="quake-list">
                {quakes.map((q, i) => {
                  const row = asRecord(q);
                  if (!row) return null;
                  const mag = row.magnitude ?? row.mag;
                  const place = String(row.place || row.title || "—");
                  const when = row.time != null ? new Date(Number(row.time)).toLocaleString() : "—";
                  return (
                    <li key={i} className="quake-row">
                      <span className="quake-mag">{mag != null ? String(mag) : "—"}</span>
                      <div>
                        <div className="quake-place">{place}</div>
                        <div className="muted small">{when}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="panel panel-links">
            <div className="panel-head">
              <span className="panel-icon" aria-hidden>
                ↗
              </span>
              <h2>Resources</h2>
            </div>
            <div className="link-row">
              <a className="link-pill" href="https://rootrecord.info/" target="_blank" rel="noreferrer">
                rootrecord.info
              </a>
              <a className="link-pill" href="https://www.usgs.gov/volcanoes/kilauea" target="_blank" rel="noreferrer">
                USGS Kīlauea
              </a>
              <a className="link-pill" href="https://www.weather.gov/hfo/" target="_blank" rel="noreferrer">
                NWS Honolulu
              </a>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
