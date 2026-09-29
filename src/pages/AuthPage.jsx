import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "../context/ExpenseContext";
import ThreeAuthCanvas from "../components/ThreeAuthCanvas";
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Zap,
  Fingerprint,
  Globe,
  BadgeIndianRupee,
  ChevronRight,
} from "lucide-react";

const CURRENCY_OPTIONS = [
  { code: "INR", label: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "USD", label: "US Dollar",    symbol: "$", flag: "🇺🇸" },
  { code: "EUR", label: "Euro",         symbol: "€", flag: "🇪🇺" },
  { code: "GBP", label: "Pound",        symbol: "£", flag: "🇬🇧" },
  { code: "JPY", label: "Yen",          symbol: "¥", flag: "🇯🇵" },
];

export default function AuthPage() {
  const navigate  = useNavigate();
  const { login, register, demoLogin } = useExpenses();

  const [mode,        setMode]        = useState("login");
  const [showPass,    setShowPass]    = useState(false);
  const [formData,    setFormData]    = useState({ name: "", email: "", password: "", currency: "INR" });
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState("");
  const [animating,   setAnimating]   = useState(false);
  const cardRef = useRef(null);

  // Panel flip animation when switching mode
  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setAnimating(true);
    setError("");
    setTimeout(() => {
      setMode(newMode);
      setAnimating(false);
    }, 220);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      if (mode === "login") {
        await login({ email: formData.email, password: formData.password });
      } else {
        if (!formData.name.trim()) { setError("Full name is required."); setIsLoading(false); return; }
        await register({ name: formData.name, email: formData.email, password: formData.password, currency: formData.currency });
      }
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = () => {
    demoLogin();
    navigate("/");
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#050608] cyber-grid">
      {/* ── 3D WebGL Background ── */}
      <ThreeAuthCanvas mode={mode} />

      {/* ── Deep ambient orbs ── */}
      <div className="pointer-events-none absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 60%)" }} />

      {/* ── TOP BRAND BAR ── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 sm:px-10 pt-6 pb-4">
        <div className="flex items-center gap-3">
          {/* Logo gem */}
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-indigo-500 blur-md opacity-60 animate-glow-pulse" />
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-400 to-indigo-500 p-[1.5px]">
              <div className="w-full h-full bg-[#080A14] rounded-[14px] flex items-center justify-center">
                <BadgeIndianRupee className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>
          <div>
            <div className="text-xl font-display font-extrabold tracking-tight gradient-text-white leading-none">
              AuraLedger
            </div>
            <div className="text-[10px] font-mono text-emerald-500/80 tracking-widest uppercase mt-0.5">
              AI ₹ Finance Suite
            </div>
          </div>
        </div>

        {/* Demo Access CTA */}
        <button
          onClick={handleDemo}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold
            bg-white/5 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400
            border border-white/10 hover:border-emerald-500/35
            transition-all duration-300 backdrop-blur-md"
        >
          <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
          <span>Quick Demo</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* ── MAIN AUTH CARD ── */}
      <div className="relative z-10 w-full max-w-[420px] px-4 sm:px-0 my-20">
        <div
          ref={cardRef}
          className={`glass-panel rounded-3xl p-7 border border-white/10 shadow-2xl
            transition-all duration-300 ${animating ? "opacity-0 scale-95 blur-sm" : "opacity-100 scale-100 blur-0"}`}
          style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06) inset" }}
        >
          {/* ── Mode Toggle ── */}
          <div className="flex p-1 mb-6 rounded-2xl bg-black/40 border border-white/5 gap-1">
            {[{ key: "login", label: "Sign In", icon: Lock }, { key: "register", label: "Create Account", icon: User }].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => switchMode(key)}
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300
                  ${mode === key
                    ? key === "login"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 shadow-lg shadow-emerald-500/25"
                      : "bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-500 hover:text-slate-300"
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* ── Heading ── */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">
              {mode === "login" ? "Welcome back" : "Create your vault"}
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {mode === "login"
                ? "Access your AI-powered ₹ expense intelligence and OCR ledger."
                : "Track, analyze, and optimize every Rupee with AI precision."}
            </p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name (register only) */}
            {mode === "register" && (
              <div className="animate-fade-up">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 tracking-wide uppercase">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm font-medium"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 tracking-wide uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm font-medium"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">
                  Password
                </label>
                {mode === "login" && (
                  <button type="button" className="text-[11px] text-emerald-500 hover:text-emerald-400 transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-11 py-3 rounded-xl glass-input text-sm font-medium"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Currency (register only) */}
            {mode === "register" && (
              <div className="animate-fade-up">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 tracking-wide uppercase">
                  Primary Currency
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm font-medium appearance-none"
                  >
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c.code} value={c.code} className="bg-[#0A0C18] text-white">
                        {c.flag} {c.code} — {c.label} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-medium animate-fade-up">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-1 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5
                transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed
                ${mode === "login"
                  ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/45 hover:-translate-y-0.5"
                  : "bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/45 hover:-translate-y-0.5"
                }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  <span>Authenticating…</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  <span>{mode === "login" ? "Unlock My Ledger" : "Initialize Account"}</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </>
              )}
            </button>
          </form>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[11px] text-slate-600 font-medium">OR</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* ── Demo Button ── */}
          <button
            onClick={handleDemo}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white
              bg-white/3 hover:bg-white/8 border border-white/7 hover:border-white/15
              flex items-center justify-center gap-2 transition-all duration-300"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
            Explore with Demo Mode (no account needed)
          </button>

          {/* ── Footer badges ── */}
          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/60" />
              <span>End-to-end encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500/60" />
              <span>WebGL 3D Engine</span>
            </div>
          </div>
        </div>

        {/* ── Floating hint ── */}
        <p className="mt-6 text-center text-[11px] text-slate-600 font-medium tracking-wide animate-fade-up delay-500">
          Move cursor to rotate the 3D card · Powered by Three.js WebGL
        </p>
      </div>
    </div>
  );
}
