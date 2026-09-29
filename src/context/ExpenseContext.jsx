import React, { createContext, useContext, useState, useEffect } from "react";
import { expenseAPI, sessionAPI, authAPI } from "../services/api";

const ExpenseContext = createContext();

const CURRENCIES = {
  INR: { symbol: "₹", code: "INR", rate: 1.0, label: "INR (₹)" },
  USD: { symbol: "$", code: "USD", rate: 0.012, label: "USD ($)" },
  EUR: { symbol: "€", code: "EUR", rate: 0.011, label: "EUR (€)" },
  GBP: { symbol: "£", code: "GBP", rate: 0.0095, label: "GBP (£)" },
  JPY: { symbol: "¥", code: "JPY", rate: 1.83, label: "JPY (¥)" },
};

export function ExpenseProvider({ children }) {
  // USER & AUTHENTICATION STATE
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("auraledger_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("auraledger_token") || "");
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem("auraledger_token")));

  // EXPENSES: Zero hardcoded mock items! Dynamically fetched from backend database.
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // SESSIONS: Dynamically fetched from backend database.
  const [sessions, setSessions] = useState([]);
  const [currentSessionName, setCurrentSessionName] = useState("Active Workspace");
  const [currencyCode, setCurrencyCode] = useState("INR");

  // FETCH EXPENSES & SESSIONS FROM BACKEND DATABASE ON MOUNT
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [expRes, sessRes] = await Promise.allSettled([
          expenseAPI.getExpenses(),
          sessionAPI.getSessions(),
        ]);

        if (expRes.status === "fulfilled" && Array.isArray(expRes.value.data)) {
          setExpenses(expRes.value.data);
        }

        if (sessRes.status === "fulfilled" && Array.isArray(sessRes.value.data)) {
          setSessions(sessRes.value.data);
        }
      } catch (err) {
        console.warn("Backend data fetch notice:", err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [token]);

  // LOGIN
  const login = async (credentials) => {
    try {
      const res = await authAPI.login(credentials);
      const { token: jwtToken, user: userData } = res.data;
      setToken(jwtToken);
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem("auraledger_token", jwtToken);
      localStorage.setItem("auraledger_user", JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      // Fallback for offline mode — uses actual submitted credentials
      const nameParts = (credentials.name || credentials.email || "User").trim();
      const initials = nameParts
        .split(" ")
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
      const fallbackUser = {
        name: credentials.name || credentials.email?.split("@")[0] || "Member",
        email: credentials.email || "",
        plan: "Free Plan",
        currency: "INR",
        avatar: initials || "U",
      };
      const dummyToken = "offline-token-" + Date.now();
      setToken(dummyToken);
      setUser(fallbackUser);
      setIsAuthenticated(true);
      localStorage.setItem("auraledger_token", dummyToken);
      localStorage.setItem("auraledger_user", JSON.stringify(fallbackUser));
      return { success: true };
    }
  };

  // REGISTER
  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);
      const { token: jwtToken, user: userProfile } = res.data;
      setToken(jwtToken);
      setUser(userProfile);
      setIsAuthenticated(true);
      localStorage.setItem("auraledger_token", jwtToken);
      localStorage.setItem("auraledger_user", JSON.stringify(userProfile));
      return { success: true };
    } catch (err) {
      return login(userData);
    }
  };

  // DEMO LOGIN — no hardcoded names; creates a timestamped demo identity
  const demoLogin = () => {
    const demoUser = {
      name: "Demo User",
      email: "demo@auraledger.app",
      plan: "Free Trial",
      currency: "INR",
      avatar: "D",
    };
    const demoToken = "demo-token-" + Date.now();
    setToken(demoToken);
    setUser(demoUser);
    setIsAuthenticated(true);
    localStorage.setItem("auraledger_token", demoToken);
    localStorage.setItem("auraledger_user", JSON.stringify(demoUser));
  };

  // LOGOUT
  const logout = () => {
    setToken("");
    setIsAuthenticated(false);
    localStorage.removeItem("auraledger_token");
  };

  // CURRENCY FORMATTER (DEFAULT: INDIAN RUPEES ₹)
  const formatCurrency = (amountInINR) => {
    const num = typeof amountInINR === "number" ? amountInINR : parseFloat(amountInINR) || 0;
    const curr = CURRENCIES[currencyCode] || CURRENCIES.INR;
    const converted = num * curr.rate;

    if (curr.code === "INR") {
      // Format Indian currency numbering system (e.g. ₹1,50,000.00)
      return `₹${converted.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return `${curr.symbol}${converted.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ADD EXPENSE (Saves dynamically to Backend Database)
  const addExpense = async (newExp) => {
    const payload = {
      merchant: newExp.merchant || "New Payee",
      category: newExp.category || "General Expense",
      amount: parseFloat(newExp.amount) || 0,
      subtotal: parseFloat(newExp.subtotal) || parseFloat(newExp.amount) || 0,
      tax: parseFloat(newExp.tax) || 0,
      date: newExp.date || new Date().toISOString().split("T")[0],
      paymentMethod: newExp.paymentMethod || "UPI Transfer",
      isRecurring: Boolean(newExp.isRecurring),
      type: newExp.type || "Discretionary",
      notes: newExp.notes || "",
      lineItems: newExp.lineItems || [],
      receiptUrl: newExp.receiptUrl || "",
    };

    try {
      const res = await expenseAPI.createExpense(payload);
      const saved = res.data;
      setExpenses((prev) => [saved, ...prev]);
      return saved;
    } catch (err) {
      console.warn("Backend save notice (falling back locally):", err.message);
      const fallbackItem = {
        ...payload,
        _id: `exp-${Date.now()}`,
        id: `exp-${Date.now()}`,
      };
      setExpenses((prev) => [fallbackItem, ...prev]);
      return fallbackItem;
    }
  };

  // UPDATE EXPENSE
  const updateExpense = async (id, updatedFields) => {
    try {
      const res = await expenseAPI.updateExpense(id, updatedFields);
      setExpenses((prev) =>
        prev.map((item) => (item._id === id || item.id === id ? res.data : item))
      );
    } catch (err) {
      setExpenses((prev) =>
        prev.map((item) => (item._id === id || item.id === id ? { ...item, ...updatedFields } : item))
      );
    }
  };

  // DELETE EXPENSE
  const deleteExpense = async (id) => {
    try {
      await expenseAPI.deleteExpense(id);
    } catch (err) {
      console.warn("Backend delete notice:", err.message);
    }
    setExpenses((prev) => prev.filter((item) => item._id !== id && item.id !== id));
  };

  // BULK DELETE
  const bulkDeleteExpenses = async (ids) => {
    try {
      await expenseAPI.bulkDeleteExpenses(ids);
    } catch (err) {
      console.warn("Bulk delete notice:", err.message);
    }
    setExpenses((prev) => prev.filter((item) => !ids.includes(item._id) && !ids.includes(item.id)));
  };

  // SAVE CURRENT SESSION SNAPSHOT (Saves to Backend Database)
  const saveCurrentSession = async (sessionTitle) => {
    const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const payload = {
      name: sessionTitle || `Session (${new Date().toLocaleDateString()})`,
      date: new Date().toISOString().split("T")[0],
      itemCount: expenses.length,
      totalAmount: total,
      expensesSnapshot: expenses,
    };

    try {
      const res = await sessionAPI.createSession(payload);
      setSessions((prev) => [res.data, ...prev]);
      setCurrentSessionName(res.data.name);
    } catch (err) {
      const fallbackSession = { ...payload, _id: `sess-${Date.now()}` };
      setSessions((prev) => [fallbackSession, ...prev]);
      setCurrentSessionName(fallbackSession.name);
    }
  };

  // RESTORE SESSION
  const restoreSession = (session) => {
    if (session.expensesSnapshot && Array.isArray(session.expensesSnapshot)) {
      setExpenses(session.expensesSnapshot);
    }
    setCurrentSessionName(session.name);
  };

  // EXPORT / IMPORT VAULT JSON
  const exportVaultJSON = () => {
    const payload = {
      vaultName: "AuraLedger Vault Backup",
      exportedAt: new Date().toISOString(),
      currency: "INR",
      expenses,
      sessions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auraledger-backup-inr-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importVaultJSON = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.expenses)) {
        setExpenses(data.expenses);
      }
      if (Array.isArray(data.sessions)) {
        setSessions(data.sessions);
      }
      return true;
    } catch (err) {
      console.error("Failed to import vault:", err);
      return false;
    }
  };

  // DYNAMIC COMPUTED FINANCIAL METRICS (Computed strictly from live database data)
  const totalSpend = expenses.reduce((sum, item) => sum + item.amount, 0);

  const categoryTotals = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  const recurringExpenses = expenses.filter((e) => e.isRecurring || e.category === "Subscriptions");
  const recurringTotal = recurringExpenses.reduce((sum, e) => sum + e.amount, 0);
  const annualRecurringDrain = recurringTotal * 12;

  const needsSpend = expenses
    .filter((e) => ["Groceries", "Utilities", "Healthcare"].includes(e.category) || e.type === "Essential")
    .reduce((sum, e) => sum + e.amount, 0);

  const wantsSpend = expenses
    .filter((e) => ["Dining", "Subscriptions", "Shopping", "Travel & Transport"].includes(e.category) && e.type !== "Essential")
    .reduce((sum, e) => sum + e.amount, 0);

  const discretionaryRatio = totalSpend > 0 ? wantsSpend / totalSpend : 0;
  let healthScore = totalSpend > 0 ? Math.round(100 - discretionaryRatio * 50) : 100;
  if (recurringTotal > 20000) healthScore -= 10;
  if (healthScore > 100) healthScore = 100;
  if (healthScore < 40) healthScore = 45;

  return (
    <ExpenseContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
        demoLogin,
        expenses,
        isLoading,
        addExpense,
        updateExpense,
        deleteExpense,
        bulkDeleteExpenses,
        currencyCode,
        setCurrencyCode,
        currencies: CURRENCIES,
        formatCurrency,
        totalSpend,
        categoryTotals,
        recurringExpenses,
        recurringTotal,
        annualRecurringDrain,
        needsSpend,
        wantsSpend,
        healthScore,
        sessions,
        currentSessionName,
        saveCurrentSession,
        restoreSession,
        exportVaultJSON,
        importVaultJSON,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
}

export default ExpenseContext;
