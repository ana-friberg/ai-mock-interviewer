import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Textarea } from '../components/ui/Input';
import { BrandMark } from '../components/ui/BrandMark';
import { ScoreDots } from '../components/ui/Score';
import { Icon } from '../components/Icon';
import { cn } from '../lib/utils';
import { INTERVIEW_QUESTIONS, type Question } from '../data/mockData';

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${ss.toString().padStart(2, '0')}`;
}

interface FeedbackListProps {
  tone: 'success' | 'warning';
  icon: string;
  title: string;
  items: string[];
}

function FeedbackList({ tone, icon, title, items }: FeedbackListProps) {
  const ring = tone === 'success' ? 'text-success-ink' : 'text-warning-ink';
  const dot = tone === 'success' ? 'bg-success' : 'bg-warning';
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className={cn('mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide', ring)}>
        <Icon name={icon} size={13} /> {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm leading-snug text-foreground">
            <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', dot)} />
            <span className="text-pretty">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface FeedbackCardProps {
  q: Question;
  onNext: () => void;
  isLast: boolean;
}

function FeedbackCard({ q, onNext, isLast }: FeedbackCardProps) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return (
    <div className={cn('mt-6 transition-all duration-500 ease-out', shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2')}>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-success-ink">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-success-soft">
          <Icon name="Check" size={14} strokeWidth={3} />
        </span>
        Answer submitted · feedback ready
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Score</span>
            <ScoreDots score={q.score} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-semibold tabular-nums leading-none text-foreground">{q.score}</span>
            <span className="text-sm text-muted-foreground">/ 10</span>
          </div>
        </div>
        <div className="space-y-5 p-6">
          <p className="text-[15px] leading-relaxed text-foreground text-pretty">{q.feedback}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FeedbackList tone="success" icon="ThumbsUp" title="What worked" items={q.strengths} />
            <FeedbackList tone="warning" icon="Lightbulb" title="To improve" items={q.improve} />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <Icon name="BookOpen" size={15} /> See a model answer
          </button>
          <Button onClick={onNext}>
            {isLast ? 'Finish & view report' : 'Next question'} <Icon name={isLast ? 'FileText' : 'ArrowRight'} size={16} />
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function InterviewPage() {
  const navigate = useNavigate();
  const total = INTERVIEW_QUESTIONS.length;
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [qSeconds, setQSeconds] = useState(0);

  const q = INTERVIEW_QUESTIONS[idx];

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds((s) => s + 1);
      if (!submitted) setQSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [submitted]);

  const submit = () => { if (answer.trim().length) setSubmitted(true); };
  const next = () => {
    if (idx >= total - 1) {
      navigate('/report');
      return;
    }
    setSubmitted(false);
    setAnswer('');
    setQSeconds(0);
    setIdx((i) => i + 1);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center gap-4 border-b border-border px-6 py-3">
        <div className="flex items-center gap-2.5">
          <BrandMark size={28} />
          <Badge tone="neutral" className="hidden sm:inline-flex">
            <Icon name="Briefcase" size={12} /> SAP ABAP · Mid
          </Badge>
        </div>

        <div className="flex flex-1 items-center justify-center gap-3">
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            Q{idx + 1}<span className="opacity-50">/{total}</span>
          </span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={cn('h-1.5 rounded-full transition-all duration-300', i < idx ? 'w-6 bg-primary' : i === idx ? 'w-8 bg-primary' : 'w-6 bg-border')} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 font-mono text-xs tabular-nums text-muted-foreground sm:inline-flex">
            <Icon name="Clock" size={13} /> {fmtTime(seconds)}
          </span>
          <Button variant="danger" size="sm" onClick={() => navigate('/')}>
            <Icon name="Square" size={13} /> End
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto mi-scroll">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="mb-2 flex items-center gap-2">
            <Badge tone="primary"><Icon name="Tag" size={12} /> {q.topic}</Badge>
            <span className="text-xs text-muted-foreground">Question {idx + 1} of {total}</span>
          </div>
          <Card className="border-border/80 shadow-card">
            <div className="flex gap-4 p-6">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                <Icon name="MessageCircleQuestion" size={18} />
              </span>
              <p className="text-[22px] font-medium leading-snug tracking-tight text-foreground text-pretty">{q.prompt}</p>
            </div>
          </Card>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Your answer</label>
              <span className="flex items-center gap-1.5 font-mono text-xs tabular-nums text-muted-foreground">
                <Icon name="Hourglass" size={12} /> {fmtTime(qSeconds)} on this question
              </span>
            </div>
            <Textarea
              rows={7}
              value={answer}
              disabled={submitted}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Talk through your reasoning out loud — structure it as a claim, your reasoning, then a clear recommendation."
              className={submitted ? 'opacity-70' : ''}
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {answer.length} chars · {answer.trim() ? answer.trim().split(/\s+/).length : 0} words
              </span>
              <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                <Icon name="CornerDownLeft" size={12} /> Tip: aim for 60–120 words
              </span>
            </div>
          </div>

          {!submitted && (
            <div className="mt-5 flex items-center gap-3">
              <Button size="lg" className="flex-1" onClick={submit} disabled={!answer.trim().length}>
                Submit answer <Icon name="Send" size={16} />
              </Button>
              <Button variant="secondary" size="lg" onClick={next}>
                Skip <Icon name="SkipForward" size={16} />
              </Button>
            </div>
          )}

          {submitted && <FeedbackCard q={q} onNext={next} isLast={idx >= total - 1} />}
        </div>
      </div>
    </div>
  );
}
