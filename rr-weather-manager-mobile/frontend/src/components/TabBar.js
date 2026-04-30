import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Activity, Settings as SettingsIcon } from 'lucide-react';
import { clsx } from '../lib/format';

const tabs = [
  { to: '/', label: 'Home', icon: Home, testId: 'tab-home' },
  { to: '/hazards', label: 'Hazards', icon: Activity, testId: 'tab-hazards' },
  { to: '/settings', label: 'Settings', icon: SettingsIcon, testId: 'tab-settings' },
];

export default function TabBar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-app/90 backdrop-blur-xl border-t border-subtle"
      style={{
        height: 'calc(4rem + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      data-testid="bottom-tab-bar"
    >
      <ul className="grid grid-cols-3 h-full">
        {tabs.map((t) => (
          <li key={t.to} className="flex">
            <NavLink
              to={t.to}
              end={t.to === '/'}
              data-testid={t.testId}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center w-full gap-1 transition-colors active:scale-95',
                  isActive ? 'text-accent' : 'text-accent/60 hover:text-accent'
                )
              }
            >
              <t.icon strokeWidth={1.5} className="w-6 h-6" />
              <span className="text-[10px] uppercase tracking-widest font-mono">
                {t.label}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
