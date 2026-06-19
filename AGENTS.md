<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Auto-Skills for Portfolio & Website Work

When any task involves creating, editing, or reviewing a **portfolio, website, landing page, UI, or frontend component**, you MUST automatically apply these two skills without waiting to be asked:

1. **frontend-design** (`.claude/skills/frontend-design.md`) — Apply before any visual/UI work. Enforce distinctive design choices, subject-grounded aesthetics, one signature element, and restraint. Reject generic AI defaults (cream+serif, dark+neon, newspaper grid) unless the brief specifically requires them.

2. **react-best-practices** (`.claude/skills/react-best-practices.md`) — Apply to all React/Next.js code. Prioritize: no async waterfalls, minimal bundle, no inline components, primitive effect dependencies, functional setState.

These are not optional suggestions — treat them as project standards for this codebase. The `chrome-devtools` MCP is also available for performance auditing and debugging browser issues.
