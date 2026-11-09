# Questline Frontend

Next.js frontend for Questline, a personal goal tracker built as skill trees. The API is the FastAPI app in the separate `questline-backend` repo.

## Architecture rules

- **No server-side rendering of data.** Pages are client components that fetch in the browser with TanStack Query. Next.js provides routing and the page shell only.
- **No Next.js API routes or server actions.** FastAPI owns all data and logic, and may be deployed separately from this app.
- **Every API call and response type lives in `src/lib/api.ts`.** Components never call `fetch` directly. The browser calls the backend at `NEXT_PUBLIC_API_URL`, set locally in a git-ignored `.env.local` (`http://localhost:8000`) and read nowhere else.
- **Show the backend's `detail` message** when a request fails, next to whatever caused it.

## Working style

- One milestone at a time, scoped by `TASK.md` before implementation starts.
- Each implementation slice is one commit, and the app runs at every commit.
- **No tests.** Don't write tests or add test tooling to this repo. Verify changes by running the app.
- pnpm is the package manager (`pnpm add`, `pnpm dev`); do not use npm or Yarn here.
- Next.js 16 differs from older versions; check `node_modules/next/dist/docs/` before relying on an API.
