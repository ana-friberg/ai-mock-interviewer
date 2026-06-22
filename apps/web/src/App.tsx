import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Icon } from './components/Icon';
import SetupPage from './pages/SetupPage';
import InterviewPage from './pages/InterviewPage';
import ReportPage from './pages/ReportPage';
import HistoryPage from './pages/HistoryPage';

function DarkToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-[13px] font-medium text-foreground shadow-soft transition-colors hover:bg-muted"
    >
      <Icon name={dark ? 'Sun' : 'Moon'} size={15} /> {dark ? 'Light' : 'Dark'}
    </button>
  );
}

export function App() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 border-b border-border bg-canvas/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center rounded-lg bg-primary text-primary-foreground shadow-soft" style={{ width: 32, height: 32 }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 19V7.5a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3V19" />
                  <path d="M19 19V7.5a3 3 0 0 0-3-3h0" />
                  <path d="M5 13h6" />
                </svg>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight text-foreground">AI Mock Interviewer</div>
                <div className="text-[11px] text-muted-foreground">Practice · 4 screens</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <nav className="hidden items-center gap-1 rounded-lg bg-muted p-1 md:flex">
                {[
                  { to: '/', label: 'Setup' },
                  { to: '/history', label: 'History' },
                ].map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${isActive ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground hover:bg-card hover:text-foreground'}`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
              <DarkToggle dark={dark} onToggle={() => setDark((d) => !d)} />
            </div>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<SetupPage />} />
          <Route path="/interview/:sessionId" element={<InterviewPage />} />
          <Route path="/report/:sessionId" element={<ReportPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
