import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, ArrowUpRight, QrCode, History, Settings } from "lucide-react";
import { useWallet } from "../../contexts/WalletContext";
import { useAuth } from "../../contexts/AuthContext";

const TABS = [
  { to: "/dashboard", label: "Home", icon: Home, testid: "nav-home" },
  { to: "/send", label: "Send", icon: ArrowUpRight, testid: "nav-send" },
  { to: "/receive", label: "Receive", icon: QrCode, testid: "nav-receive" },
  { to: "/history", label: "Activity", icon: History, testid: "nav-history" },
  { to: "/settings", label: "Settings", icon: Settings, testid: "nav-settings" },
];

export default function BottomNav() {
  const { isConnected } = useWallet();
  const { user } = useAuth();
  const loc = useLocation();
  if (!isConnected) return null;
  if (loc.pathname === "/connect") return null;
  if (loc.pathname === "/auth") return null;
  if (loc.pathname.startsWith("/developer-messages")) return null;
  if (loc.pathname.startsWith("/testing-rewards")) return null;
  if (loc.pathname.startsWith("/feedback")) return null;
  if (!user) return null;
  return (
    <nav
      className="glass-bottom fixed bottom-0 inset-x-0 z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      data-testid="bottom-nav"
    >
      <div className="page-shell px-2 py-1" style={{ paddingBottom: 0 }}>
        <ul className="flex items-stretch justify-around">
          {TABS.map(({ to, label, icon: Icon, testid }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                data-testid={testid}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] rounded-xl transition-colors ${
                    isActive
                      ? "text-phos"
                      : "text-ink-tertiary hover:text-ink-secondary"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.25 : 1.75}
                      fill={isActive ? "currentColor" : "none"}
                      style={isActive ? { fillOpacity: 0.12 } : undefined}
                    />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
