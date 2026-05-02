import React, { useState } from "react";
import { ScreenHeader, PageContainer, Section, Field, Toast, useToast } from "../ui/Shell";
import { api, formatApiError } from "../../lib/api";
import {
  KeyRound,
  Smartphone,
  AlertTriangle,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function Security() {
  const { logout } = useAuth();
  const { toast, show, clear } = useToast();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitPassword(e) {
    e.preventDefault();
    if (newPw.length < 6) {
      show("New password must be at least 6 characters.", "error");
      return;
    }
    setBusy(true);
    try {
      // Endpoint will be added server-side; handle 404 gracefully until then.
      await api.post("/me/password", { current_password: currentPw, new_password: newPw });
      setCurrentPw("");
      setNewPw("");
      show("Password updated.", "success");
    } catch (err) {
      if (err?.response?.status === 404) {
        show(
          "Password change coming soon — endpoint not yet available server-side.",
          "error"
        );
      } else {
        show(formatApiError(err), "error");
      }
    } finally {
      setBusy(false);
    }
  }

  async function signOutAllDevices() {
    setBusy(true);
    try {
      await api.post("/auth/logout", { all_devices: true });
      show("Signed out of all devices.", "success");
      setTimeout(() => {
        logout();
      }, 600);
    } catch (err) {
      if (err?.response?.status === 404) {
        show("Session revocation endpoint not yet available — coming soon.", "error");
      } else {
        show(formatApiError(err), "error");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <ScreenHeader
        title="Security"
        subtitle="Password, sessions, and device trust"
        back={false}
      />
      <PageContainer>
        <Section title="Change password">
          <form onSubmit={submitPassword} className="p-4">
            <Field label="Current password">
              <input
                data-testid="security-current-pw"
                className="input"
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                autoComplete="current-password"
              />
            </Field>
            <Field
              label="New password"
              hint="At least 6 characters. Use a unique password you don't reuse elsewhere."
            >
              <input
                data-testid="security-new-pw"
                className="input"
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                autoComplete="new-password"
              />
            </Field>
            <button
              data-testid="security-update-pw-btn"
              type="submit"
              disabled={busy}
              className="btn btn-primary w-full"
            >
              <KeyRound size={16} /> Update password
            </button>
            <p className="text-[11px] text-ink-tertiary mt-3">
              This calls <span className="font-mono">POST /api/me/password</span>;
              until that route ships on the primary Worker you'll see a
              "coming soon" toast.
            </p>
          </form>
        </Section>

        <Section title="Active sessions">
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bg-elevated text-ink-secondary flex items-center justify-center">
              <Smartphone size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink-primary">
                This device
              </p>
              <p className="text-xs text-ink-tertiary">
                Tokens on other devices will be listed here once
                <span className="font-mono"> /api/me/sessions</span> is live.
              </p>
            </div>
            <span
              className="chip"
              data-testid="session-current-chip"
              data-active="true"
            >
              Current
            </span>
          </div>
          <div className="row">
            <div className="flex items-center gap-2 text-ink-secondary text-sm">
              <RefreshCw size={14} /> Refresh
            </div>
            <button
              data-testid="session-refresh-btn"
              onClick={() => show("Will reload once the sessions endpoint ships.", "info")}
              className="btn btn-ghost text-sm min-h-[40px]"
            >
              Check
            </button>
          </div>
        </Section>

        <Section title="Dangerous">
          <button
            data-testid="security-signout-all-btn"
            onClick={signOutAllDevices}
            disabled={busy}
            className="row w-full text-left hover:bg-bg-elevated"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className="text-[#FB7185]" />
              <span className="text-sm font-semibold text-[#FB7185]">
                Sign out of all devices
              </span>
            </div>
            <AlertTriangle size={16} className="text-[#FB7185]" />
          </button>
        </Section>
      </PageContainer>
      <Toast message={toast.message} kind={toast.kind} onDone={clear} />
    </>
  );
}
