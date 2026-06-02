# JSON Export Schema

```json
{
  "version": 1,
  "exportedAt": "2026-06-02T12:00:00.000Z",
  "portfolio": {
    "id": "uuid",
    "name": "My Portfolio",
    "baseCurrency": "BRL",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-06-02T12:00:00.000Z",
    "fxRates": {
      "base": "BRL",
      "rates": { "USD": 5.20, "EUR": 5.65 },
      "updatedAt": "2026-06-01T00:00:00.000Z"
    },
    "assetClasses": [],
    "contributions": [],
    "settings": {
      "locale": "pt-BR",
      "showAssetLevel": false,
      "investorProfile": "MIXED",
      "strategyTemplate": "moderate"
    }
  }
}
```

## Schema version migration

- `version 1`: initial format with multi-market support
- On import: reject unknown versions with a clear message
- On import of older version: run migrator before saving

## IDs

Use `crypto.randomUUID()` in the browser. Never reuse IDs across imported portfolios.

## FX rate examples

| Base | rates |
|------|-------|
| BRL | `{ USD: 5.20, EUR: 5.65, GBP: 6.60 }` |
| USD | `{ BRL: 0.19, EUR: 1.09, GBP: 1.27 }` |

Rate meaning: `1 unit of foreign currency = rate units of baseCurrency`.
