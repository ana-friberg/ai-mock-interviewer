import { z } from 'zod';

export const SessionSettingsSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  company: z.string().optional(),
  seniority: z.enum(['Junior', 'Mid', 'Senior']),
  count: z.coerce.number().int().min(3).max(10).default(5),
  mode: z.enum(['practice', 'real']),
  language: z.enum(['en', 'de']),
});
export type SessionSettings = z.infer<typeof SessionSettingsSchema>;

export const QuestionSchema = z.object({
  id: z.string(),
  topic: z.string(),
  prompt: z.string(),
});
export type Question = z.infer<typeof QuestionSchema>;

export const FeedbackSchema = z.object({
  score: z.number().int().min(1).max(10),
  feedback: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  sampleAnswer: z.string(),
});
export type Feedback = z.infer<typeof FeedbackSchema>;

export const AnswerSubmitSchema = z.object({
  questionId: z.string(),
  answer: z.string().min(1),
  timeSeconds: z.number().optional(),
});
export type AnswerSubmit = z.infer<typeof AnswerSubmitSchema>;

export const AnsweredQuestionSchema = QuestionSchema.extend({
  answer: z.string().optional(),
  timeSeconds: z.number().optional(),
  feedback: FeedbackSchema.optional(),
});
export type AnsweredQuestion = z.infer<typeof AnsweredQuestionSchema>;

export const ReportSchema = z.object({
  overall: z.number().min(0).max(100),
  label: z.string(),
  duration: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  studyTopics: z.array(z.string()),
});
export type Report = z.infer<typeof ReportSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  settings: SessionSettingsSchema,
  questions: z.array(AnsweredQuestionSchema),
  startedAt: z.string(),
  report: ReportSchema.optional(),
});
export type Session = z.infer<typeof SessionSchema>;
