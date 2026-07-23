import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useProfile } from "./contexts/ProfileContext";
import { ProfileSelector } from "./components/ProfileSelector";

export function App() {
  const { profiles, activeProfile, selectProfile, addProfile, logout } = useProfile();
  const navigate = useNavigate();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  // Close switcher on outside click
  useEffect(() => {
    if (!switcherOpen) return;
    const handler = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [switcherOpen]);

  // No active profile → show selector
  if (!activeProfile) {
    return (
      <ProfileSelector
        profiles={profiles}
        onSelect={(id) => {
          selectProfile(id);
          navigate("/");
        }}
        onCreate={(name, avatar, color) => {
          addProfile(name, avatar, color);
          navigate("/");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-50 bg-slate-900 shadow-lg">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 h-14 sm:h-16">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-white text-lg sm:text-xl font-bold tracking-tight">
              MLS Exam Prep
            </span>
            <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider text-indigo-300 bg-indigo-800/60 px-2 py-0.5 rounded-full">
              Medical Lab Science
            </span>
          </div>

          {/* Tab links */}
          <div className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`
              }
            >
              Quiz Mode
            </NavLink>
            <NavLink
              to="/review"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`
              }
            >
              Performance Review
            </NavLink>
          </div>

          {/* Profile switcher */}
          <div className="relative ml-auto" ref={switcherRef}>
            <button
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${activeProfile.color}`}>
                {activeProfile.avatar}
              </span>
              <span className="hidden sm:inline max-w-[100px] truncate">{activeProfile.name}</span>
              <svg className={`w-4 h-4 transition-transform ${switcherOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {switcherOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2 space-y-0.5 z-30">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      selectProfile(p.id);
                      setSwitcherOpen(false);
                      navigate("/");
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      p.id === activeProfile.id
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${p.color}`}>
                      {p.avatar}
                    </span>
                    <span className="truncate font-medium">{p.name}</span>
                    {p.id === activeProfile.id && (
                      <svg className="w-4 h-4 ml-auto text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
                <hr className="my-1 border-slate-100" />
                <button
                  onClick={() => {
                    logout();
                    setSwitcherOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Switch Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
