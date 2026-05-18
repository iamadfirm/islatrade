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
