# Token Quick Reference

## CSS custom properties — copy-paste into globals.css

```css
:root {
  /* Typography */
  --font-display: "DM Serif Display", Georgia, serif;
  --font-sans:    "DM Sans", system-ui, sans-serif;
  --font-mono:    "DM Mono", "Fira Code", monospace;

  /* Scale */
  --text-xs:   0.75rem;
  --text-sm:   0.8125rem;
  --text-base: 0.9375rem;
  --text-lg:   1.0625rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.75rem;
  --text-3xl:  2.25rem;
  --text-hero: clamp(3rem, 6vw, 5rem);

  /* Leading / Tracking */
  --leading-tight:   1.1;
  --leading-normal:  1.5;
  --leading-relaxed: 1.7;
  --tracking-tight:  -0.03em;
  --tracking-wide:   0.06em;

  /* Surface */
  --color-bg:             #F5F5F7;
  --color-surface:        #FFFFFF;
  --color-surface-subtle: #FAFAFA;
  --color-border:         #E8E8ED;
  --color-border-strong:  #D1D1D6;

  /* Text */
  --color-text-primary:   #1D1D1F;
  --color-text-secondary: #6E6E73;
  --color-text-tertiary:  #AEAEB2;
  --color-text-inverse:   #FFFFFF;

  /* Accent */
  --color-accent:        #0066CC;
  --color-accent-hover:  #0055B3;
  --color-accent-subtle: #E8F0FB;

  /* Semantic */
  --color-positive: #34C759;
  --color-warning:  #FF9F0A;
  --color-negative: #FF3B30;
  --color-neutral:  #8E8E93;

  /* Chart */
  --chart-1: #0066CC;
  --chart-2: #34C759;
  --chart-3: #FF9F0A;
  --chart-4: #AF52DE;
  --chart-5: #FF3B30;
  --chart-6: #5AC8FA;
  --chart-7: #FF6B35;
  --chart-8: #6E6E73;

  /* Spacing */
  --space-1:  0.5rem;
  --space-2:  1rem;
  --space-3:  1.5rem;
  --space-4:  2rem;
  --space-6:  3rem;
  --space-8:  4rem;
  --space-12: 6rem;
  --space-16: 8rem;

  /* Radii */
  --radius-sm:   0.375rem;
  --radius-md:   0.75rem;
  --radius-lg:   1rem;
  --radius-xl:   1.25rem;
  --radius-full: 9999px;

  /* Motion */
  --duration-instant: 80ms;
  --duration-fast:    150ms;
  --duration-normal:  250ms;
  --duration-slow:    400ms;
  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg:             #000000;
    --color-surface:        #1C1C1E;
    --color-surface-subtle: #2C2C2E;
    --color-border:         #3A3A3C;
    --color-border-strong:  #48484A;
    --color-text-primary:   #FFFFFF;
    --color-text-secondary: #8E8E93;
    --color-text-tertiary:  #636366;
    --color-text-inverse:   #000000;
    --color-accent:        #0A84FF;
    --color-accent-hover:  #409CFF;
    --color-accent-subtle: #0A2540;
  }
}
```

## Tailwind config (if using Tailwind v4)

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        display: ["DM Serif Display", "Georgia", "serif"],
        sans:    ["DM Sans", "system-ui", "sans-serif"],
        mono:    ["DM Mono", "Fira Code", "monospace"],
      },
      colors: {
        brand: {
          bg:      "var(--color-bg)",
          surface: "var(--color-surface)",
          border:  "var(--color-border)",
          accent:  "var(--color-accent)",
          text:    "var(--color-text-primary)",
          muted:   "var(--color-text-secondary)",
        },
        positive: "var(--color-positive)",
        warning:  "var(--color-warning)",
        negative: "var(--color-negative)",
      },
      borderRadius: {
        DEFAULT: "var(--radius-lg)",
        sm:   "var(--radius-sm)",
        md:   "var(--radius-md)",
        xl:   "var(--radius-xl)",
        full: "var(--radius-full)",
      },
    },
  },
};
```
