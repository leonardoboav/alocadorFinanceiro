# Simulation Examples

## Scenario A — Monthly R$ 500 × 12 months (Mixed portfolio)

Using mixed portfolio from investment-calculations/examples.md.

Expected: by month 12, FIIs and Commodities deficits should approach zero or flip positive.

Test assertion: `summary.maxDeviationPp` at month 12 < `maxDeviationPp` at month 0.

---

## Scenario B — Single vs recurring comparison

| | Scenario A | Scenario B |
|-|-----------|-----------|
| Mode | Single R$ 1,200 | R$ 200/month × 6 months |
| Total | R$ 1,200 | R$ 1,200 |
| Final allocation | Same total, different path | More balanced per month |

The recurring scenario tends to produce smoother rebalancing because each month re-evaluates deficits against the updated state.

---

## Scenario C — 100% International (USD base)

- Monthly $500 × 12 months
- Portfolio: US Stocks 40% / Global Stocks 25% / Bonds 20% / REITs 10% / Commodities 5%
- Expected: classes below target receive priority contributions each month

---

## MVP limitation note

Simulation does NOT model asset price changes. All growth comes from new contributions. Document this in the UI.
