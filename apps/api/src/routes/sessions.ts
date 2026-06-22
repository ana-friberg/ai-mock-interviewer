import { Hono } from 'hono';
import { AnswerSubmitSchema, SessionSettingsSchema } from '@ai-mock-interviewer/shared';
import { ClaudeService } from '../services/ClaudeService';
import { sessionStore } from '../store';

const claude = new ClaudeService();

export const sessions = new Hono();

sessions.post('/', async (c) => {
  console.log('[sessions] POST / — parsing form data');
  let formData: FormData;
  try {
    formData = await c.req.formData();
  } catch {
    console.error('[sessions] Failed to parse form data');
    return c.json({ error: { code: 'INVALID_INPUT', message: 'Expected multipart form data' } }, 400);
  }

  const raw = {
    jobTitle: formData.get('jobTitle'),
    company: formData.get('company') ?? undefined,
    seniority: formData.get('seniority'),
    count: formData.get('count'),
    mode: formData.get('mode'),
    language: formData.get('language'),
  };
  console.log('[sessions] raw form fields:', raw);

  const parsed = SessionSettingsSchema.safeParse(raw);

  if (!parsed.success) {
    console.error('[sessions] Zod validation failed:', parsed.error.flatten());
    return c.json({ error: { code: 'INVALID_INPUT', message: parsed.error.message } }, 400);
  }
  console.log('[sessions] settings validated:', parsed.data);

  const pdfFile = formData.get('pdf');
  let pdfBase64: string | undefined;
  if (pdfFile instanceof File && pdfFile.size > 0) {
    const buffer = await pdfFile.arrayBuffer();
    pdfBase64 = Buffer.from(buffer).toString('base64');
    console.log(`[sessions] PDF attached: ${pdfFile.name} (${pdfFile.size} bytes)`);
  }

  try {
    console.log('[sessions] calling ClaudeService.generateQuestions…');
    const questions = await claude.generateQuestions(parsed.data, pdfBase64);
    console.log(`[sessions] generated ${questions.length} questions`);
    const session = sessionStore.create({ settings: parsed.data, questions });
    console.log(`[sessions] session created: ${session.id}`);
    return c.json({ session }, 201);
  } catch (err) {
    console.error('[sessions] generation error:', err);
    const message = err instanceof Error ? err.message : 'Failed to generate questions';
    return c.json({ error: { code: 'GENERATION_FAILED', message } }, 500);
  }
});

sessions.get('/', (c) => {
  return c.json({ sessions: sessionStore.list() });
});

sessions.get('/:id', (c) => {
  const session = sessionStore.get(c.req.param('id'));
  if (!session) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Session not found' } }, 404);
  }
  return c.json({ session });
});

sessions.post('/:id/answers', async (c) => {
  const session = sessionStore.get(c.req.param('id'));
  if (!session) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Session not found' } }, 404);
  }

  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'Expected JSON body' } }, 400);
  }

  const parsed = AnswerSubmitSchema.safeParse(raw);
  if (!parsed.success) {
    return c.json({ error: { code: 'INVALID_INPUT', message: parsed.error.message } }, 400);
  }

  const { questionId, answer, timeSeconds } = parsed.data;
  const question = session.questions.find((q) => q.id === questionId);
  if (!question) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Question not found' } }, 404);
  }

  try {
    const feedback = await claude.evaluateAnswer(question, answer, session.settings);
    const updatedQuestions = session.questions.map((q) =>
      q.id === questionId ? { ...q, answer, timeSeconds, feedback } : q,
    );
    sessionStore.update(session.id, { questions: updatedQuestions });
    return c.json({ feedback });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to evaluate answer';
    return c.json({ error: { code: 'EVALUATION_FAILED', message } }, 500);
  }
});

sessions.get('/:id/report', async (c) => {
  const session = sessionStore.get(c.req.param('id'));
  if (!session) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Session not found' } }, 404);
  }

  if (session.report) {
    return c.json({ report: session.report });
  }

  const durationSeconds = Math.round(
    (Date.now() - new Date(session.startedAt).getTime()) / 1000,
  );
  const minutes = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;
  const duration = `${minutes}m ${secs}s`;

  try {
    const partial = await claude.generateReport(session.questions, session.settings, durationSeconds);
    const report = { ...partial, duration };
    sessionStore.update(session.id, { report });
    return c.json({ report });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate report';
    return c.json({ error: { code: 'REPORT_FAILED', message } }, 500);
  }
});
