import type { Session, Feedback, Report, AnswerSubmit } from '@ai-mock-interviewer/shared';

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

type ApiErrorBody = { code: string; message: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok || 'error' in json) {
    const err = json['error'] as ApiErrorBody | undefined;
    throw new Error(err?.message ?? `Request failed with status ${res.status}`);
  }
  return json as T;
}

export const api = {
  createSession(formData: FormData): Promise<Session> {
    return request<{ session: Session }>('/api/sessions', {
      method: 'POST',
      body: formData,
    }).then((r) => r.session);
  },

  getSession(id: string): Promise<Session> {
    return request<{ session: Session }>(`/api/sessions/${id}`).then((r) => r.session);
  },

  getSessions(): Promise<Session[]> {
    return request<{ sessions: Session[] }>('/api/sessions').then((r) => r.sessions);
  },

  submitAnswer(sessionId: string, data: AnswerSubmit): Promise<Feedback> {
    return request<{ feedback: Feedback }>(`/api/sessions/${sessionId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.feedback);
  },

  getReport(sessionId: string): Promise<Report> {
    return request<{ report: Report }>(`/api/sessions/${sessionId}/report`).then((r) => r.report);
  },
};
