---
name: react-best-practices
description: React and Next.js performance optimization rules from Vercel Engineering. AUTO-TRIGGER when writing, reviewing, or refactoring React/Next.js components in portfolio or website projects. Covers waterfalls, bundle size, SSR, re-renders, and advanced patterns.
metadata:
  type: skill
  triggers:
    - React component
    - Next.js
    - portfolio
    - website
    - data fetching
    - bundle
    - performance
---

# Vercel React Best Practices

70 rules across 8 categories. Apply these whenever writing or reviewing React/Next.js code in portfolio or website projects.

## Priority Order

| Priority | Category | Impact |
|----------|----------|--------|
| 1 | Eliminating Waterfalls | CRITICAL |
| 2 | Bundle Size Optimization | CRITICAL |
| 3 | Server-Side Performance | HIGH |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH |
| 5 | Re-render Optimization | MEDIUM |
| 6 | Rendering Performance | MEDIUM |
| 7 | JavaScript Performance | LOW-MEDIUM |
| 8 | Advanced Patterns | LOW |

## 1. Eliminating Waterfalls (CRITICAL)

- `async-cheap-condition-before-await` — Check cheap sync conditions before awaiting flags or remote values
- `async-defer-await` — Move await into branches where actually used
- `async-parallel` — Use `Promise.all()` for independent async operations
- `async-api-routes` — Start promises early, await late in API routes
- `async-suspense-boundaries` — Use Suspense to stream content progressively

## 2. Bundle Size Optimization (CRITICAL)

- `bundle-barrel-imports` — Import directly from source, avoid barrel/index files
- `bundle-analyzable-paths` — Prefer statically analyzable import paths
- `bundle-dynamic-imports` — Use `next/dynamic` for heavy components
- `bundle-defer-third-party` — Load analytics/logging after hydration
- `bundle-conditional` — Load modules only when feature is activated
- `bundle-preload` — Preload on hover/focus for perceived speed

## 3. Server-Side Performance (HIGH)

- `server-cache-react` — Use `React.cache()` for per-request deduplication
- `server-cache-lru` — Use LRU cache for cross-request caching
- `server-hoist-static-io` — Hoist static I/O (fonts, logos) to module level
- `server-no-shared-module-state` — Never use module-level mutable state in RSC/SSR
- `server-parallel-fetching` — Restructure components to parallelize fetches
- `server-after-nonblocking` — Use `after()` for non-blocking post-response work

## 4. Client-Side Data Fetching (MEDIUM-HIGH)

- `client-swr-dedup` — Use SWR for automatic request deduplication
- `client-passive-event-listeners` — Use passive listeners for scroll events
- `client-localstorage-schema` — Version and minimize localStorage data

## 5. Re-render Optimization (MEDIUM)

- `rerender-memo` — Extract expensive work into memoized components
- `rerender-dependencies` — Use primitive dependencies in effects
- `rerender-derived-state-no-effect` — Derive state during render, not in effects
- `rerender-functional-setstate` — Use functional `setState` for stable callbacks
- `rerender-lazy-state-init` — Pass function to `useState` for expensive initial values
- `rerender-no-inline-components` — Never define components inside components
- `rerender-transitions` — Use `startTransition` for non-urgent updates

## 6. Rendering Performance (MEDIUM)

- `rendering-content-visibility` — Use `content-visibility` for long lists
- `rendering-hoist-jsx` — Extract static JSX outside components
- `rendering-hydration-no-flicker` — Use inline script for client-only data
- `rendering-conditional-render` — Use ternary, not `&&` for conditionals
- `rendering-resource-hints` — Use React DOM resource hints for preloading

## 7. JavaScript Performance (LOW-MEDIUM)

- `js-index-maps` — Build Map for repeated lookups instead of repeated find()
- `js-combine-iterations` — Combine multiple filter/map into one loop
- `js-early-exit` — Return early from functions
- `js-set-map-lookups` — Use Set/Map for O(1) lookups

## 8. Advanced Patterns (LOW)

- `advanced-event-handler-refs` — Store event handlers in refs for stable references
- `advanced-init-once` — Initialize app-level state once per app load
