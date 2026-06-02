---
name: local-first-storage
description: >-
  Persists the portfolio in the browser (localStorage), handles JSON export and
  import, and manages backup without a login. Use when implementing the storage
  layer, usePortfolio hook, /app/data, /app/settings, or privacy page copy.
disable-model-invocation: true
---

# Local-First Storage

No backend in v1. All data stays on the user's device.

## When to use

- Implementing `src/lib/storage/`
- `usePortfolio()` hook with load/save
- Pages `/app/data` (export/import) and `/app/settings`
- Privacy page copy in `/privacy`

## Storage keys and envelope

```typescript
const STORAGE_KEY = "skl_portfolio_v1";
const SCHEMA_VERSION = 1;

interface StoredData {
  version: number;
  portfolio: Portfolio | null;
  lastSavedAt: string;  // ISO 8601
}
```

## Required API

```typescript
function loadPortfolio(): Portfolio | null;
function savePortfolio(portfolio: Portfolio): void;
function exportPortfolioJson(portfolio: Portfolio): Blob;
function importPortfolioJson(
  json: string
): { ok: true; portfolio: Portfolio } | { ok: false; error: string };
function clearAllData(): void;
function hasPortfolio(): boolean;
function needsSetup(): boolean;  // !hasPortfolio()
```

## MVP choice: localStorage

- Sufficient for a personal portfolio (< few MB)
- Synchronous, simple React state integration
- Migrate to IndexedDB in v2 if contribution history grows large

## Import flow

1. `JSON.parse(rawString)`
2. Validate `version` and full schema (Zod)
3. `validateTargetPercentages()` on imported classes
4. `validateFxRates()` — ensure all asset currencies have a rate
5. Confirm overwrite: "This will replace the portfolio in this browser."
6. `savePortfolio()` → redirect to dashboard

## Export

- Filename: `portfolio-backup-YYYY-MM-DD.json`
- Include `exportedAt` and `version` in envelope
- See [portfolio-data-model reference.md](../portfolio-data-model/reference.md) for schema

## Error handling

| Error | UX |
|-------|-----|
| Quota exceeded | "Not enough browser storage. Export and clear old data." |
| Invalid JSON | "Invalid file. Use a backup exported from this app." |
| Invalid schema | List fields with problems |
| Unknown version | "This backup was created with a newer version of the app." |
| No data | Redirect to `/app/setup` |

## `usePortfolio` hook

```typescript
function usePortfolio() {
  // Load on mount
  // Save on debounced portfolio change (300ms)
  // Return:
  // { portfolio, setPortfolio, isLoading, exportJson, importJson, reset }
}
```

## Required UI copy

- "Your data stays in this browser."
- "Export a backup regularly in Data & Backup."
- "Clearing browser data in this version will erase your portfolio."

## Cross-References

- Domain model: [portfolio-data-model](../portfolio-data-model/SKILL.md)
- Backup screen spec: [app-screens](../app-screens/SKILL.md)

## Resources

- Persistence flow details: [reference.md](reference.md)
