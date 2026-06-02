# Component Examples

## Total value display (Dashboard hero)

```tsx
function PortfolioTotal({ value, currency, name }: Props) {
  return (
    <div style={{ marginBottom: "var(--space-6)" }}>
      <p style={{
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        color: "var(--color-text-secondary)",
        letterSpacing: "var(--tracking-wide)",
        textTransform: "uppercase",
        marginBottom: "var(--space-1)",
      }}>
        {name}
      </p>
      <p style={{
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-3xl)",
        letterSpacing: "var(--tracking-tight)",
        color: "var(--color-text-primary)",
        lineHeight: 1.1,
      }}>
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
          {formatCurrency(value, currency)}
        </span>
      </p>
    </div>
  );
}
```

## Deviation indicator (text only, no badge)

```tsx
function DeviationText({ deviationPp }: { deviationPp: number }) {
  const color =
    deviationPp > 2   ? "var(--color-positive)" :
    deviationPp < -2  ? "var(--color-negative)" :
    Math.abs(deviationPp) < 0.5 ? "var(--color-positive)" :
                        "var(--color-warning)";

  const sign = deviationPp >= 0 ? "+" : "−";
  const abs = Math.abs(deviationPp).toFixed(1);

  return (
    <span style={{ fontFamily: "var(--font-mono)", color, fontWeight: 400 }}>
      {sign}{abs}%
    </span>
  );
}
```

## Primary button

```tsx
function PrimaryButton({ children, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "var(--color-text-primary)",
        color: "var(--color-text-inverse)",
        fontFamily: "var(--font-sans)",
        fontWeight: 500,
        fontSize: "var(--text-base)",
        padding: "0.75rem 1.75rem",
        borderRadius: "var(--radius-full)",
        border: "none",
        cursor: "pointer",
        transition: `opacity var(--duration-fast) ease, transform var(--duration-instant) ease`,
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.84")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </button>
  );
}
```

## Asset class table row

```tsx
function ClassRow({ snapshot }: { snapshot: ClassSnapshot }) {
  return (
    <tr>
      <td>
        <span style={{ fontFamily: "var(--font-sans)" }}>{snapshot.name}</span>
        <span className="market-badge" data-market={snapshot.market}>
          {snapshot.market}
        </span>
      </td>
      <td className="number">
        {formatCurrency(snapshot.currentValueInBase, baseCurrency)}
      </td>
      <td className="number">{snapshot.currentPercentage.toFixed(1)}%</td>
      <td className="number">{snapshot.targetPercentage.toFixed(1)}%</td>
      <td className="number">
        <DeviationText deviationPp={snapshot.deviationPp} />
      </td>
    </tr>
  );
}
```

## SVG donut chart (minimal)

```tsx
function DonutChart({ classes, size = 120 }: Props) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 10;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      {classes.map((c, i) => {
        const dash = (c.currentPercentage / 100) * circumference;
        const gap = circumference - dash;
        const segment = (
          <circle
            key={c.classId}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={`var(--chart-${i + 1})`}
            strokeWidth={14}
            strokeDasharray={`${dash - 2} ${gap + 2}`}
            strokeDashoffset={-offset}
            style={{ transition: `stroke-dasharray var(--duration-slow) var(--ease-out)` }}
          />
        );
        offset += dash;
        return segment;
      })}
    </svg>
  );
}
```
