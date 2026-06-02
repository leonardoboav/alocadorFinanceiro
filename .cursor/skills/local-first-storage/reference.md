# Persistence Details

## Debounced save

```typescript
useEffect(() => {
  if (!portfolio || isLoading) return;
  const t = setTimeout(() => savePortfolio(portfolio), 300);
  return () => clearTimeout(t);
}, [portfolio]);
```

## First-visit detection

```typescript
function needsSetup(): boolean {
  return loadPortfolio() === null;
}
// In /app layout: if (needsSetup()) redirect("/app/setup")
```

## Full reset

```typescript
function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
}
```

## Security rules

- Never use `eval()` in import — only `JSON.parse`
- Never store sensitive credentials
- Import: validate schema before writing
- No analytics without explicit user consent
