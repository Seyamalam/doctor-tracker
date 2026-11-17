# Doctor Tracker — Project Guide

Secure admin web app for managing doctors and their patients. Spec requires: auth-gated access, doctor/patient CRUD with search/filter/pagination, dashboard analytics, RESTful API, Next.js + Node.js/Express + MongoDB.

## Monorepo layout (npm workspaces)

- `apps/web` — Next.js 16 frontend, `localhost:3001`
- `apps/server` — Express 5 REST API, `localhost:3000` (Node.js runtime via `tsx`)
- `packages/api` — Express routers shared as a workspace package (`createApiRouter(auth)`)
- `packages/auth` — better-auth config (email/password, MongoDB adapter)
- `packages/db` — Mongoose models + `createDb(env)`

## Commands

- `npm run dev` — run all apps (web + server) via vite-plus
- `npm run dev:web` / `npm run dev:server` — run one side
- `npm run check` — format + lint + typecheck; `npm run fix` / `npx ultracite fix`
- `vp test` — Vitest runner (built into vite-plus)

## API conventions (REST, mounted at `/api`)

- `GET /api/health` is public; everything else sits behind `createRequireAuth(auth)` middleware which attaches the better-auth session to `req.session`
- Route files live in `packages/api/src/routes/`; mount them in `routes/index.ts`
- Validate `req.body`/`req.query`/`req.params` with zod `safeParse`; on failure return `400 { error: "Validation failed", issues }`
- Error shape: `{ "error": string }` (optionally `issues`). Use 401 unauthenticated, 404 missing, 201 create, 204 delete
- ALWAYS wrap async handlers in `asyncHandler` from `packages/api/src/lib/async-handler.ts` — oxlint forbids async endpoint handlers and promise-chaining both; the wrapper satisfies both rules

## Web conventions

- UI components come from **ui-sdk** (`@ui-sdk/react` + `@ui-sdk/core`) — headless parts styled with Tailwind; no shadcn in this repo. Before using ui-sdk, follow the `ui-sdk` skill if it's installed, and read `node_modules/@ui-sdk/react/docs/llms.txt`. To build a new component, also search `node_modules/@ui-sdk/react/docs/core.md` by heading, and read `rendering.md` next to it. Import per entry (`@ui-sdk/react/menu`), never a root import.
- Server calls go through `src/lib/api.ts` (`apiFetch` sends `credentials: "include"`); wrap calls in TanStack Query hooks — never raw `fetch` in components
- Forms: `@tanstack/react-form` + zod; toasts via `sonner`
- Env access via `ENV` from `src/env.ts` (varlock-generated; never `process.env` directly)

## Infrastructure

- MongoDB Atlas: project `doctor-tracker`, M0 cluster `doctor-tracker` (AWS us-east-1), db `doctor_tracker`; `DATABASE_URL` lives in `apps/server/.env` — `packages/db` imports it via varlock `@import`
- Auth: better-auth at `/api/auth/*`; sessions are httpOnly cookies (`sameSite: none` for cross-origin dev)

## Installed agent skills

- `.agents/skills/` — emilkowalski UI/animation pack (animate, choreograph, break-ui, emil-design-eng, ask-sonner, animation-performance, improve-animations, find-animation-opportunities, review-animations, remove-animations, pick-ui-library, prototype, etc.). Use `break-ui` to stress-test tables, `emil-design-eng`/`review-animations` before UI reviews.

# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `npx ultracite fix`
- **Check for issues**: `npx ultracite check`
- **Diagnose setup**: `npx ultracite doctor`

Oxlint + Oxfmt (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**

- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**

- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**

- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Oxlint + Oxfmt Can't Help

Oxlint + Oxfmt will catch most mechanical issues automatically. Focus your attention on:

1. **Business logic correctness** - Oxlint + Oxfmt can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Oxlint + Oxfmt. Run `npx ultracite fix` before committing to ensure compliance.
