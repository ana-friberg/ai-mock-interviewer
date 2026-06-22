import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Textarea } from '../components/ui/Input';
import { BrandMark } from '../components/ui/BrandMark';
import { ScoreDots } from '../components/ui/Score';
import { Icon } from '../components/Icon';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import type { Feedback, Question } from '@ai-mock-interviewer/shared';

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
  feedback: Feedback;
  onNext: () => void;
  isLast: boolean;
}

function FeedbackCard({ feedback, onNext, isLast }: FeedbackCardProps) {
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
            <ScoreDots score={feedback.score} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-semibold tabular-nums leading-none text-foreground">{feedback.score}</span>
            <span className="text-sm text-muted-foreground">/ 10</span>
          </div>
        </div>
        <div className="space-y-5 p-6">
          <p className="text-[15px] leading-relaxed text-foreground text-pretty">{feedback.feedback}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FeedbackList tone="success" icon="ThumbsUp" title="What worked" items={feedback.strengths} />
            <FeedbackList tone="warning" icon="Lightbulb" title="To improve" items={feedback.improvements} />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <button
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => {
              const el = document.getElementById('sample-answer');
              el?.classList.toggle('hidden');
            }}
          >
            <Icon name="BookOpen" size={15} /> See a model answer
          </button>
          <Button onClick={onNext}>
            {isLast ? 'Finish & view report' : 'Next question'} <Icon name={isLast ? 'FileText' : 'ArrowRight'} size={16} />
          </Button>
        </div>
        <div id="sample-answer" className="hidden border-t border-border bg-muted/30 px-6 py-4">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Model answer</p>
          <p className="text-sm leading-relaxed text-foreground text-pretty">{feedback.sampleAnswer}</p>
        </div>
      </Card>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-center">
        <Icon name="Loader" size={32} className="animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your interview…</p>
      </div>
    </div>
  );
}

function EvaluatingState() {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/40 px-4 py-3.5 text-sm text-muted-foreground">
        <Icon name="Loader" size={15} className="animate-spin text-primary shrink-0" />
        Claude is evaluating your answer…
      </div>
    </div>
  );
}

export default function InterviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const { data: session, isLoading, isError } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => api.getSession(sessionId!),
    enabled: !!sessionId,
  });

  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedbacks, setFeedbacks] = useState<Record<string, Feedback>>({});
  const [seconds, setSeconds] = useState(0);
  const [qSeconds, setQSeconds] = useState(0);

  const questions = session?.questions ?? [];
  const total = questions.length;
  const question: Question | undefined = questions[idx];
  const currentFeedback = question ? feedbacks[question.id] : undefined;
  const submitted = !!currentFeedback;

  const submitAnswer = useMutation({
    mutationFn: (data: { questionId: string; answer: string; timeSeconds: number }) =>
      api.submitAnswer(sessionId!, data),
    onSuccess: (feedback, variables) => {
      setFeedbacks((prev) => ({ ...prev, [variables.questionId]: feedback }));
    },
  });

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds((s) => s + 1);
      if (!submitted && !submitAnswer.isPending) setQSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [submitted, submitAnswer.isPending]);

  const handleSubmit = () => {
    if (answer.trim() && question && !submitAnswer.isPending) {
      submitAnswer.mutate({ questionId: question.id, answer: answer.trim(), timeSeconds: qSeconds });
    }
  };

  const handleNext = () => {
    if (idx >= total - 1) {
      navigate(`/report/${sessionId}`);
      return;
    }
    setAnswer('');
    setQSeconds(0);
    setIdx((i) => i + 1);
  };

  const handleSkip = () => {
    if (idx >= total - 1) {
      navigate(`/report/${sessionId}`);
      return;
    }
    setAnswer('');
    setQSeconds(0);
    setIdx((i) => i + 1);
  };

  if (isLoading) return <LoadingState />;

  if (isError || !session || !question) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <Icon name="AlertCircle" size={32} className="text-destructive" />
          <p className="text-sm text-muted-foreground">Failed to load session.</p>
          <Button variant="secondary" size="sm" onClick={() => navigate('/')}>Back to setup</Button>
        </div>
      </div>
    );
  }

  const { settings } = session;
  const roleLabel = `${settings.jobTitle}${settings.company ? ` · ${settings.company}` : ''} · ${settings.seniority}`;

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center gap-4 border-b border-border px-6 py-3">
        <div className="flex items-center gap-2.5">
          <BrandMark size={28} />
          <Badge tone="neutral" className="hidden sm:inline-flex">
            <Icon name="Briefcase" size={12} /> {roleLabel}
          </Badge>
        </div>

        <div className="flex flex-1 items-center justify-center gap-3">
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            Q{idx + 1}<span className="opacity-50">/{total}</span>
          </span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: total }, (_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i < idx
                    ? 'w-6 bg-primary'
                    : i === idx
                      ? 'w-8 bg-primary'
                      : 'w-6 bg-border',
                )}
              />
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
            <Badge tone="primary"><Icon name="Tag" size={12} /> {question.topic}</Badge>
            <span className="text-xs text-muted-foreground">Question {idx + 1} of {total}</span>
          </div>
          <Card className="border-border/80 shadow-card">
            <div className="flex gap-4 p-6">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                <Icon name="MessageCircleQuestion" size={18} />
              </span>
              <p className="text-[22px] font-medium leading-snug tracking-tight text-foreground text-pretty">{question.prompt}</p>
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
              disabled={submitted || submitAnswer.isPending}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Talk through your reasoning — structure it as a claim, your reasoning, then a clear recommendation."
              className={submitted || submitAnswer.isPending ? 'opacity-70' : ''}
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {answer.length} chars · {answer.trim() ? answer.trim().split(/\s+/).length : 0} words
              </span>
              <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                <Icon name="CornerDownLeft" size={12} /> Aim for 60–120 words
              </span>
            </div>
          </div>

          {submitAnswer.isPending && <EvaluatingState />}

          {!submitted && !submitAnswer.isPending && (
            <div className="mt-5 flex items-center gap-3">
              <Button size="lg" className="flex-1" onClick={handleSubmit} disabled={!answer.trim()}>
                Submit answer <Icon name="Send" size={16} />
              </Button>
              <Button variant="secondary" size="lg" onClick={handleSkip}>
                Skip <Icon name="SkipForward" size={16} />
              </Button>
            </div>
          )}

          {submitted && currentFeedback && (
            <FeedbackCard feedback={currentFeedback} onNext={handleNext} isLast={idx >= total - 1} />
          )}
        </div>
      </div>
    </div>
  );
}
