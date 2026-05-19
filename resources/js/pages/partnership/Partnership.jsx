import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  TrendingUp,
  Coins,
  Layers,
  Clock,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import api, { peso } from "../../lib/api";
import {
  Card,
  PageWrap,
  Loader,
  Empty,
  StatusBadge,
  Stat,
  SectionTitle,
  Progress,
  Pill,
  Skeleton,
} from "../../components/ui";

export default function Partnership() {
  const dash = useQuery({
    queryKey: ["partnership-dash"],
    queryFn: async () => (await api.get("/partnerships/dashboard")).data,
  });
  const investments = useQuery({
    queryKey: ["investments"],
    queryFn: async () => (await api.get("/partnerships/investments")).data,
  });
  const packages = useQuery({
    queryKey: ["packages"],
    queryFn: async () => (await api.get("/partnerships/packages")).data,
  });

  const d = dash.data;

  return (
    <PageWrap>
      {/* Hero */}
      <Card className="gradient-hero-rich relative overflow-hidden border-0 p-6 text-white pop-shadow">
        <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-400/20 blur-3xl" />
        <span className="absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-gold text-brand-900 shadow-md shadow-gold-500/40">
            <Sparkles size={22} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">
              Partnership
            </p>
            <h1 className="text-xl font-black text-white lg:text-2xl">
              Grow your wallet with us
            </h1>
            <p className="mt-1 text-xs text-white/70">
              Pick a partnership package and earn scheduled interest payouts until maturity.
            </p>
          </div>
        </div>
        <div className="relative mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Stat
            tone="ghost"
            className="!bg-white/10 !border-white/15 !text-white"
            label="Active"
            value={d?.active_count ?? "—"}
          />
          <Stat
            tone="ghost"
            className="!bg-white/10 !border-white/15 !text-white"
            label="Principal"
            value={peso(d?.total_principal)}
          />
          <Stat
            tone="ghost"
            className="!bg-white/10 !border-white/15 !text-white"
            label="Earned"
            value={peso(d?.total_paid_out)}
          />
        </div>
      </Card>

      {/* Packages */}
      <section className="mt-7">
        <SectionTitle eyebrow="Available" title="Investment packages" />
        {packages.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : !packages.data?.data?.length ? (
          <Empty>No packages available right now.</Empty>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {packages.data.data.map((p) => (
              <PackageCard key={p.uuid} p={p} />
            ))}
          </ul>
        )}
      </section>

      {/* My investments */}
      <section className="mt-7">
        <SectionTitle eyebrow="Portfolio" title="My investments" />
        {investments.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : !investments.data?.data?.length ? (
          <Empty>You don't have any investments yet — pick a package above to start.</Empty>
        ) : (
          <ul className="space-y-2">
            {investments.data.data.map((i) => (
              <InvestmentRow key={i.uuid} i={i} />
            ))}
          </ul>
        )}
      </section>
    </PageWrap>
  );
}

function PackageCard({ p }) {
  return (
    <li>
      <Link to={`/partnership/enroll/${p.uuid}`}>
        <Card className="group relative overflow-hidden p-4 transition hover:border-gold-300 hover:pop-shadow">
          <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold-100/60 blur-2xl transition group-hover:bg-gold-200/80" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl gradient-gold text-brand-900">
                <Layers size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-800">{p.name}</p>
                <p className="text-[11px] text-slate-500">
                  {p.term_days} days · {p.frequency.label.toLowerCase()} payout
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-gold-600">{p.interest_rate}%</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                Interest
              </p>
            </div>
          </div>
          <div className="relative mt-3 flex items-center justify-between text-[11px] text-slate-600">
            <span>
              <b className="text-brand-800">{peso(p.min_amount)}</b>{" "}
              {p.max_amount ? `– ${peso(p.max_amount)}` : "and above"}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-brand-600">
              Enroll <ChevronRight size={14} />
            </span>
          </div>
        </Card>
      </Link>
    </li>
  );
}

function InvestmentRow({ i }) {
  const start = new Date(i.started_at).getTime();
  const end = new Date(i.matures_at).getTime();
  const now = Date.now();
  const progress = Math.max(0, Math.min(100, ((now - start) / (end - start || 1)) * 100));
  const daysLeft = Math.max(0, Math.ceil((end - now) / 86400000));
  const isActive = i.status?.value === "active";

  return (
    <li>
      <Card className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-base font-bold text-brand-800">{peso(i.principal)}</p>
              <StatusBadge status={i.status} />
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {i.package?.name} · {i.interest_rate}% {i.frequency?.label?.toLowerCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-emerald-600">
              +{peso(i.total_paid_out)}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">
              Earned
            </p>
          </div>
        </div>

        {isActive && (
          <>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Clock size={11} /> {daysLeft} days to maturity
              </span>
              <span>
                Matures{" "}
                <b className="text-brand-700">
                  {new Date(i.matures_at).toLocaleDateString()}
                </b>
              </span>
            </div>
            <Progress value={progress} className="mt-2" />
            {i.next_payout_at && (
              <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-gold-600">
                <Sparkles size={11} /> Next payout{" "}
                <b>{new Date(i.next_payout_at).toLocaleString()}</b>
              </p>
            )}
          </>
        )}
      </Card>
    </li>
  );
}
