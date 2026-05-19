import { useState, useMemo } from "react";

// Shared helpers
const fmtCompact = (n) => {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return v.toFixed(0);
};

const fmtPeso = (n) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

/* ──────────────────────────────────────────────────────────────────────────
 * AreaChart — single-series filled line with axis labels & gridlines
 * Props: data: [{ label, value }], height, color
 * ──────────────────────────────────────────────────────────────────────── */
export function AreaChart({ data = [], height = 180, color = "#D4A93C", formatter }) {
  const [hover, setHover] = useState(null);
  if (!data.length) return <div style={{ height }} className="skeleton rounded-2xl" />;

  const W = 600;
  const H = height;
  const padL = 36;
  const padR = 8;
  const padT = 8;
  const padB = 22;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const values = data.map((d) => Number(d.value) || 0);
  const max = Math.max(...values, 1);
  const step = data.length > 1 ? innerW / (data.length - 1) : innerW;
  const points = data.map((d, i) => {
    const x = padL + i * step;
    const y = padT + innerH - (Number(d.value) / max) * innerH;
    return [x, y];
  });
  const path = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const area = `${path} L${padL + innerW},${padT + innerH} L${padL},${padT + innerH} Z`;

  // 4 horizontal gridlines
  const gridY = [0, 0.25, 0.5, 0.75, 1].map((t) => padT + innerH * (1 - t));
  const gridLabels = [0, 0.25, 0.5, 0.75, 1].map((t) => max * t);

  // Skip x-axis labels if too crowded
  const xStep = Math.max(1, Math.floor(data.length / 6));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      onMouseLeave={() => setHover(null)}
    >
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* gridlines */}
      {gridY.map((y, i) => (
        <g key={i}>
          <line
            x1={padL}
            x2={padL + innerW}
            y1={y}
            y2={y}
            stroke="#e2e8f0"
            strokeDasharray="3 3"
          />
          <text
            x={padL - 6}
            y={y}
            fill="#94a3b8"
            fontSize="9"
            textAnchor="end"
            dominantBaseline="middle"
          >
            {fmtCompact(gridLabels[gridY.length - 1 - i])}
          </text>
        </g>
      ))}

      {/* area + line */}
      <path d={area} fill="url(#areaFill)" />
      <path d={path} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* dots + hover regions */}
      {points.map(([x, y], i) => (
        <g key={i}>
          <rect
            x={x - step / 2}
            y={padT}
            width={step}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
          <circle cx={x} cy={y} r={hover === i ? 4 : 2.5} fill={color} stroke="#fff" strokeWidth="1.5" />
        </g>
      ))}

      {/* x-axis labels */}
      {data.map((d, i) =>
        i % xStep === 0 ? (
          <text
            key={i}
            x={padL + i * step}
            y={H - 6}
            fill="#94a3b8"
            fontSize="9"
            textAnchor="middle"
          >
            {d.label}
          </text>
        ) : null
      )}

      {/* Tooltip */}
      {hover !== null && (
        <g>
          <line
            x1={points[hover][0]}
            x2={points[hover][0]}
            y1={padT}
            y2={padT + innerH}
            stroke={color}
            strokeOpacity="0.3"
            strokeDasharray="2 2"
          />
          <Tooltip
            x={points[hover][0]}
            y={points[hover][1]}
            width={W}
            label={data[hover].label}
            rows={[{ label: "Value", value: (formatter || fmtPeso)(data[hover].value), color }]}
          />
        </g>
      )}
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * BarPair — grouped bars for two series (deposit + withdraw)
 * Props: data: [{ label, a, b }], aLabel, bLabel, aColor, bColor
 * ──────────────────────────────────────────────────────────────────────── */
export function BarPair({
  data = [],
  height = 200,
  aLabel = "A",
  bLabel = "B",
  aColor = "#10b981",
  bColor = "#f43f5e",
}) {
  const [hover, setHover] = useState(null);
  if (!data.length) return <div style={{ height }} className="skeleton rounded-2xl" />;

  const W = 600;
  const H = height;
  const padL = 36;
  const padR = 8;
  const padT = 10;
  const padB = 26;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const max = Math.max(...data.flatMap((d) => [d.a, d.b]), 1);
  const groupW = innerW / data.length;
  const barW = Math.max(3, (groupW - 6) / 2);
  const gridY = [0, 0.5, 1].map((t) => padT + innerH * (1 - t));

  const xStep = Math.max(1, Math.floor(data.length / 7));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" onMouseLeave={() => setHover(null)}>
      {/* gridlines */}
      {gridY.map((y, i) => (
        <g key={i}>
          <line x1={padL} x2={padL + innerW} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
          <text
            x={padL - 6}
            y={y}
            fill="#94a3b8"
            fontSize="9"
            textAnchor="end"
            dominantBaseline="middle"
          >
            {fmtCompact(max * (1 - i * 0.5))}
          </text>
        </g>
      ))}

      {data.map((d, i) => {
        const cx = padL + i * groupW + groupW / 2;
        const aH = (d.a / max) * innerH;
        const bH = (d.b / max) * innerH;
        const aX = cx - barW - 1;
        const bX = cx + 1;
        const aY = padT + innerH - aH;
        const bY = padT + innerH - bH;
        return (
          <g key={i}>
            <rect
              x={padL + i * groupW}
              y={padT}
              width={groupW}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
            <rect x={aX} y={aY} width={barW} height={Math.max(1, aH)} fill={aColor} rx="2" />
            <rect x={bX} y={bY} width={barW} height={Math.max(1, bH)} fill={bColor} rx="2" />
            {i % xStep === 0 && (
              <text x={cx} y={H - 8} fill="#94a3b8" fontSize="9" textAnchor="middle">
                {d.label}
              </text>
            )}
          </g>
        );
      })}

      {hover !== null && (
        <Tooltip
          x={padL + hover * groupW + groupW / 2}
          y={padT + innerH / 2}
          width={W}
          label={data[hover].label}
          rows={[
            { label: aLabel, value: fmtPeso(data[hover].a), color: aColor },
            { label: bLabel, value: fmtPeso(data[hover].b), color: bColor },
          ]}
        />
      )}
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Donut — proportional ring chart with legend
 * Props: data: [{ name, value, color }]
 * ──────────────────────────────────────────────────────────────────────── */
export function Donut({ data = [], size = 160, thickness = 22, palette }) {
  if (!data.length) return <div style={{ height: size }} className="skeleton rounded-2xl" />;

  const colors = palette || [
    "#D4A93C",
    "#13315C",
    "#10b981",
    "#f43f5e",
    "#1f4374",
    "#94701b",
    "#0891b2",
    "#7c3aed",
  ];
  const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0) || 1;
  const r = (size - thickness) / 2;
  const c = size / 2;

  let acc = 0;
  const arcs = data.map((d, i) => {
    const v = Number(d.value) || 0;
    const start = acc / total;
    acc += v;
    const end = acc / total;
    return {
      ...d,
      color: d.color || colors[i % colors.length],
      start,
      end,
    };
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((a, i) => (
          <DonutSlice
            key={i}
            cx={c}
            cy={c}
            r={r}
            thickness={thickness}
            startFraction={a.start}
            endFraction={a.end}
            color={a.color}
          />
        ))}
        <text x={c} y={c - 4} textAnchor="middle" fontSize="11" fill="#64748b">
          Total
        </text>
        <text x={c} y={c + 14} textAnchor="middle" fontSize="14" fontWeight="800" fill="#0B2545">
          {fmtCompact(total)}
        </text>
      </svg>
      <ul className="flex-1 space-y-1 text-xs">
        {arcs.map((a, i) => (
          <li key={i} className="flex items-center justify-between gap-2">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: a.color }}
              />
              <span className="truncate text-slate-700">{a.name}</span>
            </span>
            <span className="font-semibold text-brand-800">
              {Math.round((a.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DonutSlice({ cx, cy, r, thickness, startFraction, endFraction, color }) {
  if (endFraction - startFraction < 0.0001) return null;
  // Render as a thick stroked arc using stroke-dasharray on a circle for crispness
  const circumference = 2 * Math.PI * r;
  const dashOn = (endFraction - startFraction) * circumference;
  const dashOff = circumference - dashOn;
  const rotateDeg = startFraction * 360 - 90;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke={color}
      strokeWidth={thickness}
      strokeDasharray={`${dashOn} ${dashOff}`}
      transform={`rotate(${rotateDeg} ${cx} ${cy})`}
    />
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * LineChart — two-series line with optional points (e.g. new users + total)
 * Props: data: [{ label, primary, secondary? }]
 * ──────────────────────────────────────────────────────────────────────── */
export function LineChart({
  data = [],
  height = 180,
  primaryColor = "#13315C",
  secondaryColor = "#D4A93C",
  primaryLabel = "Primary",
  secondaryLabel,
}) {
  const [hover, setHover] = useState(null);
  if (!data.length) return <div style={{ height }} className="skeleton rounded-2xl" />;

  const W = 600;
  const H = height;
  const padL = 36;
  const padR = 30;
  const padT = 10;
  const padB = 22;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const primary = data.map((d) => Number(d.primary) || 0);
  const secondary = data.map((d) => Number(d.secondary) || 0);
  const maxP = Math.max(...primary, 1);
  const maxS = Math.max(...secondary, 1);

  const step = data.length > 1 ? innerW / (data.length - 1) : innerW;

  const pointsP = primary.map((v, i) => [padL + i * step, padT + innerH - (v / maxP) * innerH]);
  const pointsS = secondary.map((v, i) => [padL + i * step, padT + innerH - (v / maxS) * innerH]);

  const path = (pts) =>
    pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");

  const gridY = [0, 0.5, 1].map((t) => padT + innerH * (1 - t));
  const xStep = Math.max(1, Math.floor(data.length / 6));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" onMouseLeave={() => setHover(null)}>
      {gridY.map((y, i) => (
        <g key={i}>
          <line x1={padL} x2={padL + innerW} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
          <text
            x={padL - 6}
            y={y}
            fill="#94a3b8"
            fontSize="9"
            textAnchor="end"
            dominantBaseline="middle"
          >
            {fmtCompact(maxP * (1 - i * 0.5))}
          </text>
        </g>
      ))}

      {secondaryLabel && (
        <path
          d={path(pointsS)}
          stroke={secondaryColor}
          strokeWidth="2"
          strokeDasharray="4 3"
          fill="none"
          opacity="0.85"
        />
      )}
      <path d={path(pointsP)} stroke={primaryColor} strokeWidth="2.5" fill="none" />

      {pointsP.map(([x, y], i) => (
        <g key={i}>
          <rect
            x={x - step / 2}
            y={padT}
            width={step}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
          <circle cx={x} cy={y} r={hover === i ? 4 : 2.5} fill={primaryColor} stroke="#fff" strokeWidth="1.5" />
        </g>
      ))}

      {data.map((d, i) =>
        i % xStep === 0 ? (
          <text
            key={i}
            x={padL + i * step}
            y={H - 6}
            fill="#94a3b8"
            fontSize="9"
            textAnchor="middle"
          >
            {d.label}
          </text>
        ) : null
      )}

      {hover !== null && (
        <Tooltip
          x={pointsP[hover][0]}
          y={pointsP[hover][1]}
          width={W}
          label={data[hover].label}
          rows={[
            { label: primaryLabel, value: fmtCompact(data[hover].primary), color: primaryColor },
            ...(secondaryLabel
              ? [{ label: secondaryLabel, value: fmtCompact(data[hover].secondary), color: secondaryColor }]
              : []),
          ]}
        />
      )}
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * HBars — horizontal bar list with labels (e.g. tx breakdown)
 * Props: data: [{ label, value, color? }]
 * ──────────────────────────────────────────────────────────────────────── */
export function HBars({ data = [], formatter = fmtPeso }) {
  if (!data.length) {
    return (
      <div className="flex h-24 items-center justify-center text-xs text-slate-400">
        No data
      </div>
    );
  }
  const max = Math.max(...data.map((d) => Number(d.value) || 0), 1);
  return (
    <ul className="space-y-2">
      {data.map((d, i) => {
        const w = ((Number(d.value) || 0) / max) * 100;
        return (
          <li key={i}>
            <div className="mb-0.5 flex items-center justify-between text-xs">
              <span className="truncate text-slate-700">{d.label}</span>
              <span className="font-semibold text-brand-800">{formatter(d.value)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <span
                className="block h-full rounded-full transition-all"
                style={{
                  width: `${w}%`,
                  background: d.color || "linear-gradient(90deg, #D4A93C, #b88e26)",
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Internal Tooltip ─────────────────────────────────────────────────── */
function Tooltip({ x, y, width, label, rows }) {
  const w = 130;
  const h = 18 + rows.length * 14;
  // Keep tooltip inside viewport
  let tx = x + 8;
  let ty = y - h - 8;
  if (tx + w > width) tx = x - w - 8;
  if (ty < 4) ty = y + 8;
  return (
    <g pointerEvents="none">
      <rect
        x={tx}
        y={ty}
        width={w}
        height={h}
        rx="6"
        fill="#0B2545"
        stroke="#1f4374"
        opacity="0.95"
      />
      <text x={tx + 8} y={ty + 14} fill="#fff" fontSize="10" fontWeight="700">
        {label}
      </text>
      {rows.map((r, i) => (
        <g key={i}>
          <rect
            x={tx + 8}
            y={ty + 22 + i * 14}
            width="6"
            height="6"
            fill={r.color}
            rx="1"
          />
          <text x={tx + 18} y={ty + 28 + i * 14} fill="#d6e0ef" fontSize="9">
            {r.label}
          </text>
          <text
            x={tx + w - 8}
            y={ty + 28 + i * 14}
            fill="#fff"
            fontSize="9"
            fontWeight="700"
            textAnchor="end"
          >
            {r.value}
          </text>
        </g>
      ))}
    </g>
  );
}
