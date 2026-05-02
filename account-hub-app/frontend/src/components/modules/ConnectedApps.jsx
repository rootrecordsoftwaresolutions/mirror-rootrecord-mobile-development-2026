import React from "react";
import { ScreenHeader, PageContainer, Section } from "../ui/Shell";
import { REGISTERED_APPS, UPCOMING_APPS } from "../../lib/apps";
import {
  Cloud,
  Briefcase,
  ShieldCheck,
  MapPin,
  Receipt,
  ArrowUpRight,
  Check,
} from "lucide-react";

const ICONS = { Cloud, Briefcase, ShieldCheck, MapPin, Receipt };

export default function ConnectedApps() {
  return (
    <>
      <ScreenHeader
        title="Connected apps"
        subtitle="Everything that signs in with your RootRecord account"
        back={false}
      />
      <PageContainer>
        <Section title="Available now">
          <div className="p-3 grid grid-cols-1 gap-3">
            {REGISTERED_APPS.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        </Section>

        <Section title="Coming soon">
          <div className="p-3 grid grid-cols-1 gap-3">
            {UPCOMING_APPS.map((app) => (
              <AppCard key={app.id} app={app} dimmed />
            ))}
          </div>
        </Section>

        <p
          className="text-xs text-ink-tertiary text-center px-4 mt-2"
          data-testid="apps-footnote"
        >
          Install each app from Google Play or your existing Windows installer.
          Your Hub sign-in unlocks Pro features automatically where entitled.
        </p>
      </PageContainer>
    </>
  );
}

function AppCard({ app, dimmed }) {
  const Icon = ICONS[app.iconKey] || ShieldCheck;
  const isCurrent = app.status === "current";
  const isComingSoon = app.status === "coming_soon";

  function openApp() {
    // Attempt native deep link; if not installed the scheme quietly fails — we
    // don't use window.confirm here since it's blocked in Capacitor WebView.
    if (app.androidScheme && typeof window !== "undefined") {
      try {
        window.location.href = app.androidScheme;
      } catch {
        /* no-op */
      }
      // Fallback: offer the Play Store URL in a new tab after a short delay.
      if (app.playStoreUrl) {
        setTimeout(() => {
          try {
            window.open(app.playStoreUrl, "_blank", "noopener,noreferrer");
          } catch {
            /* no-op */
          }
        }, 900);
      }
    } else if (app.playStoreUrl) {
      window.open(app.playStoreUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div
      data-testid={`app-card-${app.id}`}
      className={`card p-4 flex items-center gap-3 ${
        dimmed ? "opacity-70" : ""
      }`}
      style={{ borderColor: `${app.brand}33` }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{
          background: `${app.brand}22`,
          color: app.brand,
          border: `1px solid ${app.brand}44`,
        }}
      >
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-heading text-base text-ink-primary truncate">
            {app.name}
          </p>
          {isCurrent && (
            <span
              className="chip"
              style={{ background: `${app.brand}22`, color: app.brand, borderColor: `${app.brand}44` }}
              data-testid={`app-card-${app.id}-current-chip`}
            >
              <Check size={12} /> this app
            </span>
          )}
          {isComingSoon && <span className="chip">soon</span>}
        </div>
        <p className="text-xs text-ink-secondary mt-0.5 line-clamp-2">
          {app.tagline}
        </p>
      </div>
      {!isCurrent && !isComingSoon && (
        <button
          onClick={openApp}
          data-testid={`app-card-${app.id}-open-btn`}
          className="btn btn-secondary min-h-[40px] px-3 text-sm"
          aria-label={`Open ${app.name}`}
        >
          Open <ArrowUpRight size={14} />
        </button>
      )}
    </div>
  );
}
