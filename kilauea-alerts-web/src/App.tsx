import { useCallback, useEffect, useMemo, useState } from "react";
import { BIG_ISLAND_LOCATIONS, type BigIslandLocation } from "./locations";
import { ensureGuestId } from "./guest";

/** Origin only (no `/api`); dashboard uses `/api/dashboard` on the Kīlauea API shard. */
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

export function App() {
  const defaultLoc = useMemo(
    () => BIG_ISLAND_LOCATIONS.find((l) => l.id === "volcano") ?? BIG_ISLAND_LOCATIONS[0]!,
    [],
  );
  const [location, setLocation] = useState<BigIslandLocation>(defaultLoc);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState<string>("");
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
        });
        const text = await res.text();
        if (!res.ok) {
          setJsonText("");
          setError(`${res.status} ${res.statusText}\n${text.slice(0, 800)}`);
          return;
        }
        try {
          const obj = JSON.parse(text) as unknown;
          setJsonText(JSON.stringify(obj, null, 2));
        } catch {
          setJsonText(text);
        }
        setFetchedAt(new Date().toISOString());
      } catch (e) {
        setJsonText("");
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

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "1.25rem" }}>
      <header style={{ marginBottom: "1.25rem" }}>
        <h1 style={{ margin: "0 0 0.35rem", fontSize: "1.45rem" }}>Kīlauea Alerts (web)</h1>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.95rem" }}>
          Weather bundle from{" "}
          <code style={{ color: "var(--text)" }}>GET /api/dashboard</code> — same source as the
          Android app&apos;s Weather tab (Big Island presets). USGS volcano JSON and live feeds
          still ship in the native app today.
        </p>
        <p style={{ margin: "0.75rem 0 0", fontSize: "0.9rem" }}>
          <a href="https://rootrecord.info/">rootrecord.info</a>
          {" · "}
          <a href="https://www.usgs.gov/volcanoes/kilauea">USGS Kīlauea</a>
        </p>
      </header>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
          marginBottom: "1rem",
          padding: "0.75rem",
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 8,
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 220px" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Location</span>
          <select
            value={location.id}
            onChange={(e) => {
              const next = BIG_ISLAND_LOCATIONS.find((l) => l.id === e.target.value);
              if (next) setLocation(next);
            }}
            style={{
              padding: "0.45rem 0.5rem",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "#0c0f0d",
              color: "var(--text)",
            }}
          >
            {BIG_ISLAND_LOCATIONS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={loading}
          onClick={() => void load(false)}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: "#1e2622",
            color: "var(--text)",
            cursor: loading ? "wait" : "pointer",
          }}
        >
          Refresh
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void load(true)}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 6,
            border: `1px solid var(--accent)`,
            background: "transparent",
            color: "var(--accent)",
            cursor: loading ? "wait" : "pointer",
          }}
          title="Bypasses Worker D1 cache when supported — use sparingly."
        >
          Force refresh
        </button>
        {fetchedAt ? (
          <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Updated {fetchedAt}</span>
        ) : null}
      </div>

      {error ? (
        <pre
          style={{
            padding: "1rem",
            background: "#2a1510",
            border: "1px solid var(--accent)",
            borderRadius: 8,
            overflow: "auto",
            color: "#ffb4a8",
          }}
        >
          {error}
        </pre>
      ) : null}

      <section
        style={{
          marginTop: "1rem",
          padding: "0.75rem",
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 8,
        }}
      >
        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Dashboard JSON</h2>
        {loading && !jsonText ? (
          <p style={{ margin: 0, color: "var(--muted)" }}>Loading…</p>
        ) : (
          <pre
            style={{
              margin: 0,
              maxHeight: "70vh",
              overflow: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {jsonText || "—"}
          </pre>
        )}
      </section>
    </div>
  );
}
