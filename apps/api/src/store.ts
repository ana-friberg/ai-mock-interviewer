import { randomUUID } from 'node:crypto';
import type { Session } from '@ai-mock-interviewer/shared';

const sessions = new Map<string, Session>();

export const sessionStore = {
  create(data: Omit<Session, 'id' | 'startedAt'>): Session {
    const session: Session = {
      ...data,
      id: randomUUID(),
      startedAt: new Date().toISOString(),
    };
    sessions.set(session.id, session);
    return session;
  },

  get(id: string): Session | undefined {
    return sessions.get(id);
  },

  update(id: string, data: Partial<Omit<Session, 'id' | 'startedAt'>>): Session | undefined {
    const session = sessions.get(id);
    if (!session) return undefined;
    const updated: Session = { ...session, ...data };
    sessions.set(id, updated);
    return updated;
  },

  list(): Session[] {
    return [...sessions.values()].sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );
  },
};
