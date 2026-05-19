import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  Users,
  Snowflake,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Coins,
} from "lucide-react";
import api, { peso } from "../../lib/api";
import {
  Card,
  PageWrap,
  Stat,
  SectionTitle,
  BarMini,
  Pill,
  Avatar,
  Skeleton,
  Empty,
} from "../../components/ui";
import { AreaChart, BarPair, Donut, LineChart, HBars } from "../../components/ui/charts";

export default function AdminDashboard() {
  const stats = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => (await api.get("/admin/dashboard/stats")).data,
  });
  const activity = useQuery({
    queryKey: ["admin-dashboard-activity"],
    queryFn: async () => (await api.get("/admin/dashboard/activity")).data,
  });

  const s = stats.data;

  return (
    <PageWrap>
      {/* Hero / Volume card */}
      <Card className="gradient-hero-rich relative overflow-hidden border-0 p-6 text-white pop-shadow">
        <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">
              Admin overview
            </p>
            <h1 className="text-xl font-black lg:text-2xl">Operations Console</h1>
            <p className="mt-1 text-xs text-white/70">
              Net deposits last 7 days
            </p>
            <p className="mt-1 text-3xl font-black text-gold-300">
              {peso(s?.volume?.net_7d ?? 0)}
            </p>
            <div className="mt-2 flex gap-2 text-[11px] text-white/80">
              <Pill tone="emerald" dot>
                In {peso(s?.volume?.deposit_7d ?? 0)}
              </Pill>
              <Pill tone="rose">
                Out {peso(s?.volume?.withdraw_7d ?? 0)}
              </Pill>
            </div>
          </div>
          <div className="hidden sm:block w-44">
            <p className="text-right text-[10px] uppercase tracking-widest text-white/50 mb-1">
              7-day deposits
            </p>
            <BarMini
              data={s?.volume?.deposit_series_7d || [1, 1, 1, 1, 1, 1, 1]}
              height={56}
              color="#D4A93C"
            />
          </div>
        </div>
      </Card>

      {/* Pending actions */}
      <section className="mt-6">
        <SectionTitle eyebrow="Action required" title="Pending approvals" />
        <div className="grid grid-cols-3 gap-3">
          <PendingTile
            to="/admin/deposits"
            icon={<ArrowDownToLine size={16} />}
            label="Deposits"
            count={s?.pending?.deposits}
            tone="emerald"
          />
          <PendingTile
            to="/admin/withdrawals"
            icon={<ArrowUpFromLine size={16} />}
            label="Withdrawals"
            count={s?.pending?.withdrawals}
            tone="rose"
          />
          <PendingTile
            to="/admin/kyc"
            icon={<ShieldCheck size={16} />}
            label="KYC"
            count={s?.pending?.kyc}
            tone="gold"
          />
        </div>
      </section>

      {/* KPI grid */}
      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          tone="ghost"
          icon={<Users size={16} />}
          label="Total users"
          value={s?.users?.total ?? "—"}
          sub={`${s?.users?.new_today ?? 0} new today`}
        />
        <Stat
          tone="ghost"
          icon={<Snowflake size={16} />}
          label="Frozen accounts"
          value={s?.users?.frozen ?? "—"}
          sub="View in Users"
        />
        <Stat
          tone="ghost"
          icon={<Sparkles size={16} />}
          label="Active investments"
          value={s?.investments?.active ?? "—"}
          sub={`Principal ${peso(s?.investments?.principal ?? 0)}`}
        />
        <Stat
          tone="ghost"
          icon={<TrendingUp size={16} />}
          label="Total paid out"
          value={peso(s?.investments?.paid_out ?? 0)}
          sub="Interest distributed"
        />
      </section>

      {/* Analytics charts */}
      <section className="mt-7">
        <SectionTitle eyebrow="Analytics" title="Performance trends" />

        <div className="grid gap-4 lg:grid-cols-2">
          {/* 14-day volume — grouped bars */}
          <Card className="p-4 lg:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-600/70">
                  Last 14 days
                </p>
                <h3 className="text-sm font-bold text-brand-800">Volume — Deposits vs Withdrawals</h3>
              </div>
              <div className="flex gap-2 text-[10px]">
                <Legend color="#10b981" label="Deposit" />
                <Legend color="#f43f5e" label="Withdraw" />
              </div>
            </div>
            {stats.isLoading ? (
              <Skeleton className="h-[200px]" />
            ) : (
              <BarPair
                data={(s?.volume?.series_14d || []).map((d) => ({
                  label: d.label,
                  a: d.deposit,
                  b: d.withdraw,
                }))}
                aLabel="Deposit"
                bLabel="Withdraw"
              />
            )}
          </Card>

          {/* Net flow area */}
          <Card className="p-4 lg:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-600/70">
                  Net flow
                </p>
                <h3 className="text-sm font-bold text-brand-800">Daily net (in − out)</h3>
              </div>
              <Pill tone="gold">14 days</Pill>
            </div>
            {stats.isLoading ? (
              <Skeleton className="h-[180px]" />
            ) : (
              <AreaChart
                data={(s?.volume?.series_14d || []).map((d) => ({
                  label: d.label,
                  value: d.net,
                }))}
              />
            )}
          </Card>

          {/* User growth line */}
          <Card className="p-4 lg:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-600/70">
                  Growth
                </p>
                <h3 className="text-sm font-bold text-brand-800">Member sign-ups (30d)</h3>
              </div>
              <div className="flex gap-2 text-[10px]">
                <Legend color="#13315C" label="New / day" />
                <Legend color="#D4A93C" label="Cumulative" dashed />
              </div>
            </div>
            {stats.isLoading ? (
              <Skeleton className="h-[180px]" />
            ) : (
              <LineChart
                data={(s?.users?.series_30d || []).map((d) => ({
                  label: d.label,
                  primary: d.new_users,
                  secondary: d.total,
                }))}
                primaryLabel="New / day"
                secondaryLabel="Total"
              />
            )}
          </Card>

          {/* Investments by package — donut */}
          <Card className="p-4 lg:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-600/70">
                  Allocation
                </p>
                <h3 className="text-sm font-bold text-brand-800">Active principal by package</h3>
              </div>
              <Pill tone="brand">{s?.investments?.active ?? 0} active</Pill>
            </div>
            {stats.isLoading ? (
              <Skeleton className="h-[180px]" />
            ) : (s?.investments?.by_package?.length ?? 0) === 0 ? (
              <Empty>No active investments yet.</Empty>
            ) : (
              <Donut
                data={(s.investments.by_package || []).map((p) => ({
                  name: p.name,
                  value: p.principal,
                }))}
              />
            )}
          </Card>

          {/* Transaction breakdown — horizontal bars */}
          <Card className="p-4 lg:p-5 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-600/70">
                  Last 30 days
                </p>
                <h3 className="text-sm font-bold text-brand-800">Wallet transactions by type</h3>
              </div>
              <Pill tone="slate">By amount</Pill>
            </div>
            {stats.isLoading ? (
              <Skeleton className="h-[140px]" />
            ) : (
              <HBars
                data={(s?.wallet?.tx_breakdown_30d || [])
                  .slice()
                  .sort((a, b) => b.total - a.total)
                  .map((t) => ({
                    label: `${t.label} · ${t.count}×`,
                    value: t.total,
                    color: t.is_credit
                      ? "linear-gradient(90deg, #10b981, #047857)"
                      : "linear-gradient(90deg, #f43f5e, #be123c)",
                  }))}
              />
            )}
          </Card>
        </div>
      </section>

      {/* Activity */}
      <section className="mt-7">
        <SectionTitle
          eyebrow="Live"
          title="Recent activity"
          action={
            <Link to="/admin/users" className="text-xs font-semibold text-brand-600 hover:text-brand-800">
              Manage users →
            </Link>
          }
        />
        {activity.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : !activity.data?.length ? (
          <Empty>No recent activity.</Empty>
        ) : (
          <ul className="space-y-2">
            {activity.data.map((t) => (
              <li key={t.uuid}>
                <Card className="flex items-center gap-3 p-3.5">
                  <Avatar name={t.user?.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-800">
                      {t.user?.name || "Unknown"}{" "}
                      <span className="text-slate-400">·</span>{" "}
                      <span className="text-xs text-slate-500">{t.type.label}</span>
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {t.description || new Date(t.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={`text-right text-sm font-bold ${
                      t.type.is_credit ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {t.type.is_credit ? "+" : "−"}
                    {peso(t.amount)}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageWrap>
  );
}

function PendingTile({ to, icon, label, count, tone }) {
  const colors = {
    emerald: "from-emerald-50 to-white text-emerald-700 ring-emerald-200",
    rose: "from-rose-50 to-white text-rose-700 ring-rose-200",
    gold: "from-gold-50 to-white text-gold-700 ring-gold-200",
  }[tone];
  return (
    <Link to={to}>
      <Card className={`relative bg-gradient-to-br ${colors} p-4 ring-1 transition hover:pop-shadow`}>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
            {icon} {label}
          </span>
          {count > 0 && (
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-brand-800 ring-1 ring-slate-200 pulse-dot">
              {count}
            </span>
          )}
        </div>
        <p className="mt-1 text-2xl font-black text-brand-800">{count ?? "—"}</p>
        <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-brand-600">
          Review now <ChevronRight size={12} />
        </p>
      </Card>
    </Link>
  );
}

function Legend({ color, label, dashed }) {
  return (
    <span className="inline-flex items-center gap-1 text-slate-600">
      <span
        className="h-2 w-3.5 rounded-sm"
        style={{
          background: color,
          backgroundImage: dashed
            ? `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 7px)`
            : undefined,
        }}
      />
      {label}
    </span>
  );
}
