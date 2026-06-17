import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, type TooltipProps,
} from 'recharts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Wordmark } from '../components/ui/BrandMark';
import { Icon } from '../components/Icon';
import { cn } from '../lib/utils';
import { HISTORY, TREND, type Session } from '../data/mockData';

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-pop">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold tabular-nums text-foreground">
        {payload[0].value}<span className="text-xs font-normal text-muted-foreground"> / 100</span>
      </div>
    </div>
  );
}

function TrendChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={TREND} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} dy={6} />
        <YAxis domain={[40, 90]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={42} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
        <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2.5} fill="url(#grad)"
          dot={{ r: 3.5, fill: 'var(--primary)', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: 'var(--primary)', stroke: 'var(--card)', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function MiniStat({ icon, label, value, tone }: { icon: string; label: string; value: string | number; tone?: 'success' }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon name={icon} size={15} className={tone === 'success' ? 'text-success-ink' : ''} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className={cn('mt-2 text-2xl font-semibold tabular-nums tracking-tight', tone === 'success' ? 'text-success-ink' : 'text-foreground')}>{value}</div>
    </Card>
  );
}

function FilterChip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-all duration-150',
        active ? 'border-primary bg-accent text-accent-foreground' : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      {active && <Icon name="Check" size={13} />}
      {children}
    </button>
  );
}

function SessionCard({ s }: { s: Session }) {
  const tone = s.score >= 80 ? 'success' : s.score >= 60 ? 'primary' : s.score >= 40 ? 'warning' : 'danger';
  const ring = {
    success: 'text-success-ink bg-success-soft',
    primary: 'text-accent-foreground bg-accent',
    warning: 'text-warning-ink bg-warning-soft',
    danger: 'text-danger bg-muted',
  }[tone];
  return (
    <Card className="group flex cursor-pointer items-center gap-4 p-4 transition-all duration-150 hover:border-primary/30 hover:shadow-pop">
      <div className={cn('grid h-14 w-14 shrink-0 place-items-center rounded-xl font-semibold tabular-nums', ring)}>
        <span className="text-xl leading-none">{s.score}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-[15px] font-semibold text-foreground">{s.role}</h3>
          <Badge tone="neutral" className="shrink-0">{s.seniority}</Badge>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Icon name="Calendar" size={13} /> {s.date}</span>
          <span className="flex items-center gap-1.5"><Icon name="Clock" size={13} /> {s.duration}</span>
          <span className="flex items-center gap-1.5"><Icon name="ListChecks" size={13} /> {s.questions} questions</span>
          <span className="flex items-center gap-1.5">
            <Icon name={s.mode === 'Practice' ? 'MessageSquareText' : 'Timer'} size={13} /> {s.mode}
          </span>
        </div>
      </div>
      <Icon name="ChevronRight" size={18} className="shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Card>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <Card className="mt-6 grid place-items-center px-6 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent text-accent-foreground">
        <Icon name="ClipboardList" size={28} />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-foreground">No interviews yet</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">Your practice sessions will show up here with scores and trends. Run your first mock interview to get started.</p>
      <Button size="lg" className="mt-6" onClick={onStart}><Icon name="Play" size={16} /> Start your first interview</Button>
    </Card>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [empty, setEmpty] = useState(false);
  const [filter, setFilter] = useState('all');
  const roles = ['all', 'SAP ABAP Developer', 'SAP Fiori / UI5 Developer', 'ABAP on HANA Consultant'];
  const sessions = filter === 'all' ? HISTORY : HISTORY.filter((s) => s.role === filter);
  const avg = Math.round(HISTORY.reduce((a, s) => a + s.score, 0) / HISTORY.length);

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-3.5">
        <Wordmark />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setEmpty((e) => !e)}>
            <Icon name="Eye" size={14} /> {empty ? 'Show data' : 'Empty state'}
          </Button>
          <Button size="sm" onClick={() => navigate('/')}><Icon name="Plus" size={15} /> New interview</Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto mi-scroll">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <h1 className="text-[26px] font-semibold tracking-tight text-foreground">Your interviews</h1>
          <p className="mt-1 text-[15px] text-muted-foreground">Track progress across sessions and revisit any report.</p>

          {empty ? <EmptyState onStart={() => navigate('/')} /> : (
            <>
              <div className="mt-6 grid gap-5 md:grid-cols-[1fr_1.4fr]">
                <div className="grid grid-cols-2 gap-4 content-start">
                  <MiniStat icon="Layers" label="Sessions" value={HISTORY.length} />
                  <MiniStat icon="Gauge" label="Avg score" value={avg} />
                  <MiniStat icon="TrendingUp" label="Best" value={Math.max(...HISTORY.map((s) => s.score))} tone="success" />
                  <MiniStat icon="Flame" label="Streak" value="3 wks" />
                </div>
                <Card className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Score trend</h3>
                      <p className="text-xs text-muted-foreground">Last 6 sessions</p>
                    </div>
                    <Badge tone="success"><Icon name="ArrowUpRight" size={12} /> +24 pts</Badge>
                  </div>
                  <div className="h-44 w-full"><TrendChart /></div>
                </Card>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-2">
                <span className="mr-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Icon name="ListFilter" size={14} /> Filter
                </span>
                {roles.map((r) => (
                  <FilterChip key={r} active={filter === r} onClick={() => setFilter(r)}>
                    {r === 'all' ? 'All roles' : r}
                  </FilterChip>
                ))}
                <div className="mx-1 h-4 w-px bg-border" />
                <FilterChip>Score 70+</FilterChip>
                <FilterChip>Last 30 days</FilterChip>
              </div>

              <div className="mt-4 space-y-3">
                {sessions.map((s) => <SessionCard key={s.id} s={s} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
