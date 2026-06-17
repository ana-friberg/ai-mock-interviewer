# AI Mock Interviewer — Project Instructions

## Stack
- Monorepo with pnpm workspaces
- Backend: Node.js 22, TypeScript, Hono, Zod, @anthropic-ai/sdk
- Frontend: React 19, Vite, TypeScript, Tailwind v4, shadcn/ui, TanStack Query
- Shared types in `packages/shared`

### Backend details
- Node.js 22 LTS (native TypeScript support, native fetch, native `--watch`, native `.env` loading — no dotenv/nodemon/ts-node)
- TypeScript with strict mode
- Hono (not Express) — type-safe, modern, minimal
- Zod for runtime validation of every request/response
- `@anthropic-ai/sdk` official SDK
- Vitest for tests

### Frontend details
- Vite + React 19 with TypeScript
- Tailwind CSS v4 (CSS-first config)
- shadcn/ui for components
- TanStack Query for server state — do not use `useEffect` for fetching
- Zustand for client state only if needed (likely not for v1)
- react-hook-form + Zod for forms

## Code style
- TypeScript strict mode, no `any`
- Named exports, no default exports (except React pages)
- Async/await, never `.then()`
- Functional React components with hooks
- Zod schemas as the single source of truth — derive TS types from them with `z.infer`
- Validate every API input with Zod, never trust client data
- Use TanStack Query for all server state, never `useEffect` for fetching
- Keep components under 150 lines — extract when bigger
- Co-locate: `Component.tsx`, `Component.test.tsx`, `Component.module.css` in same folder
- Tailwind classes via `cn()` utility; no inline styles

## Patterns I want
- API errors return `{ error: { code, message } }` shape
- Frontend never calls Anthropic directly — always through backend
- Streaming responses use Server-Sent Events
- All Claude API calls go through a single `ClaudeService` class with typed methods
- Use Hono's RPC client so frontend gets full type safety on API calls

## Patterns I don't want
- Class components
- Redux or other heavy state libraries
- CSS-in-JS
- Express middleware-style code
- Catching errors just to `console.log` and rethrow
- Comments that just restate the code

## When writing code
- Always check existing patterns in the codebase first
- Suggest the smallest change that solves the problem
- Ask before adding new dependencies
- Prefer composition over abstraction — don't build frameworks
