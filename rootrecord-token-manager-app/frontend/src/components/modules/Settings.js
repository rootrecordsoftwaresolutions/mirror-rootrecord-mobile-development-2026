import React from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../ui/PageHeader";
import NetworkPill from "../ui/NetworkPill";
import AddressCopy from "../ui/AddressCopy";
import { useWallet } from "../../contexts/WalletContext";
import { LogOut, BookUser, Network, ChevronRight, ShieldCheck } from "lucide-react";

const NETS = [
  { id: "mainnet-beta", label: "Mainnet", hint: "Live SOL — be careful" },
  { id: "devnet", label: "Devnet", hint: "Free SOL via faucet · safe to test" },
  { id: "testnet", label: "Testnet", hint: "Validator performance cluster" },
];

export default function Settings() {
  const nav = useNavigate();
  const { pubkey, mode, network, changeNetwork, disconnect } = useWallet();

  return (
    <div className="page-shell" data-testid="settings-screen">
      <PageHeader title="Settings" subtitle="Preferences & network" right={<NetworkPill network={network} />} />

      <div className="px-4 pt-4 space-y-4">
        <div className="card p-4" data-testid="settings-account">
          <div className="label mb-2">Connected wallet</div>
          <AddressCopy address={pubkey} short={false} className="mono text-[12px]" testid="settings-address" />
          <div className="mt-2 text-xs text-ink-tertiary">
            Mode: <span className="mono uppercase tracking-widest">{mode || "none"}</span>
          </div>
        </div>

        <div className="card overflow-hidden" data-testid="settings-network">
          <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
            <Network size={16} className="text-ink-secondary" />
            <span className="label mb-0">Network</span>
          </div>
          <div className="divide-y divide-white/5">
            {NETS.map((n) => (
              <button
                key={n.id}
                onClick={() => changeNetwork(n.id)}
                className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                  network === n.id ? "bg-phos/5" : "hover:bg-white/5"
                }`}
                data-testid={`settings-network-${n.id}`}
              >
                <div>
                  <div className="font-semibold text-ink-primary">{n.label}</div>
                  <div className="text-[11px] text-ink-tertiary mt-0.5">{n.hint}</div>
                </div>
                <span
                  className={`w-4 h-4 rounded-full border ${
                    network === n.id ? "bg-phos border-phos" : "border-white/20"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => nav("/contacts")}
          className="card w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          data-testid="settings-open-contacts"
        >
          <div className="flex items-center gap-3">
            <BookUser size={18} className="text-phos" />
            <div className="text-left">
              <div className="font-semibold text-ink-primary">Address book</div>
              <div className="text-[11px] text-ink-tertiary mt-0.5">Save and reuse recipient addresses.</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-ink-tertiary" />
        </button>

        <div className="card p-4 flex items-start gap-2 text-xs text-ink-secondary" data-testid="settings-security-note">
          <ShieldCheck size={16} className="mt-0.5 text-phos" />
          <span>
            RootRecord never stores or transmits seed phrases or private keys. Signing always happens in your wallet app.
          </span>
        </div>

        <button
          onClick={async () => { await disconnect(); nav("/connect", { replace: true }); }}
          className="btn btn-danger w-full"
          data-testid="settings-disconnect-btn"
        >
          <LogOut size={16} /> Disconnect
        </button>

        <div className="text-center text-[11px] text-ink-tertiary pt-2">
          RootRecord Token Manager · v0.1.0 · mobile
        </div>
      </div>
    </div>
  );
}
