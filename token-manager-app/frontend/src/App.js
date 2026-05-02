import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { WalletProvider, useWallet } from "./contexts/WalletContext";
import BottomNav from "./components/ui/BottomNav";
import Toast, { ToastProvider } from "./components/ui/Toast";
import Connect from "./components/modules/Connect";
import Dashboard from "./components/modules/Dashboard";
import Send from "./components/modules/Send";
import Receive from "./components/modules/Receive";
import History from "./components/modules/History";
import Settings from "./components/modules/Settings";
import AddressBook from "./components/modules/AddressBook";

function Gate({ children }) {
  const { isConnected } = useWallet();
  const loc = useLocation();
  if (!isConnected) {
    return <Navigate to="/connect" replace state={{ from: loc.pathname }} />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/connect" element={<Connect />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Gate><Dashboard /></Gate>} />
      <Route path="/send" element={<Gate><Send /></Gate>} />
      <Route path="/receive" element={<Gate><Receive /></Gate>} />
      <Route path="/history" element={<Gate><History /></Gate>} />
      <Route path="/settings" element={<Gate><Settings /></Gate>} />
      <Route path="/contacts" element={<Gate><AddressBook /></Gate>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="min-h-[100dvh]" data-testid="app-root">
            <AppRoutes />
            <BottomNav />
            <Toast />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </WalletProvider>
  );
}
