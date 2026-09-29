import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "../context/ExpenseContext";
import { uploadAPI } from "../services/api";
import confetti from "canvas-confetti";
import TiltCard from "../components/TiltCard";
import {
  extractTextFromImage,
  extractTextFromPDF,
  parseReceiptText,
} from "../services/ocrEngine";
import {
  UploadCloud, FileText, Image as ImageIcon, CheckCircle2,
  Sparkles, RefreshCw, Plus, Trash2, Eye, ArrowRight,
  Zap, ScanLine, Brain, Camera, File, X,
} from "lucide-react";

/* ─── Category options ───────────────────────────────────── */
const CATEGORIES = [
  "Dining & Café",
  "Groceries & Market",
  "Subscriptions",
  "Travel & Transport",
  "Utilities & Bills",
  "Shopping & Retail",
  "Healthcare",
  "Cloud & Tech",
  "Education",
  "Entertainment",
  "General Expense",
];

const PAYMENT_METHODS = [
  "UPI Transfer",
  "Credit Card",
  "Debit Card",
  "Net Banking",
  "Cash",
  "Paytm",
  "PhonePe",
  "Google Pay",
  "Amazon Pay",
  "Wallet",
];

/* ─── Scan Step Indicator ────────────────────────────────── */
function ScanSteps({ progress, message }) {
  const steps = [
    { label: "Upload",   threshold: 15 },
    { label: "OCR",      threshold: 50 },
    { label: "Extract",  threshold: 85 },
    { label: "Done",     threshold: 100 },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Progress bar */}
      <div className="h-1.5 progress-track">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #10B981, #06B6D4)",
            boxShadow: "0 0 12px rgba(16,185,129,0.5)",
          }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between">
        {steps.map(({ label, threshold }, i) => {
          const done    = progress >= threshold;
          const current = progress >= (steps[i - 1]?.threshold ?? 0) && progress < threshold;
          return (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                ${done    ? "bg-emerald-500 text-zinc-950" :
                  current ? "bg-emerald-500/20 border border-emerald-500 text-emerald-400 animate-pulse" :
                             "bg-white/5 border border-white/10 text-slate-600"}`}>
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-[10px] font-semibold ${done ? "text-emerald-400" : "text-slate-600"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-emerald-400 font-mono text-center">{message}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCAN STUDIO
═══════════════════════════════════════════════════════════ */
export default function ScanStudio() {
  const navigate = useNavigate();
  const { addExpense, formatCurrency } = useExpenses();

  const fileInputRef = useRef(null);

  const [dragActive,        setDragActive]        = useState(false);
  const [filePreview,       setFilePreview]       = useState(null);
  const [fileType,          setFileType]          = useState(null);
  const [fileName,          setFileName]          = useState("");
  const [uploadedServerUrl, setUploadedServerUrl] = useState("");

  const [isScanning,       setIsScanning]       = useState(false);
  const [scanProgress,     setScanProgress]     = useState(0);
  const [scanMessage,      setScanMessage]      = useState("");

  const [parsedData,  setParsedData]  = useState(null);
  const [successSaved, setSuccessSaved] = useState(false);

  /* ── File processing ─────────────────────────────────── */
  const processFile = async (file) => {
    if (!file) return;
    setSuccessSaved(false);
    setParsedData(null);
    setFileName(file.name);
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    setFileType(isPdf ? "pdf" : "image");

    if (!isPdf) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    setIsScanning(true);
    setScanProgress(10);
    setScanMessage("Uploading file to Node.js backend…");

    try {
      // Upload to backend (Multer)
      try {
        const res = await uploadAPI.uploadReceipt(file);
        if (res.data?.url) setUploadedServerUrl(res.data.url);
      } catch { /* offline fallback */ }

      setScanProgress(28);
      setScanMessage("Initializing Tesseract OCR engine…");

      let rawText = "";
      if (isPdf) {
        rawText = await extractTextFromPDF(file, (p, m) => { setScanProgress(p); setScanMessage(m); });
      } else {
        rawText = await extractTextFromImage(file, (p, m) => { setScanProgress(p); setScanMessage(m); });
      }

      setScanProgress(88);
      setScanMessage("Extracting financial entities (₹)…");

      const extracted = parseReceiptText(rawText);
      extracted.currency = "₹";
      setParsedData(extracted);

      setScanProgress(100);
      setScanMessage("Document digitized successfully ✓");
    } catch (err) {
      console.warn("OCR notice:", err?.message);
      setScanMessage("OCR complete — please verify the extracted data.");
      setParsedData({
        merchant:      file.name.replace(/\.[^/.]+$/, ""),
        total:         0,
        subtotal:      0,
        tax:           0,
        date:          new Date().toISOString().split("T")[0],
        category:      "General Expense",
        currency:      "₹",
        paymentMethod: "UPI Transfer",
        lineItems:     [],
        confidence:    70,
      });
    } finally {
      setIsScanning(false);
    }
  };

  /* ── Drag handlers ───────────────────────────────────── */
  const onDragOver  = (e) => { e.preventDefault(); setDragActive(true); };
  const onDragLeave = ()  => setDragActive(false);
  const onDrop      = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  /* ── Save to MongoDB ─────────────────────────────────── */
  const handleSave = async () => {
    if (!parsedData) return;
    await addExpense({
      merchant:      parsedData.merchant || "Unknown",
      category:      parsedData.category || "General Expense",
      amount:        parsedData.total,
      subtotal:      parsedData.subtotal,
      tax:           parsedData.tax,
      date:          parsedData.date,
      paymentMethod: parsedData.paymentMethod || "UPI Transfer",
      isRecurring:   parsedData.category === "Subscriptions",
      type:          ["Groceries & Market","Utilities & Bills","Healthcare"].includes(parsedData.category)
                       ? "Essential" : "Discretionary",
      notes:         `OCR scan: ${fileName}`,
      lineItems:     parsedData.lineItems || [],
      receiptUrl:    uploadedServerUrl,
    });
    setSuccessSaved(true);
    try {
      confetti({ particleCount: 90, spread: 72, origin: { y: 0.6 },
        colors: ["#10B981", "#06B6D4", "#6366F1", "#F59E0B"] });
    } catch {}
  };

  /* ── Reset ───────────────────────────────────────────── */
  const handleReset = () => {
    setParsedData(null);
    setFilePreview(null);
    setFileName("");
    setFileType(null);
    setScanProgress(0);
    setScanMessage("");
    setSuccessSaved(false);
    setUploadedServerUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen pb-24 pt-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">

      {/* ═══ PAGE HEADER ═════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-up">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              <Sparkles className="w-3.5 h-3.5" />
              OCR Document Intelligence
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              ₹ INR
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            <span className="gradient-text-emerald">AI Receipt</span> &amp; Invoice Scanner
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
            Upload bill photos or PDF invoices. Tesseract OCR extracts merchants, line items, GST, and amounts in Indian Rupees (₹) — then saves directly to MongoDB.
          </p>
        </div>
        <button onClick={() => navigate("/expenses")}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card
            text-xs font-semibold text-slate-400 hover:text-white border border-white/8
            hover:border-white/20 transition-all shrink-0">
          View Ledger <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ═══ UPLOAD + VERIFY GRID ════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── LEFT: DROPZONE ──────────────────────────── */}
        <div className="space-y-4 animate-fade-up delay-100">
          {/* Drop zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-3xl cursor-pointer overflow-hidden transition-all duration-300
              drop-zone min-h-[280px] flex flex-col items-center justify-center p-8 text-center
              ${dragActive ? "active scale-[1.01]" : ""}`}
          >
            <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden"
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />

            {/* Scanning overlay */}
            {isScanning && (
              <div className="absolute inset-0 bg-[#050608]/90 backdrop-blur-sm z-30
                flex flex-col items-center justify-center p-8 space-y-6">
                <div className="laser-beam" />
                <div className="scan-corner scan-corner-tl" />
                <div className="scan-corner scan-corner-tr" />
                <div className="scan-corner scan-corner-bl" />
                <div className="scan-corner scan-corner-br" />

                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-lg animate-pulse" />
                  <div className="relative w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <ScanLine className="w-8 h-8 text-emerald-400 animate-bounce" />
                  </div>
                </div>

                <ScanSteps progress={scanProgress} message={scanMessage} />
              </div>
            )}

            {/* Drop zone content */}
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 blur-xl animate-float-y" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10
                  border border-emerald-500/25 flex items-center justify-center">
                  <UploadCloud className="w-9 h-9 text-emerald-400" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  {dragActive ? "Drop it here!" : "Drop receipt or invoice"}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  Drag & drop a PNG, JPG, WEBP, or PDF. Files are stored on your Node.js backend.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
                  <Camera className="w-3.5 h-3.5" />
                  Photos
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/8 border border-cyan-500/20 text-xs font-semibold text-cyan-400">
                  <File className="w-3.5 h-3.5" />
                  PDFs
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-400">
                  Browse →
                </div>
              </div>
            </div>
          </div>

          {/* File info bar */}
          {fileName && !isScanning && (
            <div className="glass-card rounded-2xl p-4 flex items-center justify-between border border-white/8 animate-fade-up">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${fileType === "pdf" ? "bg-cyan-500/10 border-cyan-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
                  {fileType === "pdf"
                    ? <FileText className="w-4 h-4 text-cyan-400" />
                    : <ImageIcon className="w-4 h-4 text-emerald-400" />
                  }
                </div>
                <div>
                  <p className="text-xs font-bold text-white truncate max-w-[200px]">{fileName}</p>
                  <p className="text-[11px] text-slate-500 font-mono uppercase mt-0.5">
                    {fileType} · OCR Complete
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {parsedData && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    {parsedData.confidence || 88}%
                  </span>
                )}
                <button onClick={handleReset} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Preview image */}
          {filePreview && (
            <div className="glass-panel rounded-2xl p-4 border border-white/8 animate-fade-up">
              <p className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                Original Document Preview
              </p>
              <div className="max-h-64 overflow-y-auto rounded-xl border border-white/5">
                <img src={filePreview} alt="Receipt" className="w-full object-contain rounded-xl" />
              </div>
            </div>
          )}

          {/* How it works — shown only when nothing uploaded */}
          {!fileName && (
            <div className="glass-panel rounded-2xl p-5 border border-white/8 animate-fade-up delay-200">
              <p className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">How it works</p>
              {[
                { icon: UploadCloud, color: "text-emerald-400", title: "Upload", desc: "Drag a photo or PDF receipt" },
                { icon: Brain,       color: "text-indigo-400",  title: "OCR",    desc: "Tesseract reads all text" },
                { icon: Sparkles,    color: "text-cyan-400",    title: "Extract", desc: "AI parses ₹ amounts & details" },
                { icon: CheckCircle2,color: "text-amber-400",   title: "Save",   desc: "Committed to MongoDB Atlas" },
              ].map(({ icon: Icon, color, title, desc }, i) => (
                <div key={title} className="flex items-center gap-3 mb-3 last:mb-0">
                  <div className={`w-7 h-7 rounded-lg bg-white/4 border border-white/8 flex items-center justify-center shrink-0`}>
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">{title}</span>
                    <span className="text-xs text-slate-500 ml-2">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: VERIFICATION PANEL ───────────────── */}
        <div className="animate-fade-up delay-200">
          <div className="glass-panel rounded-3xl p-6 border border-white/8 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  Extraction &amp; Verification
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Review extracted data before saving to MongoDB</p>
              </div>
              {parsedData && (
                <span className="font-mono-num text-sm font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/25">
                  ₹{parsedData.total?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>

            {/* Content */}
            {!parsedData ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/8 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-sm font-semibold text-slate-500">Awaiting document scan</p>
                <p className="text-xs text-slate-600 mt-1.5 max-w-xs">
                  Upload a receipt or invoice on the left to activate OCR extraction.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {/* Merchant & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                        Merchant / Payee
                      </label>
                      <input type="text" value={parsedData.merchant}
                        onChange={(e) => setParsedData({ ...parsedData, merchant: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-semibold"
                        placeholder="Merchant name…"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                        Category
                      </label>
                      <select value={parsedData.category}
                        onChange={(e) => setParsedData({ ...parsedData, category: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-semibold appearance-none">
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c} className="bg-[#0A0C18]">{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Total (₹)",    key: "total",    accent: true },
                      { label: "Subtotal (₹)", key: "subtotal", accent: false },
                      { label: "GST / Tax (₹)",key: "tax",      accent: false },
                    ].map(({ label, key, accent }) => (
                      <div key={key}>
                        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                          {label}
                        </label>
                        <input type="number" step="0.01" value={parsedData[key]}
                          onChange={(e) => setParsedData({ ...parsedData, [key]: parseFloat(e.target.value) || 0 })}
                          className={`w-full px-3 py-2.5 rounded-xl glass-input text-xs font-bold font-mono
                            ${accent ? "text-emerald-400" : ""}`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Date & Payment */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                        Date
                      </label>
                      <input type="date" value={parsedData.date}
                        onChange={(e) => setParsedData({ ...parsedData, date: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                        Payment
                      </label>
                      <select value={parsedData.paymentMethod || "UPI Transfer"}
                        onChange={(e) => setParsedData({ ...parsedData, paymentMethod: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl glass-input text-xs appearance-none">
                        {PAYMENT_METHODS.map((m) => (
                          <option key={m} value={m} className="bg-[#0A0C18]">{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Line items */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                        Line Items ({parsedData.lineItems?.length || 0})
                      </label>
                      <button type="button"
                        onClick={() => setParsedData({
                          ...parsedData,
                          lineItems: [...(parsedData.lineItems || []), { description: "", price: 0 }],
                        })}
                        className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1.5">
                      {parsedData.lineItems?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/3 border border-white/5">
                          <input type="text" value={item.description}
                            onChange={(e) => {
                              const u = [...parsedData.lineItems];
                              u[idx].description = e.target.value;
                              setParsedData({ ...parsedData, lineItems: u });
                            }}
                            className="flex-1 bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none"
                            placeholder="Item description…"
                          />
                          <span className="text-[11px] text-slate-600">₹</span>
                          <input type="number" step="0.01" value={item.price}
                            onChange={(e) => {
                              const u = [...parsedData.lineItems];
                              u[idx].price = parseFloat(e.target.value) || 0;
                              setParsedData({ ...parsedData, lineItems: u });
                            }}
                            className="w-20 bg-transparent text-xs font-mono text-emerald-400 text-right focus:outline-none"
                          />
                          <button onClick={() => setParsedData({
                            ...parsedData,
                            lineItems: parsedData.lineItems.filter((_, i) => i !== idx),
                          })} className="text-slate-600 hover:text-rose-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {(!parsedData.lineItems || parsedData.lineItems.length === 0) && (
                        <p className="text-[11px] text-slate-600 text-center py-3">No line items extracted</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Save / success */}
                <div className="pt-4 border-t border-white/5 shrink-0">
                  {successSaved ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-emerald-300">Saved to MongoDB!</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {formatCurrency(parsedData.total)} · {parsedData.merchant}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleReset}
                          className="px-3 py-1.5 rounded-xl glass-card text-xs font-bold text-slate-300 hover:text-white transition-colors">
                          New Scan
                        </button>
                        <button onClick={() => navigate("/expenses")}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 text-zinc-950 text-xs font-bold hover:bg-emerald-400 transition-colors">
                          Ledger
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={handleSave}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500
                        text-zinc-950 text-sm font-extrabold flex items-center justify-center gap-2.5
                        shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/45
                        hover:-translate-y-0.5 transition-all duration-300">
                      <CheckCircle2 className="w-4 h-4" />
                      Approve &amp; Save to MongoDB (₹)
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
