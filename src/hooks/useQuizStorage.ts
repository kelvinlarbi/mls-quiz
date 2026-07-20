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
}

const STORAGE_KEY = "active_quiz_attempt_v2";

function loadFromStorage(): QuizAttempt | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(attempt: QuizAttempt): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attempt));
}

function clearStaleKeys(): void {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("active_quiz_attempt") && key !== STORAGE_KEY) {
      localStorage.removeItem(key);
    }
  }
}

export function startNewAttempt(questions: Question[]): QuizAttempt {
  clearStaleKeys();
  const attempt: QuizAttempt = {
    id: crypto.randomUUID?.() ?? Date.now().toString(36),
    questions,
    answers: new Array(questions.length).fill(null),
    submittedBatches: [],
    isCompleted: false,
    startTime: Date.now(),
  };
  saveToStorage(attempt);
  return attempt;
}

export function selectAnswer(
  attempt: QuizAttempt,
  questionIndex: number,
  optionIndex: number
): QuizAttempt {
  const updated = {
    ...attempt,
    answers: [...attempt.answers],
  };
  updated.answers[questionIndex] = optionIndex;
  saveToStorage(updated);
  return updated;
}

export function submitBatch(
  attempt: QuizAttempt,
  batchIndex: number
): QuizAttempt {
  const updated = {
    ...attempt,
    submittedBatches: [...attempt.submittedBatches, batchIndex],
  };
  saveToStorage(updated);
  return updated;
}

export function getStoredAttempt(): QuizAttempt | null {
  return loadFromStorage();
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}
