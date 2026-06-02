# Numeric Examples (use as unit test cases)

## Mixed portfolio — base currency BRL

FX rates: `{ USD: 5.20 }`

| Class | Market | Native value | In BRL | Target |
|-------|--------|-------------|--------|--------|
| Fixed Income | BR | R$ 40,000 | R$ 40,000 | 30% |
| Brazilian Stocks | BR | R$ 30,000 | R$ 30,000 | 25% |
| FIIs | BR | R$ 15,000 | R$ 15,000 | 15% |
| US Stocks | US | $5,769 USD | R$ 30,000 | 25% |
| Commodities | GLOBAL | $961 USD | R$ 5,000 | 5% |
| **Total** | | | **R$ 120,000** | **100%** |

### Snapshots

| Class | currentPct | targetPct | deviationPp | deficit |
|-------|-----------|-----------|-------------|---------|
| Fixed Income | 33.3% | 30% | +3.3 | 0 |
| BR Stocks | 25% | 25% | 0 | 0 |
| FIIs | 12.5% | 15% | −2.5 | R$ 3,000 |
| US Stocks | 25% | 25% | 0 | 0 |
| Commodities | 4.2% | 5% | −0.8 | R$ 1,000 |

---

## Contribution R$ 5,000 (projected total R$ 125,000)

Projected targets:

| Class | Projected target | Current | Deficit |
|-------|-----------------|---------|---------|
| Fixed Income | R$ 37,500 | R$ 40,000 | 0 |
| BR Stocks | R$ 31,250 | R$ 30,000 | R$ 1,250 |
| FIIs | R$ 18,750 | R$ 15,000 | R$ 3,750 |
| US Stocks | R$ 31,250 | R$ 30,000 | R$ 1,250 |
| Commodities | R$ 6,250 | R$ 5,000 | R$ 1,250 |

Sum deficits = R$ 7,500 > R$ 5,000 → proportional distribution:

| Class | Allocation |
|-------|-----------|
| BR Stocks | 5,000 × (1,250/7,500) = R$ 833.33 |
| FIIs | 5,000 × (3,750/7,500) = R$ 2,500.00 |
| US Stocks | 5,000 × (1,250/7,500) = R$ 833.33 |
| Commodities | 5,000 × (1,250/7,500) = R$ 833.34 ← penny correction |

---

## 100% International portfolio — base currency USD

FX rates: none needed (all assets in USD)

| Class | Value USD | Target |
|-------|-----------|--------|
| US Stocks | $40,000 | 40% |
| Global Stocks | $25,000 | 25% |
| US Bonds | $20,000 | 20% |
| REITs | $10,000 | 10% |
| Commodities | $5,000 | 5% |
| **Total** | **$100,000** | **100%** |

### Contribution $2,000 — all aligned → distribute by target

| Class | Allocation |
|-------|-----------|
| US Stocks | $800 |
| Global Stocks | $500 |
| US Bonds | $400 |
| REITs | $200 |
| Commodities | $100 |

---

## Edge cases

- **Zero portfolio + R$ 500 contribution (target 50/30/20)**: allocate R$ 250 / R$ 150 / R$ 100
- **Invalid FX**: `toBase(1000, "GBP", { base: "BRL", rates: { USD: 5.20 } })` → throws "Missing FX rate for GBP"
- **Target sum 95%**: `validateTargetPercentages` → `{ valid: false, sum: 95, error: "..." }`
