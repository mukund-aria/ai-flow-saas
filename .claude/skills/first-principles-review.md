---
name: first-principles-review
description: Run a comprehensive first-principles review after any plan implementation. Catches UX issues, code quality problems, accessibility gaps, and consistency violations BEFORE the user has to find them.
context: fork
agent: general-purpose
---

# First-Principles Review

**MANDATORY:** Run this review after implementing any plan or multi-file change. Do NOT wait for the user to find issues.

## When to Run

- After completing any plan implementation
- After any change touching 3+ files
- After any UI/UX-related change
- Before telling the user "done" or pushing code

## Review Dimensions

### 1. Visual & UX Consistency

- [ ] **Sizing consistency:** No `text-[9px]`, `text-[10px]`, `text-[11px]` — use Tailwind scale (`text-xs` minimum). No `w-3 h-3` icons in main UI (use `w-3.5` or `w-4` minimum).
- [ ] **Spacing consistency:** Similar elements use similar padding/margins. No arbitrary spacing differences between sibling components.
- [ ] **Color consistency:** Use design tokens (`meta.color`, `getRoleColor()`) — no raw hex except in config constants.
- [ ] **Hover states:** Every clickable element has visible hover feedback. Interactive elements use `cursor-pointer`.
- [ ] **Empty states:** Every list/container has a meaningful empty state with a clear CTA.
- [ ] **Loading states:** Async operations show spinners or skeletons.
- [ ] **Error states:** Failed operations show user-visible feedback, not just `console.error`.
- [ ] **Responsive behavior:** Elements don't overflow, truncate with `truncate` class, containers handle variable content.

### 2. Interaction Quality

- [ ] **No dead click handlers:** Every button/clickable element has a working handler. No `onClick={undefined}` rendered.
- [ ] **Mutual exclusion:** Panels, modals, popovers that shouldn't overlap have proper state coordination (opening one closes others).
- [ ] **Destructive actions:** Delete/remove operations have confirmation or undo capability.
- [ ] **Keyboard support:** Modal/panel escape handlers exist. Focus management on open/close.
- [ ] **Feedback on action:** User actions produce visible results (toast, state change, animation).

### 3. Code Quality & Architecture

- [ ] **No code duplication:** Similar patterns extracted into shared components (e.g., slide-over panels, confirmation dialogs).
- [ ] **Reusable components:** Patterns used 3+ times are abstracted. Components are parameterized, not copy-pasted.
- [ ] **Clean imports:** No unused imports. No importing from files that shouldn't be dependencies.
- [ ] **Single responsibility:** Components do one thing. Large components (300+ lines) should be split.
- [ ] **Type safety:** No `any` types. Props interfaces are explicit. Union types for state machines (e.g., `activePanel: 'settings' | 'role' | null`).
- [ ] **Constants centralized:** Magic numbers, z-index values, breakpoints, and "coming soon" lists live in shared constants, not scattered across files.
- [ ] **Consistent naming:** Similar things named similarly. `onClick` vs `onPress` vs `handleClick` — pick one per pattern.
- [ ] **Framework patterns:** Use framework idioms (React hooks, Zustand selectors, Radix primitives) — don't reinvent.

### 4. Scalability & Maintainability

- [ ] **Data-driven config:** Step types, groups, labels come from config/constants — not hardcoded in JSX.
- [ ] **No hardcoded strings:** User-visible text that might change is in constants or config, not inline.
- [ ] **Feature flags:** "Coming soon" features use a shared registry, not per-component checks.
- [ ] **z-index management:** Layered UI uses a centralized z-index scale, not ad-hoc numbers.

### 5. Accessibility

- [ ] **Semantic HTML:** Clickable elements are `<button>` not `<div onClick>`. Links are `<a>`.
- [ ] **Labels:** Form inputs have associated `<label>` elements or `aria-label`.
- [ ] **Title attributes:** Icon-only buttons have `title` or `aria-label`.
- [ ] **Focus visibility:** Interactive elements show focus rings for keyboard navigation.
- [ ] **Color contrast:** Text meets WCAG AA contrast ratios against its background.

### 6. Tooltip & Help Text Discipline

- [ ] **No persistent info icons on main UI:** Headings, buttons, and navigation items should NOT have persistent tooltip trigger icons. Use native `title` attributes for hover hints.
- [ ] **Config form tooltips OK:** FeatureTooltip (persistent info icon) is appropriate ONLY in configuration panels/forms where users need guidance on complex settings.
- [ ] **Tooltip accuracy:** Every tooltip accurately describes the current behavior, not aspirational/outdated behavior.

### 7. Performance

- [ ] **No unnecessary re-renders:** Components that receive callbacks use `useCallback`. Objects/arrays in props are memoized or stable references.
- [ ] **Expensive computations memoized:** `useMemo` for derived data that's costly to compute (filtering, sorting, mapping large lists).
- [ ] **Lazy loading:** Heavy components/pages use `React.lazy()` + `Suspense`. Don't load the entire app upfront.
- [ ] **Code splitting:** Route-level splitting at minimum. Large dialogs/panels loaded on demand.
- [ ] **Prefetching:** Data needed on navigation is prefetched (e.g., `router.prefetch`, hover-triggered fetches). Templates list prefetches on sidebar hover.
- [ ] **Debounced inputs:** Search inputs, auto-save, and resize handlers use debounce (not raw `onChange` hitting APIs).
- [ ] **Virtualization:** Lists with 50+ items use virtual scrolling (`react-virtual`, `tanstack/virtual`).
- [ ] **Image optimization:** Images use proper formats (WebP/AVIF), lazy loading (`loading="lazy"`), and explicit dimensions.
- [ ] **Bundle size:** No importing entire libraries when only one function is needed (e.g., `import { debounce } from 'lodash'` not `import _ from 'lodash'`).
- [ ] **API efficiency:** Batch related API calls. Use SWR/React Query patterns for caching. Don't refetch data already in memory.
- [ ] **Server-side optimization:** API responses include only needed fields. Pagination for large lists. Proper cache headers (`Cache-Control`, `ETag`).
- [ ] **Streaming:** Long operations use SSE/streaming (already used for AI chat). Progress indicators for operations >500ms.
- [ ] **Avoid layout thrashing:** Don't read DOM measurements and write styles in the same frame. CSS transitions use `transform`/`opacity` (GPU-accelerated), not `width`/`height`/`top`/`left`.
- [ ] **Asset loading:** Critical CSS inlined. Fonts use `font-display: swap`. Third-party scripts loaded async.

## How to Run

1. **Grep for known anti-patterns:** `text-[9px]`, `text-[10px]`, `text-[11px]`, `FeatureTooltip` in non-config files, `onClick={undefined}`, `console.error` without UI feedback.
2. **Read each changed file:** Check against the checklist above.
3. **Cross-file consistency:** Components that render the same data (e.g., step cards in StepList vs BranchLayout) should use identical patterns.
4. **Build & type-check:** `npx tsc --noEmit` must pass. `npx vite build` must succeed.
5. **Report findings** with specific file:line references and fixes.

## Output Format

For each issue found:
```
[SEVERITY] file:line — Description
  Current: <what it is now>
  Fix: <what it should be>
```

Severities: CRITICAL (broken), HIGH (poor UX), MEDIUM (inconsistency), LOW (polish)
