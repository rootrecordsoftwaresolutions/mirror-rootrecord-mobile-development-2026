import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Clock, DollarSign, CalendarDays, MoreHorizontal } from "lucide-react";

const TABS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard" },
  { to: "/track", label: "Track", icon: Clock, testid: "nav-track" },
  { to: "/money", label: "Money", icon: DollarSign, testid: "nav-money" },
  { to: "/schedule", label: "Schedule", icon: CalendarDays, testid: "nav-schedule" },
  { to: "/more", label: "More", icon: MoreHorizontal, testid: "nav-more" },
];

export default function BottomNav() {
  const loc = useLocation();
  const isAuthRoute = loc.pathname.startsWith("/auth");
  if (isAuthRoute) return null;
  return (
    <nav
      data-testid="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 glass-bottom"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="page-shell flex items-stretch justify-around gap-0.5">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            data-testid={t.testid}
            className={({ isActive }) =>
              `flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[64px] transition-colors ${
                isActive ? "text-brand" : "text-ink-tertiary"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <t.icon size={21} strokeWidth={isActive ? 2.4 : 1.8} />
                <span className="text-[10px] font-semibold tracking-wide truncate max-w-full px-0.5 text-center leading-tight">
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
