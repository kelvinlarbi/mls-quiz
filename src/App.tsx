import { NavLink, Outlet } from "react-router-dom";

export function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-50 bg-slate-900 shadow-lg">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 h-14 sm:h-16">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-white text-lg sm:text-xl font-bold tracking-tight">
              MLS Exam Prep Dashboard
            </span>
            <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider text-indigo-300 bg-indigo-800/60 px-2 py-0.5 rounded-full">
              Medical Lab Science
            </span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
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
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
