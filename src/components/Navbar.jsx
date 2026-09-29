import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useExpenses } from "../context/ExpenseContext";
import SessionHistoryModal from "./SessionHistoryModal";
import {
  BadgeIndianRupee, LayoutDashboard, Scan, FileSpreadsheet,
  TrendingDown, History, LogOut, ChevronDown,
  Wallet, Brain, Zap, Menu, X,
} from "lucide-react";

const navLinks = [
  { name: "Dashboard",       path: "/",        icon: LayoutDashboard, label: "Home" },
  { name: "Scan Studio",     path: "/scan",    icon: Scan,            label: "OCR" },
  { name: "Ledger",          path: "/expenses",icon: FileSpreadsheet, label: "Records" },
  { name: "AI Advisor",      path: "/advisor", icon: Brain,           label: "Insights" },
];

const CURRENCIES = [
  { code: "INR", symbol: "₹", flag: "🇮🇳" },
  { code: "USD", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", symbol: "¥", flag: "🇯🇵" },
];

export default function Navbar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, isAuthenticated, logout, currencyCode, setCurrencyCode, totalSpend, formatCurrency } = useExpenses();

  const [historyOpen,    setHistoryOpen]    = useState(false);
  const [currencyOpen,   setCurrencyOpen]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled,       setScrolled]       = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setCurrencyOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const userInitials = user?.avatar || user?.name?.substring(0, 2).toUpperCase() || "U";
  const currentCurr  = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300
          ${scrolled
            ? "bg-[#05060A]/90 backdrop-blur-2xl border-b border-white/8 shadow-2xl shadow-black/40"
            : "bg-[#05060A]/70 backdrop-blur-xl border-b border-white/5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between gap-4">

          {/* ── LOGO ── */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-xl bg-emerald-500/40 blur-md group-hover:blur-lg transition-all animate-glow-pulse" />
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-400 to-indigo-500 p-[1.5px]">
                <div className="w-full h-full bg-[#07090F] rounded-[10px] flex items-center justify-center">
                  <BadgeIndianRupee className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-[15px] font-display font-extrabold tracking-tight gradient-text-white">
                AuraLedger
              </span>
              <div className="text-[9px] font-mono text-emerald-500/60 tracking-[0.15em] uppercase leading-none">
                AI Finance Suite
              </div>
            </div>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/6">
            {navLinks.map(({ name, path, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link key={path} to={path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200
                    ${isActive
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20"
                      : "text-slate-400 hover:text-white hover:bg-white/6"
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {name}
                  {isActive && <span className="nav-active-dot ml-0.5" />}
                </Link>
              );
            })}
          </nav>

          {/* ── RIGHT CONTROLS ── */}
          <div className="flex items-center gap-2">

            {/* Currency toggle */}
            <div className="relative">
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-card text-xs font-mono font-bold text-emerald-400 hover:border-emerald-500/35 transition-all"
                title="Change display currency"
              >
                <span>{currentCurr.flag}</span>
                <span>{currencyCode}</span>
                <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${currencyOpen ? "rotate-180" : ""}`} />
              </button>

              {currencyOpen && (
                <div className="absolute right-0 mt-2 w-40 glass-panel rounded-2xl p-1.5 border border-white/10 shadow-2xl z-50 animate-fade-up">
                  {CURRENCIES.map((c) => (
                    <button key={c.code}
                      onClick={() => { setCurrencyCode(c.code); setCurrencyOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2
                        ${currencyCode === c.code
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "text-slate-300 hover:bg-white/5"
                        }`}
                    >
                      <span>{c.flag}</span>
                      <span>{c.code}</span>
                      <span className="text-slate-500 ml-auto">{c.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Session History */}
            <button
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-card text-xs font-semibold text-slate-400 hover:text-white hover:border-indigo-500/35 transition-all"
              title="Session history"
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Sessions</span>
            </button>

            {/* Auth section */}
            <div className="pl-1.5 border-l border-white/8">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {/* Avatar */}
                  <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-500 p-[1.5px] cursor-default"
                    title={user?.name || "User"}>
                    <div className="w-full h-full bg-[#0A0C18] rounded-[10px] flex items-center justify-center text-[11px] font-extrabold text-white">
                      {userInitials}
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 notif-dot" />
                  </div>
                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl glass-card text-slate-500 hover:text-rose-400 hover:border-rose-500/25 transition-all"
                    title="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/auth")}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400
                    text-zinc-950 text-xs font-bold flex items-center gap-1.5
                    shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40
                    hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/6 bg-[#050608]/95 backdrop-blur-2xl px-4 py-3 space-y-1 animate-fade-down">
            {navLinks.map(({ name, path, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link key={path} to={path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all
                    ${isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-slate-400 hover:text-white hover:bg-white/4"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {name}
                </Link>
              );
            })}

            {isAuthenticated && (
              <div className="border-t border-white/5 pt-3 mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-500 p-[1.5px]">
                    <div className="w-full h-full bg-[#0A0C18] rounded-[10px] flex items-center justify-center text-[11px] font-extrabold text-white">
                      {userInitials}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{user?.name || "User"}</p>
                    <p className="text-[11px] text-slate-500">{user?.email || ""}</p>
                  </div>
                </div>
                <button onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/8 border border-rose-500/20 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <SessionHistoryModal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}