export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  questions: Question[];
  answers: (number | null)[];
  submittedBatches: number[];
  isCompleted: boolean;
  startTime: number;
  currentBatch: number;
  batchSize: number;
}

const STORAGE_KEY = "active_quiz_attempt_v2";

function clearStaleKeys(): void {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("active_quiz_attempt") && key !== STORAGE_KEY) {
      localStorage.removeItem(key);
    }
  }
}

/* ---- Pure creation / mutation (no localStorage) ---- */

export function createNewAttempt(
  questions: Question[],
  batchSize = 10
): QuizAttempt {
  clearStaleKeys();
  return {
    id: crypto.randomUUID?.() ?? Date.now().toString(36),
    questions: questions,
    answers: new Array(questions.length).fill(null),
    submittedBatches: [],
    isCompleted: false,
    startTime: Date.now(),
    currentBatch: 0,
    batchSize,
  };
}

export function selectAnswer(
  attempt: QuizAttempt,
  questionIndex: number,
  optionIndex: number
): QuizAttempt {
  const answers = [...attempt.answers];
  answers[questionIndex] = optionIndex;
  return { ...attempt, answers };
}

export function submitBatch(
  attempt: QuizAttempt,
  batchIndex: number
): QuizAttempt {
  const submitted = attempt.submittedBatches.includes(batchIndex)
    ? attempt.submittedBatches
    : [...attempt.submittedBatches, batchIndex];
  return { ...attempt, submittedBatches: submitted };
}

export function setCurrentBatch(
  attempt: QuizAttempt,
  batch: number
): QuizAttempt {
  return { ...attempt, currentBatch: batch };
}

export function setBatchSize(
  attempt: QuizAttempt,
  batchSize: number
): QuizAttempt {
  return { ...attempt, batchSize };
}

/* ---- Save Point Export / Import ---- */

export function exportSaveState(attempt: QuizAttempt): string {
  const payload = {
    id: attempt.id,
    answers: attempt.answers,
    submittedBatches: attempt.submittedBatches,
    isCompleted: attempt.isCompleted,
    startTime: attempt.startTime,
    currentBatch: attempt.currentBatch,
    batchSize: attempt.batchSize,
  };
  return JSON.stringify(payload);
}

export function importSaveState(
  json: string,
  questions: Question[]
): QuizAttempt | null {
  try {
    const parsed = JSON.parse(json);
    return {
      id: parsed.id ?? crypto.randomUUID?.(),
      questions,
      answers: parsed.answers ?? new Array(questions.length).fill(null),
      submittedBatches: parsed.submittedBatches ?? [],
      isCompleted: parsed.isCompleted ?? false,
      startTime: parsed.startTime ?? Date.now(),
      currentBatch: parsed.currentBatch ?? 0,
      batchSize: parsed.batchSize ?? 10,
    };
  } catch {
    return null;
  }
}

/* ---- Reset Controls (pure) ---- */

export function resetBatch(
  attempt: QuizAttempt,
  batchIndex: number,
  batchSize: number
): QuizAttempt {
  const answers = [...attempt.answers];
  const start = batchIndex * batchSize;
  const end = Math.min(start + batchSize, answers.length);
  for (let i = start; i < end; i++) {
    answers[i] = null;
  }
  const submitted = attempt.submittedBatches.filter((b) => b !== batchIndex);
  return { ...attempt, answers, submittedBatches: submitted };
}

export function resetAll(attempt: QuizAttempt): QuizAttempt {
  return {
    ...attempt,
    answers: new Array(attempt.questions.length).fill(null),
    submittedBatches: [],
    isCompleted: false,
    currentBatch: 0,
  };
}

/* ---- Batch helpers ---- */

export function getBatchStatus(
  attempt: QuizAttempt,
  batchIndex: number,
  batchSize: number
): "completed" | "in-progress" | "unattempted" {
  const start = batchIndex * batchSize;
  const end = Math.min(start + batchSize, attempt.questions.length);
  const hasAnswers = attempt.answers.slice(start, end).some((a) => a !== null);
  const isSubmitted = attempt.submittedBatches.includes(batchIndex);
  if (isSubmitted) return "completed";
  if (hasAnswers) return "in-progress";
  return "unattempted";
}

export function getTotalBatches(
  questionCount: number,
  batchSize: number
): number {
  return Math.ceil(questionCount / batchSize);
}
