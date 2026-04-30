import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  MapPin,
  Plus,
  Trash2,
  User,
  Settings as SettingsIcon,
  Mail,
  Globe,
  Bell,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Send,
  Gift,
} from 'lucide-react';
import { api, getCachedLocations, isBackendConfigured, session } from '../lib/api';
import { formatRewardBalance, parseRewardBalance } from '../lib/rewardsFormat';
import { getUnits, setUnits } from '../lib/format';

/** Public RootRecord links (same as rootrecord.info / credentials). */
const CONTACT = {
  website: 'https://rootrecord.info/',
  contact: 'https://rootrecord.info/contact.html',
  discord: 'https://discord.gg/jBgRdgmsjB',
  telegram: 'https://t.me/rootrecordsupport',
};

const BETA_REWARDS_INFO_URL =
  String(process.env.REACT_APP_BETA_REWARDS_INFO_URL || 'https://rootrecord.info/beta-tester-rewards.html').trim() ||
  'https://rootrecord.info/beta-tester-rewards.html';

function Section({ title, children, testId }) {
  return (
    <section className="mb-6" data-testid={testId}>
      <h2 className="text-[10px] font-mono uppercase tracking-widest text-accent/70 mb-2 px-4">{title}</h2>
      <div className="bg-container border border-subtle">{children}</div>
    </section>
  );
}

function Row({ icon: Icon, label, value, onClick, testId, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`flex items-center gap-3 w-full p-4 border-b border-subtle last:border-0 hover:bg-containerHover active:scale-[.99] text-left ${danger ? 'text-sev-severe' : 'text-white'}`}
    >
      {Icon && <Icon strokeWidth={1.5} className="w-4 h-4 shrink-0 opacity-80" />}
      <div className="flex-1 min-w-0">
        <div className="text-sm">{label}</div>
        {value && <div className="text-[10px] font-mono text-accent/70 mt-0.5 truncate">{value}</div>}
      </div>
      {!danger && onClick && <ChevronRight strokeWidth={1.5} className="w-4 h-4 text-accent/70" />}
    </button>
  );
}

function ExternalLinkRow({ icon: Icon, label, hint, href, testId }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={testId}
      className="flex items-center gap-3 w-full p-4 border-b border-subtle last:border-0 hover:bg-containerHover active:scale-[.99] text-left text-white no-underline"
    >
      {Icon && <Icon strokeWidth={1.5} className="w-4 h-4 shrink-0 opacity-80 text-accent" />}
      <div className="flex-1 min-w-0">
        <div className="text-sm">{label}</div>
        {hint && <div className="text-[10px] font-mono text-accent/70 mt-0.5 truncate">{hint}</div>}
      </div>
      <ExternalLink strokeWidth={1.5} className="w-4 h-4 text-accent/70 shrink-0" aria-hidden />
    </a>
  );
}

export default function Settings({ onSignedOut }) {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [units, setUnitsState] = useState(getUnits());
  const [locErr, setLocErr] = useState('');
  const [noaaAlertsEnabled, setNoaaAlertsEnabled] = useState(true);
  const [noaaBusy, setNoaaBusy] = useState(false);
  const [rewardBalance, setRewardBalance] = useState(null);
  const [rewardErr, setRewardErr] = useState('');

  const load = async () => {
    try {
      const { data } = await api.listLocations();
      setLocations(data || []);
      setLocErr('');
    } catch (_e) {
      const cached = getCachedLocations();
      setLocations(cached);
      if (cached.length) setLocErr('Could not sync locations. Showing saved device copy.');
    }
  };
  useEffect(() => { load(); }, []);

  const loadRewardBalance = useCallback(async () => {
    if (!session.isAuthed() || !isBackendConfigured()) {
      setRewardErr('');
      setRewardBalance(null);
      return;
    }
    setRewardErr('');
    const run = async () => {
      const { data } = await api.getEarnSummary();
      setRewardBalance(parseRewardBalance(data?.balance));
      setRewardErr('');
    };
    try {
      await run();
    } catch {
      try {
        await new Promise((r) => setTimeout(r, 600));
        await run();
      } catch (e2) {
        const detail = e2?.response?.data?.detail || e2?.message || '';
        const msg = String(e2?.message || '');
        const isNetwork =
          !e2?.response && /network|failed to fetch|load failed|aborted|timeout|ERR_/i.test(msg);
        setRewardBalance(null);
        setRewardErr(
          isNetwork
            ? 'No connection. Check your network and tap Try again below.'
            : (typeof detail === 'string' && detail && detail.length < 200
                ? detail
                : 'Could not load rewards. Tap Try again or check back later.')
        );
      }
    }
  }, []);

  useEffect(() => {
    loadRewardBalance();
    const onVis = () => {
      if (document.visibilityState === 'visible' && session.isAuthed()) loadRewardBalance();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [loadRewardBalance]);

  // No tier gates in mobile UI.

  useEffect(() => {
    if (!session.isAuthed()) return;
    (async () => {
      try {
        const { data } = await api.getPrefs();
        if (typeof data?.noaa_alerts_enabled === 'boolean') setNoaaAlertsEnabled(data.noaa_alerts_enabled);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const onSignOut = () => {
    session.clearSession();
    onSignedOut?.();
    navigate('/');
  };

  const removeLoc = async (id) => {
    if (!window.confirm('Delete this saved location?')) return;
    try { await api.deleteLocation(id); load(); } catch (e) { alert(e?.response?.data?.detail || e.message); }
  };

  const toggleUnits = () => {
    const next = units === 'imperial' ? 'metric' : 'imperial';
    setUnits(next);
    setUnitsState(next);
  };

  const toggleNoaaAlerts = async () => {
    const next = !noaaAlertsEnabled;
    setNoaaAlertsEnabled(next);
    if (!session.isAuthed()) return;
    setNoaaBusy(true);
    try {
      await api.setPrefs({ noaa_alerts_enabled: next });
    } catch {
      // revert on failure
      setNoaaAlertsEnabled(!next);
    } finally {
      setNoaaBusy(false);
    }
  };

  const isAuthed = session.isAuthed();
  const email = session.getEmail();

  return (
    <div className="animate-fadein pb-8" data-testid="settings-page">
      <header
        className="flex items-center justify-between p-4"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-xs text-accent/70 font-mono uppercase tracking-widest">Account · Locations · Preferences · Support</p>
        </div>
        <SettingsIcon strokeWidth={1.5} className="w-5 h-5 text-accent/70" />
      </header>

      <Section title="Account" testId="settings-account-section">
        {isAuthed ? (
          <>
            <Row icon={Mail} label="Signed in as" value={email || '—'} testId="settings-account-email" />
            <Row icon={Globe} label="App features" value="All features enabled" testId="settings-tier" />
            <Row icon={LogOut} label="Sign out of this device" onClick={onSignOut} testId="settings-signout" danger />
          </>
        ) : (
          <>
            <Row icon={User} label="Not signed in" value="All features enabled" testId="settings-guest" />
            <Row icon={LogOut} label="Sign in" onClick={() => navigate('/auth')} testId="settings-signin" />
          </>
        )}
      </Section>

      {isAuthed && (
        <Section title="Beta tester rewards" testId="settings-rewards-section">
          {rewardErr && (
            <div
              className="text-xs bg-sev-severe/10 border-b border-sev-severe/40 text-sev-moderate p-3 flex flex-col gap-2"
              role="alert"
              data-testid="settings-rewards-error"
            >
              <span>{rewardErr}</span>
              <button
                type="button"
                onClick={() => loadRewardBalance()}
                className="self-start text-left text-sm font-mono text-accent underline underline-offset-2"
                data-testid="settings-rewards-retry"
              >
                Try again
              </button>
            </div>
          )}
          <a
            href={BETA_REWARDS_INFO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full p-4 text-left text-white no-underline hover:bg-containerHover active:scale-[.99]"
            data-testid="settings-rewards-link"
          >
            <Gift strokeWidth={1.5} className="w-4 h-4 shrink-0 text-accent" aria-hidden />
            <div className="flex-1 min-w-0">
              <div className="text-sm" data-testid="settings-rewards-balance-line">
                Beta Tester Rewards : {formatRewardBalance(rewardBalance)}
              </div>
            </div>
            <ExternalLink strokeWidth={1.5} className="w-4 h-4 text-accent/70 shrink-0" aria-hidden />
          </a>
        </Section>
      )}

      <Section title="Saved locations" testId="settings-locations-section">
        {locErr && (
          <div className="text-xs bg-sev-severe/10 border-b border-sev-severe/40 text-sev-severe p-3" data-testid="settings-locations-error">
            {locErr}
          </div>
        )}
        {locations.map((l) => (
          <div key={l.id} className="flex items-center gap-3 p-4 border-b border-subtle last:border-0">
            <MapPin strokeWidth={1.5} className="w-4 h-4 text-accent" />
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate">{l.name}</div>
              <div className="text-[10px] font-mono text-accent/70">{l.latitude.toFixed(4)}, {l.longitude.toFixed(4)}</div>
            </div>
            <button
              onClick={() => removeLoc(l.id)}
              data-testid={`settings-location-delete-${l.id}`}
              className="p-2 text-accent/70 hover:text-sev-severe active:scale-90"
              aria-label="Delete location"
            >
              <Trash2 strokeWidth={1.5} className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() => navigate('/locations/new')}
          data-testid="settings-add-location"
          className="flex items-center gap-3 w-full p-4 border-t border-subtle hover:bg-containerHover active:scale-[.99] text-accent"
        >
          <Plus strokeWidth={1.5} className="w-4 h-4" /> Add location
        </button>
      </Section>

      <Section title="Preferences" testId="settings-prefs-section">
        <Row
          label="Units"
          value={units === 'imperial' ? 'Imperial — °F · mph · mi' : 'Metric — °C · km/h · km'}
          onClick={toggleUnits}
          testId="settings-units-toggle"
        />
      </Section>

      <Section title="Alerts" testId="settings-pro-section">
        <Row
          icon={Bell}
          label="Weather alert notifications (NOAA)"
          value={noaaAlertsEnabled ? 'On' : 'Off'}
          onClick={noaaBusy ? undefined : toggleNoaaAlerts}
          testId="settings-noaa-alerts-toggle"
        />
        <div className="p-4 pt-0 text-xs text-accent/70 leading-relaxed">
          Receive push notifications for active NOAA alerts near your saved locations. US only.
        </div>
      </Section>

      <Section title="Contact & support" testId="settings-contact-section">
        <ExternalLinkRow
          icon={Globe}
          label="Website"
          hint="rootrecord.info — products, pricing, FAQ"
          href={CONTACT.website}
          testId="settings-contact-website"
        />
        <ExternalLinkRow
          icon={Mail}
          label="Contact"
          hint="Message the team (contact form)"
          href={CONTACT.contact}
          testId="settings-contact-form"
        />
        <ExternalLinkRow
          icon={MessageCircle}
          label="Discord"
          hint="Community & support server"
          href={CONTACT.discord}
          testId="settings-contact-discord"
        />
        <ExternalLinkRow
          icon={Send}
          label="Telegram"
          hint="Public support — @rootrecordsupport"
          href={CONTACT.telegram}
          testId="settings-contact-telegram"
        />
      </Section>

      <p className="text-center text-[10px] font-mono text-accent/60 mt-8">Root Record Weather Manager Mobile · v1.0.8</p>
    </div>
  );
}
