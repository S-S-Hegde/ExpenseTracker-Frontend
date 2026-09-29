import React, { useState } from "react";
import { useExpenses } from "../context/ExpenseContext";
import {
  History,
  Save,
  RotateCcw,
  Download,
  Upload,
  X,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";

export default function SessionHistoryModal({ isOpen, onClose }) {
  const {
    sessions,
    currentSessionName,
    saveCurrentSession,
    restoreSession,
    exportVaultJSON,
    importVaultJSON,
    formatCurrency,
  } = useExpenses();

  const [sessionTitle, setSessionTitle] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState("");

  if (!isOpen) return null;

  const handleSaveSnapshot = (e) => {
    e.preventDefault();
    if (!sessionTitle.trim()) return;

    saveCurrentSession(sessionTitle.trim());
    setSessionTitle("");
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (content && typeof content === "string") {
        const success = importVaultJSON(content);
        if (success) {
          setImportStatus("Vault backup imported successfully!");
        } else {
          setImportStatus("Invalid vault file format.");
        }
        setTimeout(() => setImportStatus(""), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
            <History className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Vault Sessions & Archival History
            </h2>
            <p className="text-xs text-slate-400">
              Preserve multiple fiscal sessions, restore historical snapshots, or transfer backups.
            </p>
          </div>
        </div>

        {/* ACTIVE SESSION STATUS */}
        <div className="p-4 rounded-2xl bg-obsidian-900/80 border border-white/5 flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active Working Session
              </p>
              <p className="text-sm font-bold text-white mt-0.5">
                {currentSessionName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportVaultJSON}
              className="px-3 py-1.5 rounded-xl glass-card text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
              title="Download full JSON backup of all expenses & sessions"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <label className="px-3 py-1.5 rounded-xl glass-card text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {importStatus && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300 text-center">
            {importStatus}
          </div>
        )}

        {/* SAVE CURRENT SESSION FORM */}
        <form onSubmit={handleSaveSnapshot} className="mb-6">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Create Snapshot of Current Ledger State
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. March 2026 Invoices, Tokyo Summit Trip"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl glass-input text-xs font-medium"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Session</span>
            </button>
          </div>
          {saveSuccess && (
            <p className="text-[11px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Session snapshot saved!
            </p>
          )}
        </form>

        {/* PAST SAVED SESSIONS LIST */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Saved Session Snapshots ({sessions.length})
          </p>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-obsidian-900/60 border border-white/5 hover:border-indigo-500/30 transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-white">{sess.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {sess.date} • {sess.itemCount} items • {formatCurrency(sess.totalAmount)}
                  </p>
                </div>

                <button
                  onClick={() => {
                    restoreSession(sess);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
