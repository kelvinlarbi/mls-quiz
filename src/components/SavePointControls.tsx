import { useState, useRef } from "react";
import type { QuizAttempt } from "../hooks/useQuizStorage";
import {
  exportSaveState,
  importSaveState,
  resetBatch,
  resetAll,
} from "../hooks/useQuizStorage";

interface SavePointControlsProps {
  attempt: QuizAttempt;
  currentBatch: number;
  onReset: (updated: QuizAttempt) => void;
}

type ConfirmAction = "reset-batch" | "reset-all" | null;

export function SavePointControls({
  attempt,
  currentBatch,
  onReset,
}: SavePointControlsProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction>(null);
  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const flash = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExport = () => {
    const json = exportSaveState(attempt);
    navigator.clipboard.writeText(json).then(
      () => flash("Progress copied to clipboard!"),
      () => {
        // Fallback: download as file
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mls-quiz-save-${attempt.id.slice(0, 8)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        flash("Save file downloaded!");
      }
    );
  };

  const handleImportPaste = () => {
    const restored = importSaveState(importText, attempt.questions);
    if (!restored) {
      flash("Invalid save code. Please check and try again.");
      return;
    }
    onReset(restored);
    setShowImport(false);
    setImportText("");
    flash("Progress restored from save code!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const restored = importSaveState(reader.result as string, attempt.questions);
      if (!restored) {
        flash("Invalid save file.");
        return;
      }
      onReset(restored);
      flash("Progress restored from file!");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleConfirm = () => {
    if (confirm === "reset-batch") {
      const updated = resetBatch(attempt, currentBatch, attempt.batchSize);
      onReset(updated);
      flash(`Batch ${currentBatch + 1} progress cleared.`);
    } else if (confirm === "reset-all") {
      const updated = resetAll(attempt);
      onReset(updated);
      flash("All progress reset.");
    }
    setConfirm(null);
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2">
        {/* Export */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          title="Export progress (copy or download)"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export
        </button>

        {/* Import */}
        <button
          onClick={() => setShowImport(!showImport)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          title="Import progress from file or paste"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v12m0 0l-3-3m3 3l3-3" />
          </svg>
          Import
        </button>

        {/* Reset batch */}
        <button
          onClick={() => setConfirm("reset-batch")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-white text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          title={`Reset Batch ${currentBatch + 1}`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Reset Batch
        </button>

        {/* Reset all */}
        <button
          onClick={() => setConfirm("reset-all")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 bg-white text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
          title="Reset all progress"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
          </svg>
          Reset All
        </button>
      </div>

      {/* Flash message */}
      {message && (
        <div className="absolute left-0 top-full mt-2 z-30 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
          {message}
        </div>
      )}

      {/* Confirmation modal */}
      {confirm && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setConfirm(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">
                {confirm === "reset-batch"
                  ? `Reset Batch ${currentBatch + 1}?`
                  : "Reset All Progress?"}
              </h3>
              <p className="text-sm text-slate-600">
                {confirm === "reset-batch"
                  ? `This will clear all answers for Batch ${currentBatch + 1} (questions ${
                      currentBatch * attempt.batchSize + 1
                    }–${Math.min(
                      (currentBatch + 1) * attempt.batchSize,
                      attempt.questions.length
                    )}).`
                  : "This will clear all answers and reset your session to the beginning."}
                <br />
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirm(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-semibold text-white transition-colors"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Import panel */}
      {showImport && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => { setShowImport(false); setImportText(""); }} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Import Progress</h3>

              {/* Paste */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Paste save code
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={4}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="Paste JSON save code here..."
                />
                <button
                  onClick={handleImportPaste}
                  disabled={!importText.trim()}
                  className="mt-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Restore from Paste
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex-1 border-t border-slate-200" />
                OR
                <span className="flex-1 border-t border-slate-200" />
              </div>

              {/* Upload file */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Upload save file
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => { setShowImport(false); setImportText(""); }}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SavePointControls;
