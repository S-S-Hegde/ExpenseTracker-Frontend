import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "../context/ExpenseContext";
import TiltCard from "../components/TiltCard";
import {
  Sparkles, TrendingDown, Repeat, IndianRupee, Scan, Zap,
  PieChart, ArrowRight, Activity, Award, PlusCircle,
  FileSpreadsheet, TrendingUp, Clock, Wallet, Brain,
  ChevronUp, ChevronDown, AlertCircle, BarChart3,
} from "lucide-react";

/* ─── Animated counter hook ─────────────────────────────── */
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

/* ─── Palette for categories ─────────────────────────────── */
const PALETTE = [
  "#10B981", "#6366F1", "#06B6D4", "#F59E0B",
  "#EC4899", "#8B5CF6", "#3B82F6", "#F43F5E",
];

/* ─── Mini sparkline SVG ─────────────────────────────────── */
function Sparkline({ data = [], color = "#10B981", height = 36 }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w   = 120;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${height - (v / max) * (height - 4) - 2}`
  ).join(" ");

  return (
    <svg width={w} height={height} className="opacity-70">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${pts} ${w},${height}`}
        fill={`url(#sg-${color})`}
      />
    </svg>
  );
}

/* ─── Donut SVG chart ────────────────────────────────────── */
function DonutChart({ data, total, formatCurrency }) {
  const [hovered, setHovered] = useState(null);
  if (!data.length) return (
    <div className="flex flex-col items-center justify-center h-48 text-slate-600">
      <PieChart className="w-10 h-10 mb-2 opacity-30" />
      <p className="text-xs">No data yet</p>
    </div>
  );

  let acc = 0;
  const R = 38, CX = 50, CY = 50;
  const circumference = 2 * Math.PI * R;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="14" />
          {data.map(({ cat, amount, pct, color }, i) => {
            const dash   = (pct / 100) * circumference;
            const offset = -acc / 100 * circumference;
            acc += pct;
            return (
              <circle key={cat} cx={CX} cy={CY} r={R} fill="none"
                stroke={color} strokeWidth={hovered === i ? 16 : 14}
                strokeDasharray={`${dash} ${circumference}`}
                strokeDashoffset={offset}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ filter: hovered === i ? `drop-shadow(0 0 8px ${color})` : "none" }}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            {hovered !== null ? data[hovered]?.cat : "Total"}
          </span>
          <span className="font-mono-num text-base font-extrabold text-white mt-0.5">
            {hovered !== null ? formatCurrency(data[hovered]?.amount) : formatCurrency(total)}
          </span>
          {hovered !== null && (
            <span className="text-[10px] font-bold mt-0.5" style={{ color: data[hovered]?.color }}>
              {data[hovered]?.pct?.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const {
    user, expenses, formatCurrency, totalSpend,
    categoryTotals, recurringExpenses, recurringTotal,
    annualRecurringDrain, healthScore, currentSessionName, isLoading,
  } = useExpenses();

  const categoryKeys = Object.keys(categoryTotals);
  const dailyBurn    = totalSpend > 0 ? totalSpend / 30 : 0;
  const recentExpenses = expenses.slice(0, 6);

  // Build donut data
  const donutData = categoryKeys.map((cat, i) => ({
    cat,
    amount: categoryTotals[cat],
    pct:    totalSpend > 0 ? (categoryTotals[cat] / totalSpend) * 100 : 0,
    color:  PALETTE[i % PALETTE.length],
  }));

  // Generate fake sparkline from expense amounts (last 7)
  const sparkData = expenses.slice(0, 7).map((e) => e.amount).reverse();

  // Health score color
  const hsColor = healthScore >= 75 ? "#10B981" : healthScore >= 55 ? "#F59E0B" : "#F43F5E";

  // Top spending category
  const topCat = donutData.sort((a, b) => b.amount - a.amount)[0];

  return (
    <div className="min-h-screen pb-24 pt-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-6">

      {/* ═══ HERO BANNER ═══════════════════════════════════ */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/8 animate-fade-up">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute top-0 right-0 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)" }} />
        <div className="pointer-events-none absolute bottom-0 left-1/4 w-64 h-64 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 cyber-grid opacity-30" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8">
          <div>
            {/* Session badge */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {currentSessionName}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
                ₹ INR Base Currency
              </span>
              {expenses.length > 0 && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {expenses.length} transactions
                </span>
              )}
            </div>

            {/* Welcome heading */}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {isLoading ? (
                <span className="opacity-50">Loading…</span>
              ) : (
                <>
                  {user?.name ? (
                    <>Welcome back, <span className="gradient-text-emerald">{user.name.split(" ")[0]}</span></>
                  ) : (
                    <>Your <span className="gradient-text-emerald">Financial Intelligence</span> Hub</>
                  )}
                </>
              )}
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-lg leading-relaxed">
              {expenses.length > 0
                ? `Live AI monitoring ${expenses.length} expense records from MongoDB — Indian Rupees (₹).`
                : "Zero expenses recorded. Scan a receipt or add a manual entry to activate live AI insights."}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 shrink-0">
            <button onClick={() => navigate("/scan")}
              className="group px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400
                text-zinc-950 text-sm font-bold flex items-center gap-2
                shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/45
                hover:-translate-y-0.5 transition-all duration-300">
              <Scan className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Scan Receipt
            </button>
            <button onClick={() => navigate("/expenses")}
              className="px-5 py-3 rounded-2xl glass-card text-sm font-bold text-slate-200
                hover:text-white flex items-center gap-2 border border-white/10
                hover:border-emerald-500/35 hover:-translate-y-0.5 transition-all duration-300">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Full Ledger
            </button>
          </div>
        </div>
      </div>

      {/* ═══ STAT CARDS BENTO ══════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up delay-100">
        {/* Total Spend */}
        <TiltCard maxTilt={10} className="glass-card stat-card stat-card-emerald p-5 rounded-2xl border border-white/8">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Total Spend</p>
              <p className="font-mono-num text-2xl font-extrabold text-white mt-1">
                {formatCurrency(totalSpend)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <IndianRupee className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <Activity className="w-3 h-3" />
              {formatCurrency(dailyBurn)}/day
            </div>
            <Sparkline data={sparkData} color="#10B981" />
          </div>
        </TiltCard>

        {/* Subscriptions */}
        <TiltCard maxTilt={10} className="glass-card stat-card stat-card-violet p-5 rounded-2xl border border-white/8">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Subscriptions</p>
              <p className="font-mono-num text-2xl font-extrabold text-indigo-300 mt-1">
                {formatCurrency(recurringTotal)}
                <span className="text-xs font-normal text-slate-500">/mo</span>
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Repeat className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            {recurringExpenses.length} active services
          </div>
        </TiltCard>

        {/* Annual Drain */}
        <TiltCard maxTilt={10} className="glass-card stat-card stat-card-amber p-5 rounded-2xl border border-white/8">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Annual Drain</p>
              <p className="font-mono-num text-2xl font-extrabold text-amber-400 mt-1">
                {formatCurrency(annualRecurringDrain)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <TrendingDown className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-500/70 font-medium">
            <AlertCircle className="w-3 h-3" />
            Projected from live data
          </div>
        </TiltCard>

        {/* Health Score */}
        <TiltCard maxTilt={10} className="glass-card stat-card stat-card-cyan p-5 rounded-2xl border border-white/8">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Health Index</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono-num text-2xl font-extrabold" style={{ color: hsColor }}>
                  {healthScore}
                </span>
                <span className="text-xs text-slate-500 font-semibold">/ 100</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <Award className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          {/* Health bar */}
          <div className="progress-track h-1.5 mt-1">
            <div className="progress-fill h-full rounded-full transition-all duration-1000"
              style={{ width: `${healthScore}%`, background: `linear-gradient(90deg, ${hsColor}, ${hsColor}cc)` }} />
          </div>
          <p className="text-[11px] mt-1.5 font-medium" style={{ color: hsColor }}>
            {healthScore >= 75 ? "✓ Excellent" : healthScore >= 55 ? "⚡ Moderate" : "⚠ Needs Attention"}
          </p>
        </TiltCard>
      </div>

      {/* ═══ EMPTY STATE ═══════════════════════════════════ */}
      {expenses.length === 0 && !isLoading ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/8 text-center space-y-5 animate-fade-up delay-200">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
              <PlusCircle className="w-9 h-9 text-emerald-400" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Ledger is Clean</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              No expense records yet. Scan a receipt in ₹ or add a manual transaction to activate your live AI financial dashboard.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button onClick={() => navigate("/scan")}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400
                text-zinc-950 text-sm font-bold flex items-center gap-2
                shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40
                hover:-translate-y-0.5 transition-all">
              <Scan className="w-4 h-4" />
              Scan Receipt (₹)
            </button>
            <button onClick={() => navigate("/expenses")}
              className="px-6 py-3 rounded-2xl glass-card text-sm font-bold text-slate-300
                hover:text-white border border-white/10 hover:border-emerald-500/30
                hover:-translate-y-0.5 transition-all">
              Manual Entry
            </button>
          </div>
        </div>
      ) : expenses.length > 0 ? (
        <>
          {/* ═══ ANALYTICS ROW ═══════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-up delay-200">
            {/* Donut Chart */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-emerald-400" />
                    Category Breakdown
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Proportional spend distribution</p>
                </div>
              </div>

              <DonutChart data={donutData} total={totalSpend} formatCurrency={formatCurrency} />

              {/* Legend */}
              <div className="mt-4 grid grid-cols-2 gap-1.5 border-t border-white/5 pt-4">
                {donutData.slice(0, 6).map(({ cat, amount, pct, color }) => (
                  <div key={cat} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/4 transition-colors">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-[11px] text-slate-400 truncate">{cat}</span>
                    </div>
                    <span className="font-mono-num text-[11px] text-slate-400 shrink-0 ml-1">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar chart + AI callout */}
            <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-white/8 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    Outflow by Category
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Live distribution in Indian Rupees (₹)</p>
                </div>
                <button onClick={() => navigate("/expenses")}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                  All entries <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3 flex-1">
                {donutData.slice(0, 6).map(({ cat, amount, pct, color }) => {
                  const maxPct = Math.max(...donutData.map((d) => d.pct), 1);
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                          {cat}
                        </span>
                        <span className="font-mono-num text-white">{formatCurrency(amount)}</span>
                      </div>
                      <div className="h-2 progress-track">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${(pct / maxPct) * 100}%`, backgroundColor: color,
                            boxShadow: `0 0 8px ${color}60` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI Advisory callout */}
              <div className="mt-5 p-4 rounded-2xl bg-indigo-500/8 border border-indigo-500/20 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-indigo-300">AI Savings Opportunity</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Recurring commitments total {formatCurrency(recurringTotal)}/mo.
                      {topCat && ` ${topCat.cat} is your largest spend at ${topCat.pct.toFixed(0)}%.`} View personalized cutback strategies.
                    </p>
                  </div>
                </div>
                <button onClick={() => navigate("/advisor")}
                  className="px-3 py-1.5 rounded-xl bg-indigo-500 text-white text-xs font-bold
                    hover:bg-indigo-400 transition-colors whitespace-nowrap shrink-0">
                  Analyse
                </button>
              </div>
            </div>
          </div>

          {/* ═══ RECENT TRANSACTIONS ══════════════════════════ */}
          {recentExpenses.length > 0 && (
            <div className="glass-panel p-6 rounded-3xl border border-white/8 animate-fade-up delay-300">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    Recent Transactions
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Live feed from MongoDB</p>
                </div>
                <button onClick={() => navigate("/expenses")}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                  View all ({expenses.length}) <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {recentExpenses.map((exp, idx) => {
                  const catColor = PALETTE[categoryKeys.indexOf(exp.category) % PALETTE.length] || "#10B981";
                  const initial  = (exp.merchant || "?").charAt(0).toUpperCase();
                  return (
                    <div key={exp._id || exp.id}
                      className="group flex items-center justify-between py-3 px-3 rounded-2xl
                        hover:bg-white/[0.03] transition-colors cursor-pointer animate-fade-up"
                      style={{ animationDelay: `${idx * 60}ms` }}>
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                          style={{ background: `${catColor}18`, border: `1px solid ${catColor}30`, color: catColor }}>
                          {initial}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                            {exp.merchant || "Unknown"}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {exp.date} · {exp.category} · {exp.paymentMethod || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-mono-num text-sm font-bold text-white">
                          {formatCurrency(exp.amount)}
                        </p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                          ${exp.isRecurring
                            ? "text-indigo-300 bg-indigo-500/10"
                            : "text-slate-500 bg-white/4"}`}>
                          {exp.isRecurring ? "↻ Recurring" : "One-time"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
