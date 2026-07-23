import { useState, useMemo } from "react";
import { useProfile } from "../contexts/ProfileContext";

type FilterMode = "all" | "incorrect" | "correct";

const FILTERS: { key: FilterMode; label: string }[] = [
  { key: "all", label: "All" },
  { key: "incorrect", label: "Incorrect Only" },
  { key: "correct", label: "Correct Only" },
];

export function Review() {
  const [filter, setFilter] = useState<FilterMode>("all");
  const { activeProfile } = useProfile();
  const attempt = activeProfile?.attempt ?? null;

  if (!attempt) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500 text-center px-4">
        <p className="text-lg">
          No quiz session found. Go to the <strong className="text-slate-700">Quiz Dashboard</strong> and start an attempt first.
        </p>
      </div>
    );
  }

  const totalAnswered = attempt.answers.filter((a) => a !== null).length;
  const totalCorrect = attempt.answers.reduce<number>((acc, ans, i) => {
    return acc + (ans !== null && ans === attempt.questions[i].correctOptionIndex ? 1 : 0);
  }, 0);
  const accuracyPct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const totalBatches = attempt.submittedBatches.length;

  const filtered = useMemo(() => {
    return attempt.questions
      .map((q, i) => ({ question: q, index: i, userAnswer: attempt.answers[i] }))
      .filter(({ userAnswer }) => userAnswer !== null)
      .filter(({ question, userAnswer }) => {
        const correct = question.correctOptionIndex;
        if (filter === "correct") return userAnswer === correct;
        if (filter === "incorrect") return userAnswer !== correct;
        return true;
      });
  }, [attempt, filter]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Performance Review</h1>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-center">
          <span className="block text-3xl font-bold text-slate-800">{totalAnswered}</span>
          <span className="block text-sm text-slate-500 mt-1 uppercase tracking-wider font-medium">Total Attempted</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-center">
          <span className="block text-3xl font-bold text-indigo-600">{accuracyPct}%</span>
          <span className="block text-sm text-slate-500 mt-1 uppercase tracking-wider font-medium">Accuracy Rate</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-center">
          <span className="block text-3xl font-bold text-slate-800">{totalBatches}</span>
          <span className="block text-sm text-slate-500 mt-1 uppercase tracking-wider font-medium">Batches Completed</span>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
              filter === key
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Review Cards */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <p className="text-center text-slate-400 py-12">No questions match this filter.</p>
        )}
        {filtered.map(({ question, index, userAnswer }) => {
          const isCorrect = userAnswer === question.correctOptionIndex;

          return (
            <div
              key={question.id}
              className={`bg-white rounded-xl shadow-sm border-l-4 overflow-hidden ${
                isCorrect ? "border-l-emerald-400" : "border-l-red-400"
              }`}
            >
              <div className="p-4 sm:p-5">
                {/* Question stem + badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-slate-800 text-base font-semibold leading-relaxed">
                    <span className="text-indigo-500 font-bold mr-2">{index + 1}.</span>
                    {question.questionText}
                  </h3>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      isCorrect
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Correct
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Incorrect
                      </>
                    )}
                  </span>
                </div>

                {/* Options summary */}
                <div className="space-y-1.5">
                  {question.options.map((opt, optIdx) => {
                    const isUserChoice = userAnswer === optIdx;
                    const isCorrectOpt = optIdx === question.correctOptionIndex;

                    let rowClass = "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ";
                    if (isCorrectOpt) {
                      rowClass += "bg-emerald-50 text-emerald-800";
                    } else if (isUserChoice) {
                      rowClass += "bg-red-50 text-red-800";
                    } else {
                      rowClass += "text-slate-600";
                    }

                    const dotClass = isCorrectOpt
                      ? "bg-emerald-500"
                      : isUserChoice
                      ? "bg-red-500"
                      : "bg-slate-300";

                    return (
                      <div key={optIdx} className={rowClass}>
                        <span className={`shrink-0 w-2 h-2 rounded-full ${dotClass}`} />
                        <span className="font-medium text-slate-400 text-xs w-5">{String.fromCharCode(65 + optIdx)}.</span>
                        <span className="flex-1">{opt}</span>
                        {isUserChoice && (
                          <span className="text-xs font-medium text-slate-400 italic">(your choice)</span>
                        )}
                        {isCorrectOpt && !isUserChoice && (
                          <span className="text-xs font-medium text-emerald-600">(correct answer)</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Clinical Explanation */}
                <div className="mt-4 p-3 sm:p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <div>
                      <span className="text-sm font-semibold text-blue-700">Clinical Context</span>
                      <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                        {question.explanation || "No explanation available."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Review;
