import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "../context/ExpenseContext";
import TiltCard from "../components/TiltCard";
import {
  TrendingDown,
  Sparkles,
  AlertTriangle,
  PieChart,
  Repeat,
  IndianRupee,
  ShieldAlert,
  Sliders,
  Award,
  Zap,
  PlusCircle,
  Scan,
} from "lucide-react";

export default function SavingsAdvisor() {
  const navigate = useNavigate();
  const {
    expenses,
    formatCurrency,
    totalSpend,
    recurringExpenses,
    recurringTotal,
    annualRecurringDrain,
    needsSpend,
    wantsSpend,
    healthScore,
  } = useExpenses();

  const [diningCut, setDiningCut] = useState(25);
  const [subCut, setSubCut] = useState(30);
  const [shoppingCut, setShoppingCut] = useState(20);

  const diningTotal = expenses
    .filter((e) => e.category === "Dining")
    .reduce((sum, e) => sum + e.amount, 0);

  const shoppingTotal = expenses
    .filter((e) => e.category === "Shopping")
    .reduce((sum, e) => sum + e.amount, 0);

  // Dynamic simulated monthly savings in INR (₹)
  const monthlyDiningSavings = (diningTotal * diningCut) / 100;
  const monthlySubSavings = (recurringTotal * subCut) / 100;
  const monthlyShoppingSavings = (shoppingTotal * shoppingCut) / 100;

  const totalMonthlySavings =
    monthlyDiningSavings + monthlySubSavings + monthlyShoppingSavings;
  const total1YrSavings = totalMonthlySavings * 12;

  // Compound 7% Annual Return formula: FV = P * (((1 + r/n)^(nt) - 1) / (r/n))
  const calculateCompound = (monthlyP, years, r = 0.07) => {
    const n = 12;
    const ratePerMonth = r / n;
    const totalMonths = years * 12;
    if (monthlyP <= 0) return 0;
    return (
      monthlyP * ((Math.pow(1 + ratePerMonth, totalMonths) - 1) / ratePerMonth)
    );
  };

  const compound3Yr = calculateCompound(totalMonthlySavings, 3);
  const compound5Yr = calculateCompound(totalMonthlySavings, 5);

  const needsPct = totalSpend > 0 ? Math.round((needsSpend / totalSpend) * 100) : 0;
  const wantsPct = totalSpend > 0 ? Math.round((wantsSpend / totalSpend) * 100) : 0;

  return (
    <div className="min-h-screen pb-20 pt-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Autonomous Financial Intelligence (INR ₹)
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Expense Reduction & Savings Advisor
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Algorithmic audit of your actual MongoDB transactions, recurring subscription leaks, and personalized cutback strategies in Indian Rupees (₹).
          </p>
        </div>

        {/* FINANCIAL HEALTH BADGE */}
        <TiltCard
          maxTilt={10}
          className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-white/10"
        >
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-obsidian-900"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={
                  healthScore >= 75
                    ? "text-emerald-400"
                    : healthScore >= 55
                    ? "text-amber-400"
                    : "text-rose-400"
                }
                strokeDasharray={`${healthScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono font-extrabold text-lg text-white">
              {healthScore}
            </span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Financial Health Index
            </p>
            <p className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span>
                {healthScore >= 80
                  ? "Prime Optimization"
                  : healthScore >= 60
                  ? "Moderate Efficiency"
                  : "High Spending Burn"}
              </span>
              <Award className="w-4 h-4 text-emerald-400" />
            </p>
          </div>
        </TiltCard>
      </div>

      {/* CONDITIONAL CONTENT: EMPTY DATABASE STATE */}
      {expenses.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto">
            <PlusCircle className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-white">No Expense Records in Database</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            The AI Advisor computes 50/30/20 benchmarks and cutback opportunities from real recorded transactions. Add your expenses or scan a bill in Indian Rupees (₹) to activate live analysis.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate("/scan")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-obsidian-950 text-xs font-bold flex items-center gap-2"
            >
              <Scan className="w-4 h-4" />
              <span>Scan Bill (₹)</span>
            </button>
            <button
              onClick={() => navigate("/expenses")}
              className="px-5 py-2.5 rounded-xl glass-card text-xs font-bold text-slate-200"
            >
              <span>Go to Ledger</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* TOP METRICS BENTO GRID IN RUPEES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TiltCard maxTilt={8} className="glass-card p-5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Total Monthly Outflow
                </span>
                <IndianRupee className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold font-mono text-white">
                {formatCurrency(totalSpend)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Across {expenses.length} tracked items
              </p>
            </TiltCard>

            <TiltCard maxTilt={8} className="glass-card p-5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Recurring Subscriptions
                </span>
                <Repeat className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-extrabold font-mono text-indigo-300">
                {formatCurrency(recurringTotal)}
                <span className="text-xs font-normal text-slate-400">/mo</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {recurringExpenses.length} active recurring services
              </p>
            </TiltCard>

            <TiltCard maxTilt={8} className="glass-card p-5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Annual Recurring Drain
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-extrabold font-mono text-amber-400">
                {formatCurrency(annualRecurringDrain)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                12-month cumulative commitment
              </p>
            </TiltCard>

            <TiltCard maxTilt={8} className="glass-card p-5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Simulated Monthly Savings
                </span>
                <TrendingDown className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold font-mono text-emerald-400">
                +{formatCurrency(totalMonthlySavings)}
                <span className="text-xs font-normal text-slate-400">/mo</span>
              </p>
              <p className="text-[11px] text-emerald-400/80 mt-1">
                Yields {formatCurrency(total1YrSavings)} yearly
              </p>
            </TiltCard>
          </div>

          {/* 50/30/20 RULE ANALYSIS & SUBSCRIPTIONS AUDIT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-indigo-400" />
                      50/30/20 Financial Health Benchmark
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Standard: 50% Needs, 30% Wants, 20% Savings.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 my-6">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-300">
                        Needs (Groceries, Utilities, Healthcare)
                      </span>
                      <span className="font-mono text-white">
                        {needsPct}% / Ideal ≤ 50%
                      </span>
                    </div>
                    <div className="h-3 w-full bg-obsidian-900 rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          needsPct <= 50 ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${Math.min(needsPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-300">
                        Wants (Dining, Shopping, Entertainment)
                      </span>
                      <span
                        className={`font-mono ${
                          wantsPct > 30 ? "text-rose-400 font-bold" : "text-white"
                        }`}
                      >
                        {wantsPct}% / Ideal ≤ 30% {wantsPct > 30 && "(EXCESS)"}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-obsidian-900 rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          wantsPct <= 30 ? "bg-indigo-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.min(wantsPct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-obsidian-900/80 border border-white/5 text-xs space-y-2">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                    AI Diagnostic Assessment
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    Needs account for{" "}
                    <span className="text-emerald-400 font-bold">{formatCurrency(needsSpend)}</span>{" "}
                    ({needsPct}%) and discretionary Wants total{" "}
                    <span className="text-indigo-400 font-bold">{formatCurrency(wantsSpend)}</span>{" "}
                    ({wantsPct}%). Trimming discretionary spending directly accelerates savings.
                  </p>
                </div>
              </div>
            </div>

            {/* SUBSCRIPTIONS AUDIT */}
            <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Repeat className="w-5 h-5 text-amber-400" />
                    Recurring Services Audit
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Continuous commitments billed on monthly basis
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {recurringExpenses.length} Active
                </span>
              </div>

              {recurringExpenses.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No recurring subscriptions flagged yet in database.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {recurringExpenses.map((sub) => (
                    <div
                      key={sub._id || sub.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-obsidian-900/60 border border-white/5"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{sub.merchant}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {sub.paymentMethod} • Billed monthly
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold font-mono text-white">
                          {formatCurrency(sub.amount)}
                          <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                        </p>
                        <p className="text-[10px] text-amber-400 font-mono">
                          {formatCurrency(sub.amount * 12)}/yr
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Total Annual Subscription Commitment:</span>
                <span className="font-mono font-extrabold text-amber-400">
                  {formatCurrency(annualRecurringDrain)}
                </span>
              </div>
            </div>
          </div>

          {/* INTERACTIVE COMPOUND SAVINGS SIMULATOR IN RUPEES (₹) */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  Interactive Compound Wealth Simulator (₹)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Simulate cutbacks on discretionary spending and project 7% compound growth in Indian Rupees.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Projected Monthly Surplus
                </span>
                <p className="text-2xl font-extrabold font-mono text-emerald-400">
                  +{formatCurrency(totalMonthlySavings)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 p-6 rounded-2xl bg-obsidian-900/70 border border-white/5">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-300">Dining & Cafe Cut</span>
                  <span className="font-mono text-emerald-400">{diningCut}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="70"
                  step="5"
                  value={diningCut}
                  onChange={(e) => setDiningCut(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Saves {formatCurrency(monthlyDiningSavings)}/mo
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-300">Subscription Trim</span>
                  <span className="font-mono text-indigo-400">{subCut}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={subCut}
                  onChange={(e) => setSubCut(Number(e.target.value))}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Saves {formatCurrency(monthlySubSavings)}/mo
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-300">Shopping Cut</span>
                  <span className="font-mono text-cyan-400">{shoppingCut}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={shoppingCut}
                  onChange={(e) => setShoppingCut(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Saves {formatCurrency(monthlyShoppingSavings)}/mo
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-obsidian-850 border border-white/5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  1-Year Direct Cash Saved
                </span>
                <p className="text-xl font-extrabold font-mono text-white mt-1">
                  {formatCurrency(total1YrSavings)}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Liquid capital preserved
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-obsidian-850 border border-white/5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  3-Year Wealth (7% Compound)
                </span>
                <p className="text-xl font-extrabold font-mono text-indigo-400 mt-1">
                  {formatCurrency(compound3Yr)}
                </p>
                <p className="text-[11px] text-emerald-400 mt-0.5">
                  Re-invested market projection
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-obsidian-850 border border-emerald-500/20 bg-emerald-500/5">
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                  5-Year Milestone Fund
                </span>
                <p className="text-xl font-extrabold font-mono text-emerald-400 mt-1">
                  {formatCurrency(compound5Yr)}
                </p>
                <p className="text-[11px] text-emerald-400 mt-0.5">
                  Long-term wealth accumulation
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
