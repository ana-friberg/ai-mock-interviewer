# AI Mock Interviewer

An AI-powered mock interview tool that helps you practice for technical and professional job interviews.

## What it does

- **Setup** — configure the session by role (e.g. SAP ABAP Developer), seniority level (Junior / Mid / Senior), language, number of questions, and feedback mode
- **Interview** — answer questions one by one with a built-in timer
- **Feedback** — receive per-answer feedback (Practice mode) or a full report at the end (Real mode)
- **History** — review past interview sessions

The AI generates role-specific interview questions and evaluates your answers, highlighting strengths and areas to improve.

## Status

> **Work in progress** — currently only the frontend is implemented (with mock data). The backend (Hono API + Claude AI integration) is not yet built.

## Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend (planned):** Node.js 22, Hono, Zod, `@anthropic-ai/sdk`

## Getting started

```bash
pnpm install
pnpm --filter web dev
```
