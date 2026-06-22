import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import {
  QuestionSchema,
  FeedbackSchema,
  ReportSchema,
  type SessionSettings,
  type Question,
  type Feedback,
  type AnsweredQuestion,
  type Report,
} from '@ai-mock-interviewer/shared';

const MODEL = process.env.CLOUDE_MODEL_NAME ?? 'claude-sonnet-4-6';

function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenced) return fenced[1];
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text.trim();
}

function getTextContent(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');
}

const QUESTION_SYSTEM = `You are an expert technical recruiter and senior engineer preparing a targeted mock interview.
Your goal: generate high-quality, specific interview questions that reflect what candidates actually face at this company for this role.`;

const EVAL_SYSTEM = `You are a senior technical interviewer evaluating a candidate's answer with precision and fairness.
Reference the actual content of their answer — be specific, not generic. Be honest about gaps.`;

const REPORT_SYSTEM = `You are a senior technical interviewer writing a final performance report after a mock interview.
Be honest, specific, and actionable. Reference the actual answers and patterns you observed across all questions.`;

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async generateQuestions(settings: SessionSettings, pdfBase64?: string): Promise<Question[]> {
    console.log('[ClaudeService] generateQuestions — model:', MODEL, '| settings:', settings);
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('[ClaudeService] ANTHROPIC_API_KEY is not set!');
    }
    const atCompany = settings.company ? ` at ${settings.company}` : '';
    const languageNote =
      settings.language === 'de'
        ? '\nIMPORTANT: Generate ALL question text (topic and prompt fields) in German.'
        : '';

    const seniorityGuidance =
      settings.seniority === 'Junior'
        ? 'fundamentals, basic concepts, learning mindset'
        : settings.seniority === 'Mid'
          ? 'applied experience, problem-solving, practical tradeoffs'
          : 'architecture decisions, system design, technical leadership, cross-team impact';

    // Build content array — prepend PDF document block if provided
    const userContent: Array<
      | Anthropic.TextBlockParam
      | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string } }
    > = [];

    if (pdfBase64) {
      userContent.push({
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
      });
    }

    userContent.push({
      type: 'text',
      text: `Generate exactly ${settings.count} high-quality interview questions for a ${settings.seniority}-level ${settings.jobTitle}${atCompany}.

${
  settings.company
    ? `Questions should reflect what ${settings.seniority} ${settings.jobTitle} candidates actually face at ${settings.company} — consider their known tech stack, engineering culture, and the type of problems their engineers solve.`
    : `Questions should reflect what ${settings.seniority} ${settings.jobTitle} candidates actually face at top companies — current industry patterns, real-world tradeoffs, and common interview focus areas.`
}

${pdfBase64 ? 'A job requirements PDF is attached above — use it as the primary source of truth for required technologies, responsibilities, and skills.' : ''}

Requirements for the ${settings.count} questions:
- Specific to actual technologies, not generic placeholders
- ${settings.seniority} calibration: focus on ${seniorityGuidance}
- Variety: ~40% technical depth, ~30% system design / problem-solving, ~30% behavioral / situational
- Progressive difficulty within the set
- No trick questions — these should be what a thoughtful interviewer would genuinely ask${languageNote}

Return ONLY valid JSON with no markdown, no code fences, no explanation:
{"questions":[{"id":"q1","topic":"Topic Name","prompt":"Full question text here"}]}`,
    });

    console.log('[ClaudeService] sending request to Anthropic API…');
    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 8096,
      system: QUESTION_SYSTEM,
      messages: [{ role: 'user', content: userContent as Anthropic.ContentBlockParam[] }],
    });

    console.log('[ClaudeService] Anthropic responded, stop_reason:', response.stop_reason);
    const text = getTextContent(response.content);
    console.log('[ClaudeService] raw text (first 300 chars):', text.slice(0, 300));
    const raw = JSON.parse(extractJSON(text)) as { questions: unknown[] };
    return z.array(QuestionSchema).parse(raw.questions);
  }

  async evaluateAnswer(
    question: Question,
    answer: string,
    settings: SessionSettings,
  ): Promise<Feedback> {
    const atCompany = settings.company ? ` at ${settings.company}` : '';
    const languageNote =
      settings.language === 'de'
        ? '\nIMPORTANT: Write ALL feedback text (feedback, strengths, improvements, sampleAnswer) in German.'
        : '';

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      system: EVAL_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Interview context:
- Role: ${settings.seniority} ${settings.jobTitle}${atCompany}
- Topic: ${question.topic}
- Question: ${question.prompt}

Candidate's answer:
"""
${answer}
"""

Scoring rubric (1–10):
1–3: Missing fundamentals or significantly incorrect
4–5: Partial understanding, important gaps
6–7: Solid answer with minor gaps or missed depth
8–9: Strong, well-structured, demonstrates real expertise
10: Exceptional — would stand out in any interview${languageNote}

Return ONLY valid JSON, no markdown:
{"score":7,"feedback":"2–3 sentences of specific, constructive feedback referencing what they actually said","strengths":["specific thing they did well 1","specific thing they did well 2"],"improvements":["specific gap or missed point 1","specific gap or missed point 2"],"sampleAnswer":"What an excellent answer to this specific question would include"}`,
        },
      ],
    });

    const text = getTextContent(response.content);
    return FeedbackSchema.parse(JSON.parse(extractJSON(text)));
  }

  async generateReport(
    questions: AnsweredQuestion[],
    settings: SessionSettings,
    durationSeconds: number,
  ): Promise<Omit<Report, 'duration'>> {
    const atCompany = settings.company ? ` at ${settings.company}` : '';
    const languageNote =
      settings.language === 'de'
        ? '\nIMPORTANT: Write ALL report text in German.'
        : '';

    const answered = questions.filter((q) => q.answer);
    const avgScore =
      answered.length > 0
        ? Math.round(
            (answered.reduce((sum, q) => sum + (q.feedback?.score ?? 0), 0) / answered.length) * 10,
          )
        : 0;

    const questionSummary = questions
      .map((q, i) => {
        const score = q.feedback?.score ?? 'N/A';
        const ans = q.answer
          ? `Answer: ${q.answer.slice(0, 300)}${q.answer.length > 300 ? '…' : ''}`
          : 'Skipped';
        const fb = q.feedback ? `Feedback: ${q.feedback.feedback}` : '';
        return `Q${i + 1}. [${q.topic}] Score: ${score}/10\nQuestion: ${q.prompt}\n${ans}\n${fb}`;
      })
      .join('\n\n---\n\n');

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      system: REPORT_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Session summary:
- Role: ${settings.seniority} ${settings.jobTitle}${atCompany}
- Questions answered: ${answered.length}/${questions.length}
- Average question score: ${avgScore / 10}/10
- Total time: ${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s

Full question-by-question breakdown:
${questionSummary}${languageNote}

Write an honest, specific, actionable performance report. The overall score (0–100) should be calibrated to the scores above: avg ~5/10 → ~50, avg ~7/10 → ~70, etc.

Return ONLY valid JSON, no markdown:
{"overall":76,"label":"One honest sentence summarising the candidate's overall performance","strengths":["specific observed strength 1","specific observed strength 2","specific observed strength 3"],"improvements":["specific area to improve 1","specific area to improve 2","specific area to improve 3"],"studyTopics":["concrete topic to study 1","concrete topic 2","concrete topic 3","concrete topic 4"]}`,
        },
      ],
    });

    const text = getTextContent(response.content);
    return ReportSchema.omit({ duration: true }).parse(JSON.parse(extractJSON(text)));
  }
}
