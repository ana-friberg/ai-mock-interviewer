import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ScoreBar, CircularScore } from '../components/ui/Score';
import { Wordmark } from '../components/ui/BrandMark';
import { Icon } from '../components/Icon';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import type { AnsweredQuestion } from '@ai-mock-interviewer/shared';

interface StatProps {
  icon: string;
  label: string;
  value: string;
  tone?: 'success';
}

function Stat({ icon, label, value, tone }: StatProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5">
      <Icon name={icon} size={14} className={tone === 'success' ? 'text-success-ink' : 'text-muted-foreground'} />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn('text-sm font-semibold tabular-nums', tone === 'success' ? 'text-success-ink' : 'text-foreground')}>{value}</span>
    </div>
  );
}

interface BulletCardProps {
  tone: 'success' | 'warning';
  icon: string;
  title: string;
  items: string[];
}

function BulletCard({ tone, icon, title, items }: BulletCardProps) {
  const ink = tone === 'success' ? 'text-success-ink' : 'text-warning-ink';
  const soft = tone === 'success' ? 'bg-success-soft' : 'bg-warning-soft';
  const dot = tone === 'success' ? 'bg-success' : 'bg-warning';
  return (
    <Card className="p-5">
      <div className="mb-3.5 flex items-center gap-2.5">
        <span className={cn('grid h-8 w-8 place-items-center rounded-lg', soft, ink)}>
          <Icon name={icon} size={16} />
        </span>
        <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-foreground">
            <span className={cn('mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full', dot)} />
            <span className="text-pretty">{it}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

interface BreakdownRowProps {
  q: AnsweredQuestion;
  n: number;
  open: boolean;
  onToggle: () => void;
}

function BreakdownRow({ q, n, open, onToggle }: BreakdownRowProps) {
  const score = q.feedback?.score;
  return (
    <div>
      <button onClick={onToggle} className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/50">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-muted font-mono text-xs font-medium tabular-nums text-muted-foreground">{n}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">{q.prompt}</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">{q.topic}</span>
        </span>
        {score !== undefined ? (
          <>
            <span className="hidden w-28 shrink-0 sm:block"><ScoreBar score={score} animate={false} /></span>
            <span className="flex shrink-0 items-center gap-1 text-sm font-semibold tabular-nums text-foreground">
              {score}<span className="text-xs font-normal text-muted-foreground">/10</span>
            </span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">Skipped</span>
        )}
        <Icon name="ChevronDown" size={16} className={cn('shrink-0 text-muted-foreground transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="animate-fade-in space-y-4 bg-muted/30 px-5 pb-5 pt-1">
          {q.answer ? (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your answer</div>
              <p className="text-sm leading-relaxed text-foreground text-pretty">{q.answer}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">Question was skipped.</div>
          )}
          {q.feedback && (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                <Icon name="Sparkles" size={12} /> Feedback
              </div>
              <p className="text-sm leading-relaxed text-foreground text-pretty">{q.feedback.feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-3.5">
        <Wordmark />
      </header>
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon name="Loader" size={32} className="animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Claude is generating your performance report…</p>
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [open, setOpen] = useState(0);

  const { data: report, isLoading: reportLoading, isError: reportError } = useQuery({
    queryKey: ['report', sessionId],
    queryFn: () => api.getReport(sessionId!),
    enabled: !!sessionId,
  });

  const { data: session } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => api.getSession(sessionId!),
    enabled: !!sessionId,
  });

  if (reportLoading) return <LoadingState />;

  if (reportError || !report) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Icon name="AlertCircle" size={32} className="text-destructive" />
          <p className="text-sm text-muted-foreground">Failed to generate report.</p>
          <Button variant="secondary" size="sm" onClick={() => navigate('/')}>Back to setup</Button>
        </div>
      </div>
    );
  }

  const questions = session?.questions ?? [];
  const answeredCount = questions.filter((q) => q.answer).length;
  const roleLabel = session
    ? `${session.settings.jobTitle}${session.settings.company ? ` · ${session.settings.company}` : ''} · ${session.settings.seniority}`
    : '';

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-3.5">
        <Wordmark />
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => navigate('/')}><Icon name="RotateCcw" size={14} /> New interview</Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto mi-scroll">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="mb-2 flex items-center gap-2">
            <Badge tone="primary"><Icon name="CircleCheck" size={13} /> Interview complete</Badge>
          </div>
          <h1 className="text-[26px] font-semibold tracking-tight text-foreground">Performance report</h1>
          {roleLabel && <p className="mt-1 text-[15px] text-muted-foreground">{roleLabel}</p>}

          <Card className="mt-5 overflow-hidden">
            <div className="grid items-center gap-6 p-7 sm:grid-cols-[auto_1fr]">
              <div className="grid place-items-center">
                <CircularScore value={report.overall} label="Overall" />
              </div>
              <div>
                <p className="text-lg font-medium leading-snug text-foreground text-pretty">{report.label}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Stat icon="ListChecks" label="Questions" value={`${answeredCount} / ${questions.length}`} />
                  <Stat icon="Clock" label="Duration" value={report.duration} />
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <BulletCard tone="success" icon="ThumbsUp" title="Strengths" items={report.strengths} />
            <BulletCard tone="warning" icon="Target" title="Areas to improve" items={report.improvements} />
          </div>

          {questions.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Question breakdown</h2>
              <div className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                {questions.map((q, i) => (
                  <BreakdownRow key={q.id} q={q} n={i + 1} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Suggested study topics</h2>
            <div className="flex flex-wrap gap-2">
              {report.studyTopics.map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent/50">
                  <Icon name="BookMarked" size={14} className="text-primary" /> {t}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-9 flex flex-wrap gap-3 border-t border-border pt-7">
            <Button variant="secondary" size="lg" onClick={() => navigate('/')}><Icon name="RotateCcw" size={17} /> Start new interview</Button>
            <Button variant="ghost" size="lg" onClick={() => navigate('/history')}><Icon name="Eye" size={17} /> View history</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
