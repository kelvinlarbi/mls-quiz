import { useState } from "react";
import type { QuizAttempt } from "../hooks/useQuizStorage";
import { getBatchStatus, getTotalBatches } from "../hooks/useQuizStorage";

interface BatchSelectorProps {
  attempt: QuizAttempt;
  currentBatch: number;
  onSelect: (batch: number) => void;
  onBatchSizeChange: (size: number) => void;
}

const BATCH_SIZE_OPTIONS = [10, 25, 50];

const statusStyles: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700 border-emerald-300",
  "in-progress": "bg-blue-100 text-blue-700 border-blue-300",
  unattempted: "bg-slate-100 text-slate-500 border-slate-200",
};

const statusLabel: Record<string, string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  unattempted: "Unattempted",
};

export function BatchSelector({
  attempt,
  currentBatch,
  onSelect,
  onBatchSizeChange,
}: BatchSelectorProps) {
  const [open, setOpen] = useState(false);
  const totalBatches = getTotalBatches(attempt.questions.length, attempt.batchSize);

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        Batch {currentBatch + 1} of {totalBatches}
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 z-20 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-3 space-y-3">
            {/* Batch size selector */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Questions per batch
              </label>
              <div className="flex gap-1.5">
                {BATCH_SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      onBatchSizeChange(size);
                      setOpen(false);
                    }}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      attempt.batchSize === size
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Batch list */}
            <div className="max-h-64 overflow-y-auto space-y-1">
              {Array.from({ length: totalBatches }, (_, i) => {
                const status = getBatchStatus(attempt, i, attempt.batchSize);
                const start = i * attempt.batchSize + 1;
                const end = Math.min((i + 1) * attempt.batchSize, attempt.questions.length);

                return (
                  <button
                    key={i}
                    onClick={() => {
                      onSelect(i);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      i === currentBatch
                        ? "bg-indigo-50 border border-indigo-200"
                        : "hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">
                        Batch {i + 1}
                      </span>
                      <span className="text-xs text-slate-400">
                        Q{start}&ndash;Q{end}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyles[status]}`}
                    >
                      {statusLabel[status]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default BatchSelector;
