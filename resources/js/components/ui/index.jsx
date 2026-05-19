import { motion } from "framer-motion";

export function Button({ as: As = "button", variant = "primary", className = "", children, ...rest }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none";
  const styles = {
    primary: "gradient-brand text-white shadow-lg shadow-brand-900/25",
    gold: "gradient-gold text-brand-900 shadow-md shadow-gold-400/30",
    ghost: "bg-white text-brand-700 border border-brand-100 hover:bg-brand-50",
    soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
    danger: "bg-rose-500 text-white",
  };
  return (
    <As className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </As>
  );
}

export function Card({ className = "", children }) {
  return (
    <div className={`rounded-3xl bg-white shadow-sm border border-slate-100 ${className}`}>
      {children}
    </div>
  );
}

export function Input({ label, error, className = "", ...rest }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
      <input
        className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 ${className}`}
        {...rest}
      />
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}

export function Select({ label, error, children, className = "", ...rest }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
      <select
        className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 ${className}`}
        {...rest}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}

const colorMap = {
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  sky: "bg-sky-50 text-sky-700 border-sky-200",
  slate: "bg-slate-50 text-slate-600 border-slate-200",
};

export function StatusBadge({ status }) {
  if (!status) return null;
  const cls = colorMap[status.color] || colorMap.slate;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {status.label}
    </span>
  );
}

export function PageWrap({ title, action, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="px-4 pt-4 pb-28"
    >
      {title && (
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          {action}
        </header>
      )}
      {children}
    </motion.div>
  );
}

export function Loader() {
  return (
    <div className="flex h-40 items-center justify-center text-slate-400 text-sm">Loading…</div>
  );
}

export function Empty({ children }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, action }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-600/70">
            {eyebrow}
          </p>
        )}
        <h2 className="text-base font-bold text-brand-800">{title}</h2>
      </div>
      {action}
    </div>
  );
}

const statTones = {
  gold: "gradient-gold text-brand-900",
  brand: "gradient-brand text-white",
  emerald: "gradient-emerald text-white",
  rose: "gradient-rose text-white",
  ghost: "bg-white text-brand-800 border border-brand-100",
};

export function Stat({ icon, label, value, sub, tone = "ghost", className = "" }) {
  const tw = statTones[tone] || statTones.ghost;
  return (
    <div className={`relative overflow-hidden rounded-2xl p-3.5 soft-shadow ${tw} ${className}`}>
      {tone !== "ghost" && (
        <span className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15 blur-2xl" />
      )}
      <div className="relative flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest opacity-80">
          {label}
        </span>
        {icon && <span className="opacity-80">{icon}</span>}
      </div>
      <p className="relative mt-1 text-lg font-black tracking-tight lg:text-xl">{value}</p>
      {sub && <p className="relative mt-0.5 text-[11px] opacity-80">{sub}</p>}
    </div>
  );
}

export function Pill({ tone = "slate", children, dot = false, className = "" }) {
  const tones = {
    slate: "bg-slate-50 text-slate-600 ring-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
    gold: "bg-gold-50 text-gold-600 ring-gold-200",
    brand: "bg-brand-50 text-brand-700 ring-brand-200",
  };
  const dotColor = {
    slate: "bg-slate-400",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
    amber: "bg-amber-500",
    sky: "bg-sky-500",
    gold: "bg-gold-500",
    brand: "bg-brand-500",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${tones[tone]} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full pulse-dot ${dotColor}`} />}
      {children}
    </span>
  );
}

export function Avatar({ name = "?", src = null, size = 40, className = "" }) {
  const initials = String(name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`inline-block shrink-0 rounded-full object-cover ring-2 ring-white ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full gradient-brand text-white font-bold ring-2 ring-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials || "?"}
    </span>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

/* Sparkline — receives an array of numbers and renders a smooth SVG path */
export function Sparkline({
  data = [],
  width = 120,
  height = 32,
  stroke = "#D4A93C",
  fill = "rgba(212,169,60,0.18)",
  className = "",
}) {
  if (!data.length) return <div style={{ width, height }} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = data.length > 1 ? width / (data.length - 1) : width;
  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return [x, y];
  });
  const path = points
    .map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`))
    .join(" ");
  const area = `${path} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} className={className}>
      <path d={area} fill={fill} stroke="none" />
      <path d={path} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* BarMini — simple vertical bar chart */
export function BarMini({ data = [], height = 36, color = "#13315C", className = "" }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  return (
    <div className={`flex items-end gap-0.5 ${className}`} style={{ height }}>
      {data.map((v, i) => (
        <span
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${(v / max) * 100}%`,
            background: color,
            minHeight: 2,
          }}
        />
      ))}
    </div>
  );
}

/* Progress bar */
export function Progress({ value = 0, tone = "gold", className = "" }) {
  const pct = Math.max(0, Math.min(100, value));
  const bg = {
    gold: "bg-gradient-to-r from-gold-400 to-gold-500",
    brand: "gradient-brand",
    emerald: "bg-emerald-500",
  }[tone] || "bg-gold-400";
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-brand-50 ${className}`}>
      <span className={`block h-full rounded-full ${bg} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}
