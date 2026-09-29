import React, { useEffect, useRef } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ExpenseProvider, useExpenses } from "./context/ExpenseContext";
import { useLenis } from "./hooks/useLenis";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import ScanStudio from "./pages/ScanStudio";
import ExpenseLedger from "./pages/ExpenseLedger";
import SavingsAdvisor from "./pages/SavingsAdvisor";
import AuthPage from "./pages/AuthPage";

/* ─── Protected route wrapper ─────────────────────────────── */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useExpenses();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
}

/* ─── Page transition wrapper ─────────────────────────────── */
function PageWrapper({ children }) {
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    el.style.transition = "opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1)";
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }, [location.pathname]);

  return <div ref={ref}>{children}</div>;
}

/* ─── App inner content ───────────────────────────────────── */
function AppContent() {
  useLenis();

  const location    = useLocation();
  const { isAuthenticated } = useExpenses();
  const isAuthPage  = location.pathname === "/auth";
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 flex flex-col font-sans">
      {/* Navigation — hidden on auth page */}
      {!isAuthPage && <Navbar />}

      {/* Main content with page-transition */}
      <main className="flex-1 w-full relative">
        <PageWrapper>
          <Routes>
            {/* Auth */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/scan" element={
              <ProtectedRoute><ScanStudio /></ProtectedRoute>
            } />
            <Route path="/expenses" element={
              <ProtectedRoute><ExpenseLedger /></ProtectedRoute>
            } />
            <Route path="/advisor" element={
              <ProtectedRoute><SavingsAdvisor /></ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/auth"} replace />} />
          </Routes>
        </PageWrapper>
      </main>

      {/* Footer — hidden on auth page */}
      {!isAuthPage && (
        <footer className="border-t border-white/4 py-5 px-6 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-600">
            <p className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
              AuraLedger &copy; {currentYear} &mdash; OCR &amp; AI Financial Intelligence
            </p>
            <p className="font-mono tracking-wider text-slate-700">
              WebGL Three.js · Lenis · MERN Stack · ₹ INR
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

/* ─── Root App ────────────────────────────────────────────── */
export default function App() {
  return (
    <ExpenseProvider>
      <AppContent />
    </ExpenseProvider>
  );
}
