---
name: nasa-code-style
description: Refactor or write code following NASA's Power of 10 safety rules adapted for modern languages (Python, JS/TS, Go). Rules about memory management are omitted — modern runtimes handle that. Use when asked to apply NASA coding standards, Power of 10 rules, write production-safe code, or audit code for safety/reliability. Triggers: nasa style, power of 10, nasa rules, production-safe code, nasa coding standards, refactor for safety.
---

# NASA Code Style (Power of 10 — Modern Language Adaptation)

NASA's Power of 10 was written for C. Seven of the ten rules translate directly to Python, JS/TS, and Go. Memory rules (heap vs. stack, use-after-free) are skipped — the runtime handles that.

## The 7 Rules

### 1. No recursion — use iteration
Recursive code creates hard-to-follow control flow and risks stack overflow.

```python
# Bad
def factorial(n): return 1 if n <= 1 else n * factorial(n - 1)

# Good
def factorial(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result
```

```ts
// Bad
function flatten(arr: unknown[]): unknown[] {
    return arr.reduce((acc, v) => Array.isArray(v) ? [...acc, ...flatten(v)] : [...acc, v], []);
}

// Good — iterative with explicit stack
function flatten(arr: unknown[]): unknown[] {
    const stack = [...arr];
    const result: unknown[] = [];
    const MAX = 100_000;
    let iterations = 0;
    while (stack.length > 0 && iterations++ < MAX) {
        const item = stack.pop();
        Array.isArray(item) ? stack.push(...item) : result.push(item);
    }
    return result.reverse();
}
```

### 2. All loops must have a hard upper bound
Every `while` loop needs an explicit max-iteration guard. `for` loops over a finite collection are fine as-is.

```python
MAX_ITER = 10_000

i = 0
while condition and i < MAX_ITER:
    ...
    i += 1
```

```go
const maxIter = 10_000
for i := 0; i < maxIter && condition; i++ { ... }
```

### 3. Functions do one thing, max ~60 lines
A function that fits on one screen can be read, understood, and tested in isolation. If it's longer, split it.

- One clear input → one clear output or side effect
- Helpers are free — make as many as needed
- Deep nesting (3+ levels) signals the function needs splitting

### 4. Declare variables at the narrowest scope
Don't hoist variables to the top of a function if they're only used in one branch.

```python
# Bad
result = None
if condition:
    result = compute()
    log(result)

# Good
if condition:
    result = compute()
    log(result)
```

```ts
// Bad — let at top scope
let user;
if (id) { user = getUser(id); }

// Good
if (id) {
    const user = getUser(id);
    ...
}
```

### 5. Never ignore return values / errors
Every function that can fail must have its result checked. Silently swallowing errors is a critical bug waiting to happen.

**Python** — never bare `except: pass`; always handle or re-raise:
```python
# Bad
try:
    result = risky()
except Exception:
    pass

# Good
try:
    result = risky()
except ValueError as e:
    logger.error("risky failed: %s", e)
    raise
```

**Go** — check every error, always:
```go
result, err := doThing()
if err != nil {
    return fmt.Errorf("doThing: %w", err)
}
```

**JS/TS** — await every promise, catch every rejection:
```ts
const result = await fetch(url).catch((e) => { throw new Error(`fetch failed: ${e}`); });
```

### 6. No runtime feature flags or conditional compilation
Avoid boolean flags that fundamentally change code paths at runtime (equivalent to C's `#ifdef`). Each flag multiplies test surface exponentially.

- Prefer dependency injection or strategy pattern over `if FEATURE_FLAG` scattered through business logic
- If a flag is genuinely needed, isolate it to a single entry point — not spread across 10 files

### 7. Enable strict static analysis and treat warnings as errors
The compiler/linter is a free code reviewer. Use it at maximum strictness.

| Language | Tools |
|----------|-------|
| Python   | `mypy --strict`, `ruff`, `pylint` |
| TypeScript | `"strict": true` in tsconfig, `eslint` with type-aware rules |
| Go | `go vet`, `golangci-lint`, `staticcheck` |
| All | CI must fail on any warning |

## Checklist when reviewing / refactoring

- [ ] No recursive functions
- [ ] Every `while` loop has a `MAX_ITER` guard
- [ ] No function exceeds ~60 lines
- [ ] Variables declared at the scope they're first used
- [ ] Every error/exception/return value is handled explicitly
- [ ] No broad runtime feature flags scattered across business logic
- [ ] Strict linter/type-checker enabled and clean

## Workflow for refactoring existing code

1. Run the static analyzer first — fix all warnings before touching logic
2. Identify functions > 60 lines — split them
3. Find all `while` loops — add bounds
4. Find all recursive calls — rewrite iteratively
5. Grep for bare `except`/`.catch(() => {})` patterns — add explicit handling
6. Re-run static analyzer and unit tests
