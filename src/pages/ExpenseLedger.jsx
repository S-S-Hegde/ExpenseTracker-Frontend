import React, { useState, useMemo } from "react";
import { useExpenses } from "../context/ExpenseContext";
import TiltCard from "../components/TiltCard";
import {
  Search,
  Trash2,
  Download,
  Plus,
  FileText,
  Eye,
  X,
  IndianRupee,
  ArrowUp,
  ArrowDown,
  Repeat,
  PlusCircle,
} from "lucide-react";

export default function ExpenseLedger() {
  const {
    expenses,
    formatCurrency,
    addExpense,
    deleteExpense,
    bulkDeleteExpenses,
  } = useExpenses();

  // FILTER & SORT STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedIds, setSelectedIds] = useState([]);

  // MODALS STATE
  const [viewingExpense, setViewingExpense] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // NEW EXPENSE FORM STATE
  const [newExpenseForm, setNewExpenseForm] = useState({
    merchant: "",
    category: "Dining",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "UPI Transfer",
    type: "Discretionary",
    isRecurring: false,
    notes: "",
  });

  const categories = [
    "All",
    "Dining",
    "Groceries",
    "Cloud & Tech",
    "Subscriptions",
    "Travel & Transport",
    "Utilities",
    "Healthcare",
    "Shopping",
  ];

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case "Dining":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Groceries":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Cloud & Tech":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "Subscriptions":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "Travel & Transport":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Utilities":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "Healthcare":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((item) => {
        const matchesCategory =
          selectedCategory === "All" || item.category === selectedCategory;

        const matchesType =
          selectedType === "All" ||
          (selectedType === "Recurring" && item.isRecurring) ||
          item.type === selectedType;

        const q = searchQuery.toLowerCase();
        const matchesQuery =
          !q ||
          item.merchant.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q)) ||
          item.paymentMethod.toLowerCase().includes(q);

        return matchesCategory && matchesType && matchesQuery;
      })
      .sort((a, b) => {
        let compare = 0;
        if (sortBy === "date") {
          compare = new Date(a.date) - new Date(b.date);
        } else if (sortBy === "amount") {
          compare = a.amount - b.amount;
        } else if (sortBy === "merchant") {
          compare = a.merchant.localeCompare(b.merchant);
        } else if (sortBy === "category") {
          compare = a.category.localeCompare(b.category);
        }
        return sortOrder === "asc" ? compare : -compare;
      });
  }, [expenses, selectedCategory, selectedType, searchQuery, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    await bulkDeleteExpenses(selectedIds);
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Merchant", "Category", "Amount (INR)", "Date", "Payment Method", "Type", "Recurring", "Notes"];
    const rows = filteredExpenses.map((e) => [
      e._id || e.id,
      `"${e.merchant}"`,
      `"${e.category}"`,
      e.amount,
      e.date,
      `"${e.paymentMethod}"`,
      `"${e.type}"`,
      e.isRecurring ? "Yes" : "No",
      `"${(e.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `auraledger-expenses-inr-${new Date().toISOString().split("T")[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateManualExpense = async (e) => {
    e.preventDefault();
    if (!newExpenseForm.merchant || !newExpenseForm.amount) return;

    await addExpense({
      merchant: newExpenseForm.merchant,
      category: newExpenseForm.category,
      amount: parseFloat(newExpenseForm.amount),
      date: newExpenseForm.date,
      paymentMethod: newExpenseForm.paymentMethod,
      type: newExpenseForm.type,
      isRecurring: newExpenseForm.isRecurring,
      notes: newExpenseForm.notes,
      lineItems: [{ description: newExpenseForm.merchant, price: parseFloat(newExpenseForm.amount) }],
    });

    setIsAddModalOpen(false);
    setNewExpenseForm({
      merchant: "",
      category: "Dining",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "UPI Transfer",
      type: "Discretionary",
      isRecurring: false,
      notes: "",
    });
  };

  return (
    <div className="min-h-screen pb-20 pt-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Database Ledger
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {filteredExpenses.length} of {expenses.length} Records (INR ₹)
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Financial Transactions
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Connected to live MongoDB database with multi-field sorting, filtering, and itemized verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {expenses.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl glass-card text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-2 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-obsidian-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Expense (₹)</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL STRIP */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search merchant, notes, category, or payment method..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs font-medium"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 rounded-xl glass-input text-xs font-semibold"
            >
              <option value="All" className="bg-obsidian-900 text-white">All Classifications</option>
              <option value="Essential" className="bg-obsidian-900 text-white">Essential (Needs)</option>
              <option value="Discretionary" className="bg-obsidian-900 text-white">Discretionary (Wants)</option>
              <option value="Recurring" className="bg-obsidian-900 text-white">Recurring Subscriptions</option>
            </select>
          </div>

          {/* Bulk Delete Button */}
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-500/20 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </button>
          )}
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-emerald-500 text-obsidian-950 font-bold shadow-md shadow-emerald-500/20"
                  : "bg-obsidian-900/60 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* EXPENSES DATA TABLE */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-obsidian-900/80 text-slate-400 font-semibold border-b border-white/5 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-4 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === filteredExpenses.length &&
                      filteredExpenses.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(filteredExpenses.map((item) => item._id || item.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="rounded border-white/20 bg-obsidian-800 text-emerald-500 focus:ring-0"
                  />
                </th>

                <th
                  onClick={() => toggleSort("merchant")}
                  className="py-4 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Merchant / Payee</span>
                    {sortBy === "merchant" && (
                      sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-400" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => toggleSort("category")}
                  className="py-4 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Category</span>
                    {sortBy === "category" && (
                      sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-400" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => toggleSort("date")}
                  className="py-4 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    {sortBy === "date" && (
                      sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-400" />
                    )}
                  </div>
                </th>

                <th className="py-4 px-4">Payment Method</th>

                <th
                  onClick={() => toggleSort("amount")}
                  className="py-4 px-4 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Amount (₹)</span>
                    {sortBy === "amount" && (
                      sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-400" />
                    )}
                  </div>
                </th>

                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-2">
                      <PlusCircle className="w-10 h-10 mx-auto opacity-30 text-emerald-400" />
                      <p className="text-sm font-semibold text-slate-300">
                        {expenses.length === 0
                          ? "Database ledger is empty"
                          : "No transactions match your search filter"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {expenses.length === 0
                          ? "Add a transaction or scan a receipt to record your first expense in Indian Rupees (₹)."
                          : "Try clearing search keywords or choosing 'All' categories."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const itemId = exp._id || exp.id;
                  const isChecked = selectedIds.includes(itemId);
                  return (
                    <tr
                      key={itemId}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isChecked ? "bg-emerald-500/[0.03]" : ""
                      }`}
                    >
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedIds((prev) =>
                              prev.includes(itemId)
                                ? prev.filter((i) => i !== itemId)
                                : [...prev, itemId]
                            );
                          }}
                          className="rounded border-white/20 bg-obsidian-800 text-emerald-500 focus:ring-0"
                        />
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-xs">{exp.merchant}</p>
                          {exp.isRecurring && (
                            <span title="Recurring billing" className="p-1 rounded bg-indigo-500/10 text-indigo-400">
                              <Repeat className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        {exp.notes && (
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {exp.notes}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getCategoryBadgeClass(
                            exp.category
                          )}`}
                        >
                          {exp.category}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono text-slate-300">
                        {exp.date}
                      </td>

                      <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                        {exp.paymentMethod}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <span className="font-mono font-bold text-sm text-white">
                          {formatCurrency(exp.amount)}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            title="Inspect Itemized Receipt"
                            onClick={() => setViewingExpense(exp)}
                            className="p-1.5 rounded-lg bg-obsidian-900 border border-white/5 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete Record"
                            onClick={() => deleteExpense(itemId)}
                            className="p-1.5 rounded-lg bg-obsidian-900 border border-white/5 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIPT INSPECTION MODAL */}
      {viewingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-white/10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setViewingExpense(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{viewingExpense.merchant}</h3>
                <p className="text-xs text-slate-400 font-mono">Receipt Inspection Details</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-obsidian-900/80 border border-white/5 text-xs mb-4">
              <div>
                <span className="text-slate-400">Total Charged:</span>
                <p className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                  {formatCurrency(viewingExpense.amount)}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Category:</span>
                <p className="font-semibold text-white mt-0.5">{viewingExpense.category}</p>
              </div>
              <div>
                <span className="text-slate-400">Date:</span>
                <p className="font-mono text-white mt-0.5">{viewingExpense.date}</p>
              </div>
              <div>
                <span className="text-slate-400">Payment:</span>
                <p className="font-mono text-white mt-0.5">{viewingExpense.paymentMethod}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Itemized Line Items
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {viewingExpense.lineItems && viewingExpense.lineItems.length > 0 ? (
                  viewingExpense.lineItems.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-850 border border-white/5 text-xs"
                    >
                      <span className="text-slate-200">{item.description}</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    Single transaction item recorded.
                  </p>
                )}
              </div>
            </div>

            {viewingExpense.notes && (
              <div className="mt-4 pt-3 border-t border-white/5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Notes
                </p>
                <p className="text-xs text-slate-300 mt-1">{viewingExpense.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL IN INDIAN RUPEES (₹) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-white/10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              Add Transaction in Indian Rupees (₹)
            </h3>

            <form onSubmit={handleCreateManualExpense} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Merchant / Payee Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swiggy, Reliance Digital, Zomato"
                  value={newExpenseForm.merchant}
                  onChange={(e) =>
                    setNewExpenseForm({ ...newExpenseForm, merchant: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Amount (₹ INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold font-mono text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={newExpenseForm.amount}
                      onChange={(e) =>
                        setNewExpenseForm({ ...newExpenseForm, amount: e.target.value })
                      }
                      className="w-full pl-7 pr-3 py-2 rounded-xl glass-input text-xs font-mono font-bold text-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newExpenseForm.date}
                    onChange={(e) =>
                      setNewExpenseForm({ ...newExpenseForm, date: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newExpenseForm.category}
                    onChange={(e) =>
                      setNewExpenseForm({ ...newExpenseForm, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold"
                  >
                    {categories
                      .filter((c) => c !== "All")
                      .map((cat) => (
                        <option key={cat} value={cat} className="bg-obsidian-900">
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Classification
                  </label>
                  <select
                    value={newExpenseForm.type}
                    onChange={(e) =>
                      setNewExpenseForm({ ...newExpenseForm, type: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold"
                  >
                    <option value="Discretionary" className="bg-obsidian-900">
                      Discretionary (Want)
                    </option>
                    <option value="Essential" className="bg-obsidian-900">
                      Essential (Need)
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Payment Method
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI, NetBanking, Credit Card"
                  value={newExpenseForm.paymentMethod}
                  onChange={(e) =>
                    setNewExpenseForm({ ...newExpenseForm, paymentMethod: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekly family grocery run"
                  value={newExpenseForm.notes}
                  onChange={(e) =>
                    setNewExpenseForm({ ...newExpenseForm, notes: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recCheck"
                  checked={newExpenseForm.isRecurring}
                  onChange={(e) =>
                    setNewExpenseForm({ ...newExpenseForm, isRecurring: e.target.checked })
                  }
                  className="rounded border-white/20 bg-obsidian-800 text-emerald-500 focus:ring-0"
                />
                <label htmlFor="recCheck" className="text-xs text-slate-300 cursor-pointer">
                  Mark as Recurring Monthly Subscription
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-obsidian-950 text-xs font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all"
                >
                  Save to MongoDB Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
