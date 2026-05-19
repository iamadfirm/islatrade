import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  ChevronLeft,
  TrendingUp,
  Clock,
  Coins,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import api, { peso } from "../../lib/api";
import {
  Button,
  Card,
  Input,
  PageWrap,
  Loader,
  Pill,
  SectionTitle,
} from "../../components/ui";
import { useAuth } from "../../stores/authStore";

const QUICK = [1000, 5000, 10000, 25000];

export default function EnrollForm() {
  const { uuid } = useParams();
  const user = useAuth((s) => s.user);
  const refresh = useAuth((s) => s.refresh);
  const qc = useQueryClient();
  const nav = useNavigate();
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState({});

  const pkg = useQuery({
    queryKey: ["package", uuid],
    queryFn: async () => (await api.get(`/partnerships/packages/${uuid}`)).data,
  });

  const enroll = useMutation({
    mutationFn: async () =>
      (await api.post("/partnerships/investments", { package_uuid: uuid, amount })).data,
    onSuccess: () => {
      refresh();
      qc.invalidateQueries({ queryKey: ["investments"] });
      qc.invalidateQueries({ queryKey: ["partnership-dash"] });
      nav("/partnership", { replace: true });
    },
    onError: (e) =>
      setErrors(
        e.response?.data?.errors || {
          _: [e.response?.data?.message || "Failed"],
        }
      ),
  });

  const p = pkg.data?.data;
  const a = Number(amount || 0);

  // Estimated total interest = principal * rate% * (term/interval) approx
  // Simpler: project = principal * (interest_rate/100) * payouts_count
  const projection = useMemo(() => {
    if (!p || !a) return null;
    const payoutsPerDay = { hourly: 24, daily: 1, weekly: 1 / 7, monthly: 1 / 30 }[p.frequency.value] || 1;
    const intervalDays = 1 / payoutsPerDay;
    const payouts = Math.max(1, Math.floor(p.term_days * payoutsPerDay));
    const perPayout = a * (Number(p.interest_rate) / 100);
    const total = perPayout * payouts;
    return { payouts, perPayout, total, intervalDays };
  }, [a, p]);

  if (pkg.isLoading) return <Loader />;

  return (
    <PageWrap>
      <Link
        to="/partnership"
        className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800"
      >
        <ChevronLeft size={14} /> Back to packages
      </Link>

      {/* Hero */}
      <Card className="gradient-hero-rich relative overflow-hidden border-0 p-5 text-white pop-shadow">
        <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl gradient-gold text-brand-900">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/60">Partnership</p>
              <h1 className="text-lg font-black">{p?.name}</h1>
            </div>
          </div>
          {p?.description && (
            <p className="mt-2 text-xs text-white/70">{p.description}</p>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="Interest" value={`${p?.interest_rate}%`} icon={<TrendingUp size={14} />} />
            <Stat label="Frequency" value={p?.frequency.label} icon={<Clock size={14} />} />
            <Stat label="Term" value={`${p?.term_days}d`} icon={<Coins size={14} />} />
          </div>
        </div>
      </Card>

      {/* Range pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Pill tone="brand">
          Range: {peso(p?.min_amount)}
          {p?.max_amount ? ` – ${peso(p?.max_amount)}` : "+"}
        </Pill>
        <Pill tone="emerald">
          Wallet: {peso(user?.wallet_balance)}
        </Pill>
      </div>

      {/* Amount form */}
      <Card className="mt-5 p-4 lg:p-5">
        <SectionTitle eyebrow="Step 1" title="Amount to invest" />
        <Input
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount?.[0]}
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {QUICK.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAmount(String(v))}
              className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
            >
              {peso(v)}
            </button>
          ))}
        </div>

        {projection && (
          <div className="mt-4 rounded-2xl bg-gradient-to-br from-gold-50 to-white p-4 ring-1 ring-gold-200">
            <p className="text-[10px] uppercase tracking-widest text-gold-700">
              Estimated returns
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <Mini label="Per payout" value={peso(projection.perPayout)} />
              <Mini label="Payouts" value={`${projection.payouts}×`} />
              <Mini label="Total interest" value={peso(projection.total)} highlight />
            </div>
            <p className="mt-3 text-[11px] text-gold-700">
              {p?.return_capital === false ? (
                <>Principal of <b>{peso(a)}</b> is <b>retained</b> at maturity — earnings come from periodic interest only.</>
              ) : (
                <>Principal of <b>{peso(a)}</b> returns at maturity (Day {p?.term_days}). Estimates assume on-schedule payouts.</>
              )}
            </p>
          </div>
        )}

        {errors._ && <p className="mt-3 text-sm text-rose-600">{errors._[0]}</p>}

        {p?.is_active === false && (
          <div className="mt-3 rounded-2xl bg-amber-50 p-3 text-[11px] text-amber-800 ring-1 ring-amber-200">
            This package is currently paused and not accepting new enrollments.
          </div>
        )}

        <Button
          className="mt-4 w-full"
          onClick={() => enroll.mutate()}
          disabled={enroll.isPending || !amount || p?.is_active === false}
        >
          {enroll.isPending ? "Enrolling…" : (
            <>
              Confirm investment <ArrowRight size={14} />
            </>
          )}
        </Button>
      </Card>

      <div className="mt-4 flex items-start gap-2 rounded-2xl bg-brand-50 p-3 text-[11px] text-brand-800 ring-1 ring-brand-100">
        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-brand-600" />
        <p>
          Your principal is locked until maturity. Interest is paid on each schedule and credited
          straight to your wallet.
        </p>
      </div>
    </PageWrap>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-2.5 ring-1 ring-white/15">
      <p className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/60">
        {icon} {label}
      </p>
      <p className="mt-1 text-sm font-bold text-gold-300">{value}</p>
    </div>
  );
}

function Mini({ label, value, highlight }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className={`mt-0.5 text-sm font-bold ${highlight ? "text-gold-700" : "text-brand-800"}`}>
        {value}
      </p>
    </div>
  );
}
