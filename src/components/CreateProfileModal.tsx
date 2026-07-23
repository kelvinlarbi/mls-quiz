import { useState } from "react";

interface CreateProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, avatar: string, color: string) => void;
}

const AVATARS = ["👨‍🔬", "👩‍🔬", "🧑‍⚕️", "👨‍⚕️", "👩‍⚕️", "🧬", "🔬", "📊"];
const COLORS = [
  { label: "Indigo", value: "bg-indigo-500" },
  { label: "Emerald", value: "bg-emerald-500" },
  { label: "Sky", value: "bg-sky-500" },
  { label: "Violet", value: "bg-violet-500" },
  { label: "Rose", value: "bg-rose-500" },
  { label: "Amber", value: "bg-amber-500" },
];

export function CreateProfileModal({ open, onClose, onSubmit }: CreateProfileModalProps) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("👨‍🔬");
  const [color, setColor] = useState("bg-indigo-500");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed, avatar, color);
    setName("");
    setAvatar("👨‍🔬");
    setColor("bg-indigo-500");
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800">New Study Profile</h2>
            <p className="text-sm text-slate-500 mt-1">Set up your personalized quiz tracker</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar picker */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Avatar
              </label>
              <div className="flex gap-2 flex-wrap justify-center">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAvatar(a)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-lg transition-all ${
                      avatar === a
                        ? "ring-2 ring-indigo-400 ring-offset-2 scale-110"
                        : "bg-slate-100 hover:bg-slate-200"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Name input */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Student MD"
                maxLength={30}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                autoFocus
              />
            </div>

            {/* Color theme */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Theme Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-8 h-8 rounded-full ${c.value} transition-all ${
                      color === c.value ? "ring-2 ring-slate-400 ring-offset-2 scale-110" : ""
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateProfileModal;
