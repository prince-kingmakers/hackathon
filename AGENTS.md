<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Pinned stack

Write code for **these versions only** (canonical source: [`package.json`](package.json)). Do not assume older Next.js / React patterns from general training.

| Package | Version |
|---------|---------|
| `next` | 16.2.4 |
| `react` | 19.2.4 |
| `react-dom` | 19.2.4 |
| `embla-carousel` | 8.6.0 |
| `embla-carousel-react` | 8.6.0 |
| `typescript` | 5.9.3 |
| `eslint` | 9.39.4 |
| `eslint-config-next` | 16.2.4 |
| `tailwindcss` | 4.2.4 |
| `@tailwindcss/postcss` | 4.2.4 |
| `@types/node` | 20.19.39 |
| `@types/react` | 19.2.14 |
| `@types/react-dom` | 19.2.3 |

When versions change, update **both** `package.json` and this table.

## Modern JavaScript & TypeScript

Use **current** language features supported by the pinned TypeScript version (for example `const` / `let`, optional chaining, nullish coalescing, template literals, `async` / `await`, and modern typing patterns). Prefer **arrow functions** for callbacks and most small functions (`const handleClick = () => { ... }`) instead of legacy `function` expressions (`function () { ... }`). Use a `function` declaration only when you need hoisting, generator/async-generator syntax, or a stable function name in stacks; otherwise default to arrows and modern syntax.
