import { useEffect, useState, useCallback, useRef } from "react";
import type { Question, QuizAttempt } from "../hooks/useQuizStorage";
import {
  createNewAttempt,
  selectAnswer,
  submitBatch,
  setCurrentBatch,
  setBatchSize,
  getTotalBatches,
} from "../hooks/useQuizStorage";
import { useProfile } from "../contexts/ProfileContext";
import { BatchSelector } from "../components/BatchSelector";
import { SavePointControls } from "../components/SavePointControls";

function sanitizeQuestions(raw: Question[]): Question[] {
  return raw.map((q, idx) => ({
    ...q,
    id: `q_idx_${idx}_${q.id ?? ""}`,
  }));
}

export function Home() {
  const { activeProfile, updateAttempt } = useProfile();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentBatch, setCurrentBatchLocal] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);

  // Sync attempt from profile on mount & whenever activeProfile changes
  useEffect(() => {
    if (!activeProfile) return;

    if (activeProfile.attempt) {
      setAttempt(activeProfile.attempt);
      setCurrentBatchLocal(activeProfile.attempt.currentBatch);
      setLoading(false);
      return;
    }

    fetch("/questions.json")
      .then((r) => r.json())
      .then((data: Question[]) => {
        const sanitized = sanitizeQuestions(data);
        const fresh = createNewAttempt(sanitized);
        setAttempt(fresh);
        setCurrentBatchLocal(fresh.currentBatch);
        updateAttempt(fresh);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load questions:", err);
        setLoading(false);
      });
  }, [activeProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist to profile whenever attempt changes
  const persistAttempt = useCallback(
    (updated: QuizAttempt) => {
      setAttempt(updated);
      updateAttempt(updated);
      return updated;
    },
    [updateAttempt]
  );

  const handleBatchChange = useCallback(
    (batch: number) => {
      if (!attempt) return;
      setCurrentBatchLocal(batch);
      const updated = setCurrentBatch(attempt, batch);
      persistAttempt(updated);
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    },
    [attempt, persistAttempt]
  );

  const handleBatchSizeChange = useCallback(
    (size: number) => {
      if (!attempt) return;
      const updated = setBatchSize(attempt, size);
      persistAttempt(updated);
    },
    [attempt, persistAttempt]
  );

  const isSubmitted =
    attempt?.submittedBatches.includes(currentBatch) ?? false;

  const handleSelect = useCallback(
    (questionIdx: number, optionIdx: number) => {
      if (!attempt || isSubmitted) return;
      const globalIdx = currentBatch * attempt.batchSize + questionIdx;
      const updated = selectAnswer(attempt, globalIdx, optionIdx);
      persistAttempt(updated);
    },
    [attempt, isSubmitted, currentBatch, persistAttempt]
  );

  const handleSubmit = useCallback(() => {
    if (!attempt) return;
    const updated = submitBatch(attempt, currentBatch);
    persistAttempt(updated);
  }, [attempt, currentBatch, persistAttempt]);

  const handleReset = useCallback(
    (updated: QuizAttempt) => {
      persistAttempt(updated);
      setCurrentBatchLocal(updated.currentBatch);
    },
    [persistAttempt]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500 px-4">
        <p className="text-lg">Loading questions...</p>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500 text-center px-4">
        <p className="text-lg">
          Failed to load questions. Make sure{" "}
          <code className="bg-slate-200 px-1.5 py-0.5 rounded text-sm">questions.json</code> is in the public folder.
        </p>
      </div>
    );
  }

  const totalBatches = getTotalBatches(attempt.questions.length, attempt.batchSize);
  const batchQuestions = attempt.questions.slice(
    currentBatch * attempt.batchSize,
    (currentBatch + 1) * attempt.batchSize
  );

  const batchAnswered = batchQuestions.reduce(
    (acc, _, idx) =>
      acc + (attempt.answers[currentBatch * attempt.batchSize + idx] !== null ? 1 : 0),
    0
  );
  const batchProgress = Math.round((batchAnswered / batchQuestions.length) * 100);
  const batchCorrect = batchQuestions.reduce(
    (acc, q, idx) => {
      const ans = attempt.answers[currentBatch * attempt.batchSize + idx];
      return acc + (isSubmitted && ans === q.correctOptionIndex ? 1 : 0);
    },
    0
  );

  return (
    <div ref={topRef} className="space-y-5">
      {/* Top toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BatchSelector
          attempt={attempt}
          currentBatch={currentBatch}
          onSelect={handleBatchChange}
          onBatchSizeChange={handleBatchSizeChange}
        />
        <SavePointControls
          attempt={attempt}
          currentBatch={currentBatch}
          onReset={handleReset}
        />
      </div>

      {/* Header Stat Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">
              Batch {currentBatch + 1} of {totalBatches}
            </span>
            <span className="text-sm text-slate-300">|</span>
            <span className="text-sm font-semibold text-slate-700">
              Q{currentBatch * attempt.batchSize + 1} &ndash; Q
              {Math.min((currentBatch + 1) * attempt.batchSize, attempt.questions.length)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              Answered:{" "}
              <span className="font-semibold text-slate-700">
                {batchAnswered}/{batchQuestions.length}
              </span>
            </span>
            {isSubmitted && (
              <span className="text-sm font-semibold text-emerald-600">
                Score: {batchCorrect}/{batchQuestions.length}
              </span>
            )}
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 bg-indigo-500"
            style={{ width: `${batchProgress}%` }}
          />
        </div>
      </div>

      {/* Question Cards */}
      <div className="space-y-5">
        {batchQuestions.map((q, idx) => {
          const globalIdx = currentBatch * attempt.batchSize + idx;
          const selected = attempt.answers[globalIdx];

          return (
            <div
              key={q.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="p-4 sm:p-5 pb-0">
                <h3 className="text-slate-800 text-base sm:text-lg font-semibold leading-relaxed">
                  <span className="text-indigo-500 font-bold mr-2">{globalIdx + 1}.</span>
                  {q.questionText}
                </h3>
              </div>

              <div className="p-4 sm:p-5 space-y-2.5">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selected === optIdx;
                  const isCorrectOpt = isSubmitted && optIdx === q.correctOptionIndex;
                  const isWrongOpt = isSubmitted && isSelected && !isCorrectOpt;

                  let btnClass =
                    "w-full flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 text-left transition-all text-sm sm:text-base ";
                  if (isSubmitted) {
                    btnClass += "cursor-default ";
                    if (isCorrectOpt) {
                      btnClass += "border-emerald-400 bg-emerald-50 text-emerald-900";
                    } else if (isWrongOpt) {
                      btnClass += "border-red-400 bg-red-50 text-red-900";
                    } else {
                      btnClass += "border-slate-200 bg-white text-slate-600";
                    }
                  } else if (isSelected) {
                    btnClass +=
                      "border-indigo-400 bg-indigo-50 text-indigo-700 cursor-pointer hover:bg-indigo-50";
                  } else {
                    btnClass +=
                      "border-slate-200 bg-white text-slate-700 cursor-pointer hover:border-slate-300 hover:bg-slate-50";
                  }

                  const labelClass = isCorrectOpt
                    ? "bg-emerald-500 text-white"
                    : isWrongOpt
                    ? "bg-red-500 text-white"
                    : isSelected && !isSubmitted
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-100 text-slate-500";

                  return (
                    <button
                      key={optIdx}
                      className={btnClass}
                      disabled={isSubmitted}
                      onClick={() => handleSelect(idx, optIdx)}
                    >
                      <span
                        className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${labelClass}`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isCorrectOpt && (
                        <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {isWrongOpt && (
                        <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>

              {isSubmitted && (
                <div className="mx-4 sm:mx-5 mb-4 sm:mb-5 p-3 sm:p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <div>
                      <span className="text-sm font-semibold text-blue-700">Clinical Context</span>
                      <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                        {q.explanation || "No explanation available."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isSubmitted && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-colors text-sm sm:text-base"
          >
            Submit Batch
          </button>
        </div>
      )}

      {/* Batch Navigation */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <button
          disabled={currentBatch === 0}
          onClick={() => handleBatchChange(currentBatch - 1)}
          className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          &larr; Previous Batch
        </button>
        <span className="text-sm text-slate-400 font-medium">
          Batch {currentBatch + 1} of {totalBatches}
        </span>
        <button
          disabled={currentBatch >= totalBatches - 1}
          onClick={() => handleBatchChange(currentBatch + 1)}
          className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next Batch &rarr;
        </button>
      </div>
    </div>
  );
}

export default Home;
