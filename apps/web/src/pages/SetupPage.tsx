import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Label, Input } from '../components/ui/Input';
import { Segmented } from '../components/ui/Segmented';
import { Select } from '../components/ui/Select';
import { Slider } from '../components/ui/Slider';
import { Wordmark } from '../components/ui/BrandMark';
import { Icon } from '../components/Icon';
import { cn } from '../lib/utils';
import { ROLE_SUGGESTIONS } from '../data/mockData';

function ScreenChrome({ right, children, scroll = false }: { right?: React.ReactNode; children: React.ReactNode; scroll?: boolean }) {
  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-3.5">
        <Wordmark />
        <div className="flex items-center gap-2">{right}</div>
      </header>
      <div className={cn('flex-1', scroll && 'overflow-y-auto mi-scroll')}>{children}</div>
    </div>
  );
}

interface ModeCardProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  desc: string;
}

function ModeCard({ active, onClick, icon, title, desc }: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-all duration-150',
        active ? 'border-primary bg-accent/60 ring-1 ring-primary/30' : 'border-border bg-card hover:border-border hover:bg-muted'
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className={cn('grid h-8 w-8 place-items-center rounded-lg', active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
          <Icon name={icon} size={16} />
        </span>
        <span className={cn('grid h-4 w-4 place-items-center rounded-full border transition-colors', active ? 'border-primary bg-primary' : 'border-border')}>
          {active && <Icon name="Check" size={11} className="text-primary-foreground" strokeWidth={3} />}
        </span>
      </div>
      <span className="mt-1 text-sm font-medium text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">{desc}</span>
    </button>
  );
}

export default function SetupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('SAP ABAP Developer');
  const [seniority, setSeniority] = useState('Mid');
  const [language, setLanguage] = useState('en');
  const [count, setCount] = useState(5);
  const [mode, setMode] = useState('practice');

  return (
    <ScreenChrome right={<Badge tone="neutral"><Icon name="History" size={13} /> 6 past sessions</Badge>}>
      <div className="grid-paper min-h-full">
        <div className="mx-auto flex min-h-full max-w-xl flex-col justify-center px-6 pt-6 pb-14">
          <div className="mb-4 text-center">
            <Badge tone="primary" className="mb-2"><Icon name="Sparkles" size={13} /> AI-guided practice</Badge>
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Set up your interview</h1>
            <p className="mx-auto mt-2 max-w-sm text-[15px] text-muted-foreground">Tune the session to the role you're preparing for. You can change everything later.</p>
          </div>

          <Card className="shadow-card">
            <CardContent className="space-y-7 pt-6">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" icon="Briefcase" list="roles" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. SAP ABAP Developer" />
                <datalist id="roles">{ROLE_SUGGESTIONS.map((r) => <option key={r} value={r} />)}</datalist>
              </div>

              <div className="space-y-2.5">
                <Label>Seniority</Label>
                <Segmented
                  value={seniority}
                  onChange={setSeniority}
                  options={[{ value: 'Junior', label: 'Junior' }, { value: 'Mid', label: 'Mid' }, { value: 'Senior', label: 'Senior' }]}
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={language}
                    onChange={setLanguage}
                    options={[
                      { value: 'en', label: 'English', icon: 'Languages' },
                      { value: 'de', label: 'German', icon: 'Languages' },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Questions</Label>
                    <span className="font-mono text-xs tabular-nums text-primary">{count}</span>
                  </div>
                  <div className="pt-2.5"><Slider min={3} max={10} value={count} onChange={setCount} /></div>
                </div>
              </div>

              <div className="space-y-2.5">
                <Label>Feedback mode</Label>
                <div className="grid grid-cols-2 gap-3">
                  <ModeCard active={mode === 'practice'} onClick={() => setMode('practice')} icon="MessageSquareText" title="Practice" desc="Feedback after every answer" />
                  <ModeCard active={mode === 'real'} onClick={() => setMode('real')} icon="Timer" title="Real" desc="One report at the very end" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button size="lg" className="mt-6 w-full" onClick={() => navigate('/interview')}>
            Start interview <Icon name="ArrowRight" size={18} />
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {count} questions · approx. {Math.round(count * 3.5)} min · {mode === 'practice' ? 'Practice mode' : 'Real mode'}
          </p>
        </div>
      </div>
    </ScreenChrome>
  );
}
