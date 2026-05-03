import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Grid3x3, ShieldCheck, User } from "lucide-react";

const TABS = [
  { to: "/home", label: "Home", icon: Home, testid: "nav-home" },
  { to: "/apps", label: "Apps", icon: Grid3x3, testid: "nav-apps" },
  { to: "/security", label: "Security", icon: ShieldCheck, testid: "nav-security" },
  { to: "/account", label: "Account", icon: User, testid: "nav-account" },
];

export default function BottomNav() {
  const loc = useLocation();
  if (loc.pathname.startsWith("/auth")) return null;
  if (loc.pathname.startsWith("/testing-rewards")) return null;
  if (loc.pathname.startsWith("/developer-messages")) return null;
  if (loc.pathname.startsWith("/feedback")) return null;

  return (
    <nav
      data-testid="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 glass-bottom"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="page-shell flex items-stretch justify-around">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            data-testid={t.testid}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[64px] transition-colors ${
                isActive ? "text-brand" : "text-ink-tertiary"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <t.icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
                <span className="text-[11px] font-semibold tracking-wide">
                  {t.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
