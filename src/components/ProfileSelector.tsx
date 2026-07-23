import { useState } from "react";
import type { UserProfile } from "../hooks/useProfileStorage";
import { CreateProfileModal } from "./CreateProfileModal";

interface ProfileSelectorProps {
  profiles: UserProfile[];
  onSelect: (id: string) => void;
  onCreate: (name: string, avatar: string, color: string) => void;
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function progressSummary(p: UserProfile): string {
  const a = p.attempt;
  if (!a) return "No activity yet";
  const totalBatches = Math.ceil(a.questions.length / a.batchSize);
  const answered = a.answers.filter((x) => x !== null).length;
  const correct = a.answers.reduce<number>(
    (acc, ans, i) => acc + (ans !== null && ans === a.questions[i].correctOptionIndex ? 1 : 0),
    0
  );
  const pct = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  return `Batch ${a.currentBatch + 1} of ${totalBatches} \u2022 ${answered}/${a.questions.length} \u2022 ${pct}%`;
}

export function ProfileSelector({ profiles, onSelect, onCreate }: ProfileSelectorProps) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
            MLS Exam Prep Dashboard
          </h1>
          <p className="text-indigo-200 text-sm sm:text-base mt-2 max-w-lg mx-auto">
            Master medical laboratory science with batch quizzes, clinical explanations, and performance tracking.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm text-indigo-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>
              <strong className="text-white">{profiles.length}</strong> profile{profiles.length !== 1 ? "s" : ""} on this device
            </span>
          </div>
        </div>
      </div>

      {/* Profile grid */}
      <div className="mx-auto max-w-5xl w-full px-4 -mt-6 pb-12">
        {profiles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-5 text-left transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${p.color}`}>
                    {p.avatar}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{formatTime(p.lastActive)}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{progressSummary(p)}</p>
                <span className="mt-3 inline-block text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Tap to continue &rarr;
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Create new profile button */}
        <button
          onClick={() => setShowCreate(true)}
          className="w-full rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 p-6 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/40 group"
        >
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
            <svg className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="mt-3 font-semibold text-slate-600 group-hover:text-indigo-700 transition-colors">
            Add New Profile
          </p>
          <p className="text-sm text-slate-400">Start fresh or continue from a save file</p>
        </button>
      </div>

      <CreateProfileModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={(name, avatar, color) => {
          onCreate(name, avatar, color);
          setShowCreate(false);
        }}
      />
    </div>
  );
}

export default ProfileSelector;
