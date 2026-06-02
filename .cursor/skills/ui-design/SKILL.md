---
name: ui-design
description: >-
  Governs all visual design decisions for this app: typography, color tokens,
  spacing, components, motion, and page-level composition. Apple-influenced
  minimalism — refined, calm, trustworthy. Use when building any UI component,
  page, or layout for the asset allocation app.
disable-model-invocation: true
---

# UI Design

Design language for this product. Every component, page, and micro-interaction must follow this guide.

## Aesthetic direction

**Refined minimal** — the design should feel like a precision instrument, not a dashboard. Inspired by Apple's product pages, SF Pro's type hierarchy, and the restrained clarity of Bloomberg Terminal's successor if designed by Jony Ive.

The investor using this tool is making real financial decisions. The design must earn their trust through:

- Calm, uncluttered surfaces
- Data that breathes (generous whitespace)
- Typography that guides the eye without competing with numbers
- Color that informs, never decorates

**Anti-patterns to reject entirely:**

- Purple/teal gradients on white
- Card grids with drop shadows on every element
- Bold color fills on buttons for every action
- Icon overuse (one icon per concept, or zero)
- AI-generated layouts (equal columns, symmetric padding everywhere)
- Inter, Roboto, or any system-ui font stack

---

## Typography

### Font pairing

```css
/* Display / headings */
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap');

/* Body / UI / numbers */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

/* Monospace / tickers / values */
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');
```

| Role | Font | Weight | Size (rem) |
|------|------|--------|-----------|
| Hero / large heading | DM Serif Display | 400 | 3.5–5 |
| Section heading | DM Serif Display | 400 | 1.75–2.25 |
| Card heading | DM Sans | 500 | 1–1.125 |
| Body | DM Sans | 300–400 | 0.9375 |
| Label / caption | DM Sans | 400 | 0.75–0.8125 |
| Currency value | DM Mono | 300–400 | inherit |
| Percentage | DM Mono | 400 | inherit |
| Ticker / code | DM Mono | 400 | 0.8125 |

**Rule:** all monetary values and percentages use `DM Mono`. This creates instant visual separation between data and labels — a key trust signal.

### Type scale (CSS variables)

```css
--text-xs:   0.75rem;    /* 12px */
--text-sm:   0.8125rem;  /* 13px */
--text-base: 0.9375rem;  /* 15px */
--text-lg:   1.0625rem;  /* 17px — Apple's body size */
--text-xl:   1.25rem;
--text-2xl:  1.75rem;
--text-3xl:  2.25rem;
--text-hero: clamp(3rem, 6vw, 5rem);
```

### Line height and tracking

```css
--leading-tight:  1.1;
--leading-normal: 1.5;
--leading-relaxed: 1.7;

--tracking-tight:  -0.03em;   /* headings */
--tracking-normal:  0;
--tracking-wide:   0.06em;    /* uppercase labels */
```

---

## Color tokens

Light mode is primary. Dark mode supported via `prefers-color-scheme`.

```css
:root {
  /* Surface */
  --color-bg:           #F5F5F7;   /* Apple's off-white */
  --color-surface:      #FFFFFF;
  --color-surface-subtle: #FAFAFA;
  --color-border:       #E8E8ED;
  --color-border-strong: #D1D1D6;

  /* Text */
  --color-text-primary:   #1D1D1F;   /* Apple's near-black */
  --color-text-secondary: #6E6E73;   /* Apple's secondary label */
  --color-text-tertiary:  #AEAEB2;
  --color-text-inverse:   #FFFFFF;

  /* Accent — single, used sparingly */
  --color-accent:       #0066CC;   /* Apple blue */
  --color-accent-hover: #0055B3;
  --color-accent-subtle: #E8F0FB;

  /* Semantic — data only, never decorative */
  --color-positive: #34C759;   /* on-target / above target */
  --color-warning:  #FF9F0A;   /* close to target (±2 p.p.) */
  --color-negative: #FF3B30;   /* below target */
  --color-neutral:  #8E8E93;

  /* Chart palette — order matters, assign by class index */
  --chart-1: #0066CC;
  --chart-2: #34C759;
  --chart-3: #FF9F0A;
  --chart-4: #AF52DE;
  --chart-5: #FF3B30;
  --chart-6: #5AC8FA;
  --chart-7: #FF6B35;
  --chart-8: #6E6E73;

  /* Spacing unit */
  --space-unit: 0.5rem;  /* 8px */
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg:           #000000;
    --color-surface:      #1C1C1E;
    --color-surface-subtle: #2C2C2E;
    --color-border:       #3A3A3C;
    --color-border-strong: #48484A;
    --color-text-primary:   #FFFFFF;
    --color-text-secondary: #8E8E93;
    --color-text-tertiary:  #636366;
    --color-accent:       #0A84FF;
    --color-accent-hover: #409CFF;
    --color-accent-subtle: #0A2540;
  }
}
```

**Color rules:**

- Accent (`--color-accent`) is used only on interactive elements and key CTAs — never as decoration
- Semantic colors (`--color-positive/warning/negative`) are used only to communicate deviation data — never on buttons or backgrounds
- Background is `--color-bg` (off-white), not pure white
- Use opacity variants (`color-mix(in srgb, var(--color-accent) 10%, transparent)`) over fixed tints

---

## Spacing system

Based on 8px grid. All spacing, padding, gap, and margin must be a multiple of `--space-unit`.

```css
--space-1:  0.5rem;   /* 8px */
--space-2:  1rem;     /* 16px */
--space-3:  1.5rem;   /* 24px */
--space-4:  2rem;     /* 32px */
--space-6:  3rem;     /* 48px */
--space-8:  4rem;     /* 64px */
--space-12: 6rem;     /* 96px */
--space-16: 8rem;     /* 128px */
```

Page content max-width: `1080px` (centered). Wide breakpoint: `768px` for two-column, `1024px` for sidebar.

---

## Elevation and depth

No drop shadows on cards. Use border and background contrast instead.

```css
/* Card — preferred */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: var(--space-4);
}

/* Elevated — modals, popovers only */
.elevated {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 1.25rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
}
```

Border radius scale:

```css
--radius-sm:  0.375rem;  /* inputs, tags */
--radius-md:  0.75rem;   /* buttons, small cards */
--radius-lg:  1rem;      /* cards */
--radius-xl:  1.25rem;   /* modals, panels */
--radius-full: 9999px;   /* pills */
```

---

## Components

### Buttons

```css
/* Primary — one per screen max */
.btn-primary {
  background: var(--color-text-primary);  /* black button, not blue */
  color: var(--color-text-inverse);
  font: 500 var(--text-base) / 1 "DM Sans", sans-serif;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  transition: opacity 120ms ease;
}
.btn-primary:hover { opacity: 0.84; }
.btn-primary:active { opacity: 0.7; transform: scale(0.98); }

/* Secondary */
.btn-secondary {
  background: transparent;
  color: var(--color-accent);
  font: 400 var(--text-base) / 1 "DM Sans", sans-serif;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--color-border-strong);
}

/* Ghost / text-only */
.btn-ghost {
  background: transparent;
  color: var(--color-accent);
  padding: 0.5rem 0.75rem;
  border: none;
  font: 400 var(--text-sm) / 1 "DM Sans", sans-serif;
}
```

Rules:
- Primary button is **black** (or white in dark mode) — not accent blue
- Accent blue reserved for text links and ghost buttons
- Never fill a button with semantic colors (green, red)
- One primary CTA visible at a time

### Inputs

```css
.input {
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  font: 400 var(--text-base) / 1 "DM Sans", sans-serif;
  color: var(--color-text-primary);
  width: 100%;
  transition: border-color 120ms ease, box-shadow 120ms ease;
}
.input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 15%, transparent);
}
```

Currency inputs: prepend currency symbol as an inline label, not a floating label.

### Data table

```css
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th {
  font: 400 var(--text-xs) / 1 "DM Sans", sans-serif;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  padding: var(--space-2) var(--space-2);
  border-bottom: 1px solid var(--color-border);
  text-align: left;
}
.data-table td {
  padding: var(--space-2);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-base);
  color: var(--color-text-primary);
}
.data-table td.number {
  font-family: "DM Mono", monospace;
  font-weight: 300;
  text-align: right;
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--color-surface-subtle); }
```

### Deviation badge

```css
.badge-positive { color: var(--color-positive); }
.badge-warning  { color: var(--color-warning); }
.badge-negative { color: var(--color-negative); }
/* No background fill — color only, via DM Mono text */
```

Display format: `+3.1%` or `−2.5%` with the correct unicode minus `−` (U+2212).

### Donut chart

- Use a lightweight SVG donut, not a heavy chart library for the MVP
- Stroke-based SVG circles, no fills inside the donut ring
- Stroke width: `16px` on a `120px` radius circle
- Gap between segments: `2px` (via `stroke-dashoffset`)
- Show target allocation as a thinner, dashed outer ring overlay
- Animate `stroke-dasharray` on mount: 600ms ease-out

### Progress bar (allocation editor)

```css
.allocation-bar {
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.allocation-bar-fill {
  height: 100%;
  background: var(--color-text-primary);
  border-radius: var(--radius-full);
  transition: width 200ms ease;
}
.allocation-bar-fill.over-100 {
  background: var(--color-negative);
}
```

---

## Motion

Less is more. Every animation must justify its existence.

```css
/* Timing tokens */
--duration-instant: 80ms;
--duration-fast:   150ms;
--duration-normal: 250ms;
--duration-slow:   400ms;
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);   /* snappy settle */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* subtle spring */
```

### Permitted animations

| Trigger | Animation | Duration |
|---------|-----------|----------|
| Page mount | Staggered fade+slide up (children, 40ms apart) | 300ms |
| Number change | Cross-fade or count-up | 250ms |
| Donut chart load | `stroke-dasharray` from 0 | 600ms |
| Button press | `scale(0.98)` | 80ms |
| Input focus | Border + shadow expand | 120ms |
| Card hover | None — avoid hover effects on data cards |
| Toast / alert | Slide up from bottom | 250ms |
| Modal open | Scale 0.96 → 1 + opacity 0 → 1 | 200ms |

### Forbidden

- Parallax scrolling
- Infinite looping animations
- Hover transforms on data rows
- Skeleton loaders with shimmer (use opacity pulse only if needed)

---

## Page-level composition rules

### Asymmetry and hierarchy

- Left-align almost everything — center-align only hero headings and empty states
- Dashboard: single-column on mobile; 2-column asymmetric on desktop (2/3 + 1/3)
- Setup wizard: centered, max-width 480px, generous vertical padding
- Portfolio table: full-width, no card wrapper
- Never stack three equal-width columns

### Whitespace

- Section gaps: `var(--space-8)` to `var(--space-12)` between major sections
- Card internal padding: `var(--space-4)` on desktop, `var(--space-3)` on mobile
- Table row height: `56px` minimum
- Nav height: `52px` — hairline bottom border only

### Numbers always monospace

Every currency value, percentage, deviation figure, and count must be rendered in `DM Mono`. No exception. This is the single most impactful typographic decision in a financial tool.

### Market region indicator

For mixed portfolios, show a small flag or region dot next to class names:

```html
<span class="market-badge" data-market="BR">BR</span>
<span class="market-badge" data-market="US">US</span>
```

```css
.market-badge {
  font: 400 var(--text-xs) / 1 "DM Mono", monospace;
  color: var(--color-text-tertiary);
  letter-spacing: 0.04em;
  margin-left: var(--space-1);
}
```

No flag emoji in tables — use text codes only for legibility at small sizes.

---

## Screen-specific guidance

### Home `/`

- Hero text: `DM Serif Display` at `--text-hero`, tracking `−0.03em`
- Subtitle: `DM Sans` 300 weight, `--color-text-secondary`
- Single CTA button (black pill) centered below subtitle
- No hero image — use white space and type only
- Three-step section: horizontal on desktop, vertical on mobile; numbered (`01 02 03`) in DM Mono tertiary color
- Disclaimer: `--text-sm`, `--color-text-tertiary`, max-width 560px, centered

### Dashboard `/app`

- Top: portfolio name + total value in `DM Serif Display` at `2.25rem`
- Investor profile badge (BR / INTL / Mixed) as a small pill next to the name
- Donut chart left, deviation list right (2-column)
- Deviation list: each row is class name + colored percentage, no card border
- "Contribute now" at bottom: a quiet input row with an arrow button, not a full card

### Setup wizard `/app/setup`

- Step indicator: dots or `Step 2 of 7` in `DM Mono`, `--color-text-tertiary`
- Each step: heading + one focused input group; nothing else visible
- Template cards: minimal — name + three key class lines + percentage; selected state = black border, 2px
- Progress: thin bar at top of viewport, `--color-text-primary` fill

### Portfolio `/app/portfolio`

- Sticky header row with column labels
- Table rows: class name (DM Sans) + market badge + all numbers in DM Mono
- Deviation column: color only — no badges, no icons, no background fills
- Edit mode: inline number input slides in on row click

### Contributions `/app/contributions`

- Suggestion table same as portfolio table style
- Before/After: two small donuts side by side, labeled "Now" and "After"
- Confirm button appears only after reviewing the table (not instantly)

---

## What not to do

| Anti-pattern | Why |
|-------------|-----|
| Blue primary button | Reads as generic SaaS — use black |
| Card shadows everywhere | Adds visual noise; use borders |
| Colored section backgrounds | Breaks the calm surface |
| Bold percentage badges with color fill | Too loud for financial data |
| Animation on every interaction | Fatigues the user |
| Inter or system fonts | Generic; undermines trust |
| Equal-width three-column grids | Signals AI template |
| Gradient hero section | Immediately signals "AI-designed" |
| Icon for every nav item | Over-designed; text-only nav is cleaner |
| Horizontal scrolling tables on mobile | Use card-flip layout instead |

## Cross-References

- Routes and pages: [app-screens](../app-screens/SKILL.md)
- Currency formatting: [investment-calculations](../investment-calculations/SKILL.md) `formatCurrency()`

## Resources

- Token reference: [reference.md](reference.md)
- Component examples: [examples.md](examples.md)
