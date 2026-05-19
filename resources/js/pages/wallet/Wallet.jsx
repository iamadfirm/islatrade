import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Send,
  Coins,
  Sparkles,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import api, { peso } from "../../lib/api";
import {
  Card,
  PageWrap,
  Loader,
  Empty,
  SectionTitle,
  Stat,
  Pill,
  Sparkline,
} from "../../components/ui";
import { useAuth } from "../../stores/authStore";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "credit", label: "In" },
  { key: "debit", label: "Out" },
];

function txIcon(value) {
  if (!value) return <Coins size={14} />;
  if (value.includes("deposit")) return <ArrowDownToLine size={14} />;
  if (value.includes("withdraw")) return <ArrowUpFromLine size={14} />;
  if (value.includes("transfer")) return <Send size={14} />;
  if (value.includes("interest") || value.includes("payout")) return <Sparkles size={14} />;
  return <Coins size={14} />;
}

export default function Wallet() {
  const user = useAuth((s) => s.user);
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["wallet-tx"],
    queryFn: async () => (await api.get("/wallet/transactions")).data,
  });

  const txs = data?.data || [];

  const filtered = useMemo(() => {
    if (filter === "credit") return txs.filter((t) => t.type.is_credit);
    if (filter === "debit") return txs.filter((t) => !t.type.is_credit);
    return txs;
  }, [txs, filter]);

  const totals = useMemo(() => {
    let inSum = 0;
    let outSum = 0;
    txs.forEach((t) => {
      const a = Number(t.amount);
      t.type.is_credit ? (inSum += a) : (outSum += a);
    });
    return { inSum, outSum };
  }, [txs]);

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);

  return (
    <PageWrap>
      {/* Balance hero */}
      <Card className="gradient-hero-rich relative overflow-hidden border-0 p-5 text-white pop-shadow lg:p-7">
        <span className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="relative flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">
              Available balance
            </p>
            <p className="mt-1 text-3xl font-black text-gold-300 lg:text-4xl">
              {peso(user?.wallet_balance)}
            </p>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-white/70">
              <Pill tone="gold" dot>Live</Pill>
              {user?.phone}
            </div>
          </div>
          <Sparkline
            data={Array.from({ length: 18 }, (_, i) => Math.sin(i * 0.6) * 0.5 + i * 0.1 + 2)}
            width={120}
            height={36}
            stroke="#f4e3a8"
            fill="rgba(244,227,168,0.15)"
          />
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <ActionTile to="/deposit" icon={<ArrowDownToLine size={18} />} label="Deposit" />
        <ActionTile to="/withdraw" icon={<ArrowUpFromLine size={18} />} label="Withdraw" />
        <ActionTile to="/transfer" icon={<Send size={18} />} label="Transfer" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Stat
          tone="emerald"
          icon={<TrendingUp size={16} />}
          label="Total in"
          value={peso(totals.inSum)}
          sub={`${txs.filter((t) => t.type.is_credit).length} entries`}
        />
        <Stat
          tone="rose"
          icon={<TrendingDown size={16} />}
          label="Total out"
          value={peso(totals.outSum)}
          sub={`${txs.filter((t) => !t.type.is_credit).length} entries`}
        />
      </div>

      <section className="mt-7">
        <SectionTitle
          eyebrow="Ledger"
          title="Transactions"
          action={
            <div className="flex gap-1 rounded-full bg-brand-50 p-1 ring-1 ring-brand-100">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                    filter === f.key
                      ? "bg-white text-brand-800 shadow-sm"
                      : "text-brand-600/80 hover:text-brand-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          }
        />

        {isLoading ? (
          <Loader />
        ) : !filtered.length ? (
          <Empty>No transactions match this filter.</Empty>
        ) : (
          <div className="space-y-5">
            {grouped.map(([day, items]) => (
              <div key={day}>
                <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {day}
                </p>
                <ul className="space-y-2">
                  {items.map((t) => (
                    <li key={t.uuid}>
                      <Card className="flex items-center gap-3 p-3.5 transition hover:border-brand-200">
                        <span
                          className={`grid h-10 w-10 place-items-center rounded-2xl ${
                            t.type.is_credit
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {txIcon(t.type.value)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-brand-800">
                            {t.type.label}
                          </p>
                          <p className="truncate text-[11px] text-slate-500">
                            {t.description || new Date(t.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-bold ${
                              t.type.is_credit ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {t.type.is_credit ? "+" : "−"}
                            {peso(t.amount)}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            bal {peso(t.balance_after)}
                          </p>
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageWrap>
  );
}

function ActionTile({ to, icon, label }) {
  return (
    <Link to={to}>
      <Card className="flex flex-col items-center gap-1.5 p-3.5 text-brand-700 transition hover:border-gold-200 hover:text-gold-600">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          {icon}
        </span>
        <span className="text-xs font-semibold">{label}</span>
      </Card>
    </Link>
  );
}

function groupByDay(items) {
  const map = new Map();
  items.forEach((t) => {
    const d = new Date(t.created_at);
    const key = d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(t);
  });
  return Array.from(map.entries());
}
