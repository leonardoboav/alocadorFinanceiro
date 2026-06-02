# MVP Checklist

## Functional

- [ ] Setup creates a valid portfolio with base currency and at least one class
- [ ] Dashboard shows total value and top deviations
- [ ] Allocation editor validates sum = 100%
- [ ] Contributions suggest, preview, and confirm
- [ ] FX rates can be set in Settings
- [ ] FX rates applied when contributing in foreign currency
- [ ] Export/import JSON works
- [ ] Reset clears all data

## Multi-market

- [ ] BR-only profile shows only BR classes by default
- [ ] INTL-only profile shows only international classes by default
- [ ] Mixed profile shows both
- [ ] Market flag/badge displayed on all class rows
- [ ] Stale FX rate warning shown when rates are > 7 days old
- [ ] `toBase()` called for all non-base-currency assets before calculations

## UX

- [ ] Home explains value in < 10 seconds
- [ ] Currency formatted correctly (BRL for BR, USD for INTL, etc.)
- [ ] Disclaimers visible (not investment advice)
- [ ] Mobile usable

## Technical

- [ ] Pure calc functions + tests against examples.md
- [ ] Debounced save (300ms)
- [ ] Redirect to setup if no portfolio
- [ ] No `eval()` in import

## Post-MVP (v1)

- [ ] Asset-level detail within classes
- [ ] History with deviation chart over time
- [ ] Simulator — recurring contributions
- [ ] Auto FX rate fetch (optional)

## Post-MVP (v2)

- [ ] Optional login
- [ ] Cross-device sync
- [ ] Automated quotes
