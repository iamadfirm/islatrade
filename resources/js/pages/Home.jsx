import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Send,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Wallet as WalletIcon,
  Clock,
  Coins,
  ChevronRight,
  Zap,
} from "lucide-react";

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61590089355623";

function Facebook({ size = 18, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}
import {
  Card,
  PageWrap,
  StatusBadge,
  Stat,
  SectionTitle,
  Sparkline,
  Pill,
  Empty,
  Skeleton,
} from "../components/ui";
import { useAuth } from "../stores/authStore";
import api, { peso } from "../lib/api";
import { useFeature } from "../lib/features";
import CryptoMarket from "../components/crypto/CryptoMarket";

function txIcon(value) {
  if (!value) return <Coins size={14} />;
  if (value.includes("deposit")) return <ArrowDownToLine size={14} />;
  if (value.includes("withdraw")) return <ArrowUpFromLine size={14} />;
  if (value.includes("transfer")) return <Send size={14} />;
  if (value.includes("interest") || value.includes("payout")) return <Sparkles size={14} />;
  return <Coins size={14} />;
}

export default function Home() {
  const user = useAuth((s) => s.user);
  const isAdmin = user?.is_admin || user?.is_staff || user?.roles?.includes?.("admin");
  const fDeposit = useFeature("deposit");
  const fWithdraw = useFeature("withdraw");
  const fTransfer = useFeature("transfer");
  const fPartnership = useFeature("partnership");

  const tx = useQuery({
    queryKey: ["wallet-tx-recent"],
    queryFn: async () => (await api.get("/wallet/transactions")).data,
  });
  const dash = useQuery({
    queryKey: ["partnership-dash"],
    queryFn: async () => (await api.get("/partnerships/dashboard")).data,
    enabled: fPartnership.enabled,
  });
  const investments = useQuery({
    queryKey: ["investments"],
    queryFn: async () => (await api.get("/partnerships/investments")).data,
    enabled: fPartnership.enabled,
  });

  const balance = Number(user?.wallet_balance || 0);
  const spark = Array.from({ length: 24 }, (_, i) =>
    Math.sin(i * 0.55 + (balance % 10)) * 0.5 + Math.log10(balance + 10) + i * 0.05
  );

  const active = investments.data?.data?.filter((i) => i.status?.value === "active") || [];
  const nextPayoutInvestment = active
    .filter((i) => i.next_payout_at)
    .sort((a, b) => new Date(a.next_payout_at) - new Date(b.next_payout_at))[0];

  return (
    <PageWrap>
      {/* Hero */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 fade-up">
          <Card className="gradient-hero-rich relative overflow-hidden border-0 p-6 text-white pop-shadow lg:p-8">
            <span className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-gold-400/20 blur-3xl" />
            <span className="absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-brand-400/30 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">
                  Wallet balance
                </p>
                <Pill tone="gold" dot>
                  Live
                </Pill>
              </div>
              <p className="mt-2 text-4xl font-black tracking-tight text-gold-300 lg:text-5xl">
                {peso(user?.wallet_balance)}
              </p>
              <div className="mt-2">
                <Sparkline data={spark} width={220} height={36} />
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="text-white/70">KYC</span>
                <StatusBadge status={user?.kyc_status} />
              </div>

              <div className="mt-6 hidden gap-3 lg:flex">
                {fDeposit.enabled && (
                  <Link
                    to="/deposit"
                    className="rounded-xl gradient-gold px-4 py-2.5 text-sm font-bold text-brand-900 shadow-md shadow-gold-500/30 hover:opacity-95"
                  >
                    + Deposit funds
                  </Link>
                )}
                {fTransfer.enabled && (
                  <Link
                    to="/transfer"
                    className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Send money
                  </Link>
                )}
                {fPartnership.enabled && (
                  <Link
                    to="/partnership"
                    className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Invest
                  </Link>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:gap-3">
          <Stat
            tone="gold"
            icon={<TrendingUp size={16} />}
            label="Total earned"
            value={peso(dash.data?.total_paid_out)}
            sub={`${dash.data?.active_count ?? 0} active plans`}
          />
          <Stat
            tone="brand"
            icon={<Coins size={16} />}
            label="Principal invested"
            value={peso(dash.data?.total_principal)}
            sub={dash.data?.matured_count ? `${dash.data.matured_count} matured` : "—"}
          />
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-5 grid grid-cols-4 gap-3 text-center lg:gap-4">
        {fDeposit.enabled && <Quick to="/deposit" icon={<ArrowDownToLine />} label="Deposit" />}
        {fWithdraw.enabled && <Quick to="/withdraw" icon={<ArrowUpFromLine />} label="Withdraw" />}
        {fTransfer.enabled && <Quick to="/transfer" icon={<Send />} label="Send" />}
        {fPartnership.enabled && <Quick to="/partnership" icon={<Sparkles />} label="Partner" />}
      </div>

      {/* Next payout / KYC nudge row */}
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {nextPayoutInvestment ? (
          <Card className="flex items-center gap-3 p-4 ring-1 ring-gold-200/60">
            <div className="grid h-10 w-10 place-items-center rounded-2xl gradient-gold text-brand-900">
              <Clock size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-600/70">
                Next payout
              </p>
              <p className="text-sm font-bold text-brand-800">
                {new Date(nextPayoutInvestment.next_payout_at).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">
                {nextPayoutInvestment.package?.name} · {peso(nextPayoutInvestment.principal)}
              </p>
            </div>
            <ChevronRight className="text-slate-300" />
          </Card>
        ) : (
          fPartnership.enabled && (
            <Link to="/partnership">
              <Card className="flex items-center gap-3 p-4 ring-1 ring-brand-100 hover:border-brand-200 transition">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <Zap size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-brand-800">Start earning</p>
                  <p className="text-xs text-slate-500">Browse investment partnerships</p>
                </div>
                <ChevronRight className="text-slate-300" />
              </Card>
            </Link>
          )
        )}

        {user?.kyc_status?.value !== "approved" && (
          <Link to="/kyc">
            <Card className="flex items-center gap-3 p-4 ring-1 ring-gold-200">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gold-50 text-gold-600">
                <ShieldCheck size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-brand-800">
                  Complete KYC verification
                </p>
                <p className="text-xs text-slate-500">
                  Required to withdraw funds securely.
                </p>
              </div>
              <ChevronRight className="text-slate-300" />
            </Card>
          </Link>
        )}
      </div>

      {/* Follow us on Facebook */}
      <a
        href={FACEBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 block"
      >
        <Card className="flex items-center gap-3 p-4 ring-1 ring-brand-100 hover:border-brand-200 transition">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1877F2] text-white">
            <Facebook size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-brand-800">Follow us on Facebook</p>
            <p className="text-xs text-slate-500">Stay updated with news and announcements</p>
          </div>
          <ChevronRight className="text-slate-300" />
        </Card>
      </a>

      {/* Live crypto market */}
      <div className="mt-7">
        <CryptoMarket />
      </div>

      {/* Recent activity */}
      <section className="mt-7">
        <SectionTitle
          eyebrow="History"
          title="Recent activity"
          action={
            <Link to="/wallet" className="text-xs font-semibold text-brand-600 hover:text-brand-800">
              View all →
            </Link>
          }
        />
        {tx.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : !tx.data?.data?.length ? (
          <Empty>No activity yet — your transactions will appear here.</Empty>
        ) : (
          <ul className="space-y-2">
            {tx.data.data.slice(0, 5).map((t) => (
              <li key={t.uuid}>
                <Card className="flex items-center gap-3 p-3.5 hover:border-brand-200 transition">
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
                      {new Date(t.created_at).toLocaleString()}
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

      {isAdmin && (
        <Link to="/admin" className="mt-5 block">
          <Card className="flex items-center gap-3 p-4 gradient-brand text-white border-0">
            <div className="rounded-2xl gradient-gold p-2.5 text-brand-900">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-sm font-bold">Admin console</p>
              <p className="text-xs text-white/70">Approvals, packages, users, settings</p>
            </div>
            <ChevronRight className="ml-auto text-white/70" />
          </Card>
        </Link>
      )}
    </PageWrap>
  );
}

function Quick({ to, icon, label }) {
  return (
    <Link to={to} className="group flex flex-col items-center gap-1.5 lg:gap-2">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-700 ring-1 ring-brand-100 shadow-sm transition group-hover:bg-gradient-to-br group-hover:from-gold-50 group-hover:to-white group-hover:text-gold-600 group-hover:ring-gold-200 lg:h-14 lg:w-14">
        {icon}
      </span>
      <span className="text-[11px] font-medium text-slate-700 lg:text-xs">
        {label}
      </span>
    </Link>
  );
}
