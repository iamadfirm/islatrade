import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpFromLine,
  ShieldAlert,
  Banknote,
  Info,
  CheckCircle2,
  Receipt,
} from "lucide-react";
import api, { peso } from "../../lib/api";
import {
  Button,
  Card,
  Input,
  PageWrap,
  StatusBadge,
  Loader,
  Empty,
  SectionTitle,
  Skeleton,
  Pill,
} from "../../components/ui";

export default function Withdraw() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    amount: "",
    bank_name: "",
    account_name: "",
    account_number: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const info = useQuery({
    queryKey: ["withdraw-info"],
    queryFn: async () => (await api.get("/withdrawals/info")).data,
  });
  const list = useQuery({
    queryKey: ["withdrawals"],
    queryFn: async () => (await api.get("/withdrawals")).data,
  });

  const submit = useMutation({
    mutationFn: async () => (await api.post("/withdrawals", form)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["withdrawals"] });
      setForm({ amount: "", bank_name: "", account_name: "", account_number: "" });
      setErrors({});
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    },
    onError: (e) =>
      setErrors(
        e.response?.data?.errors || {
          _: [e.response?.data?.message || "Failed"],
        }
      ),
  });

  const kycOk = info.data?.kyc_status?.value === "approved";
  const feeFlat = Number(info.data?.fee_flat ?? 0);
  const feePercent = Number(info.data?.fee_percent ?? 0);
  const hasFee = feeFlat > 0 || feePercent > 0;
  const amt = Number(form.amount || 0);
  const fee = useMemo(() => {
    if (!amt) return 0;
    return Math.max(0, Math.round((feeFlat + (amt * feePercent) / 100) * 100) / 100);
  }, [amt, feeFlat, feePercent]);
  const net = Math.max(0, amt - fee);

  return (
    <PageWrap>
      {/* Hero with balance */}
      <Card className="gradient-hero-rich relative overflow-hidden border-0 p-5 text-white pop-shadow">
        <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="relative flex items-start gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-gold text-brand-900 shadow-md shadow-gold-500/40">
            <ArrowUpFromLine size={22} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">Cash out</p>
            <h1 className="text-xl font-black">Withdraw to bank</h1>
            <p className="text-xs text-white/70">
              Funds sent to your verified bank or e-wallet account.
            </p>
          </div>
        </div>
        <div className="relative mt-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/60">Available</p>
            <p className="text-2xl font-black text-gold-300">{peso(info.data?.balance)}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Pill tone="gold">Min ₱{info.data?.min_amount ?? "—"}</Pill>
            {hasFee && (
              <Pill tone="amber">
                Fee {feeFlat > 0 ? `₱${feeFlat}` : ""}
                {feeFlat > 0 && feePercent > 0 ? " + " : ""}
                {feePercent > 0 ? `${feePercent}%` : ""}
              </Pill>
            )}
          </div>
        </div>
      </Card>

      {success && (
        <div className="mt-4 fade-up">
          <Card className="flex items-center gap-3 border-emerald-200 bg-emerald-50 p-3.5">
            <CheckCircle2 className="text-emerald-600" />
            <div>
              <p className="text-sm font-bold text-emerald-800">Withdrawal requested</p>
              <p className="text-[11px] text-emerald-700">
                An admin will process your payout shortly.
              </p>
            </div>
          </Card>
        </div>
      )}

      {!kycOk ? (
        <Card className="mt-5 p-5 ring-1 ring-gold-200">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-50 text-gold-600">
              <ShieldAlert size={22} />
            </span>
            <div>
              <p className="text-base font-bold text-brand-800">KYC required</p>
              <p className="mt-1 text-xs text-slate-600">
                Verify your identity to enable secure withdrawals. Takes about 2 minutes.
              </p>
            </div>
          </div>
          <Link to="/kyc" className="mt-4 block">
            <Button className="w-full">Complete KYC verification</Button>
          </Link>
        </Card>
      ) : (
        <Card className="mt-5 p-4 lg:p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit.mutate();
            }}
            className="space-y-3"
          >
            <Input
              label="Amount (₱)"
              inputMode="decimal"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              error={errors.amount?.[0]}
              required
            />
            <Input
              label="Bank / E-wallet name"
              placeholder="e.g. BPI, GCash"
              value={form.bank_name}
              onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
              error={errors.bank_name?.[0]}
              required
            />
            <Input
              label="Account name"
              placeholder="Account holder full name"
              value={form.account_name}
              onChange={(e) => setForm({ ...form, account_name: e.target.value })}
              error={errors.account_name?.[0]}
              required
            />
            <Input
              label="Account number"
              inputMode="numeric"
              value={form.account_number}
              onChange={(e) => setForm({ ...form, account_number: e.target.value })}
              error={errors.account_number?.[0]}
              required
            />

            {hasFee && amt > 0 && (
              <div className="rounded-2xl bg-gradient-to-br from-gold-50 to-white p-3 ring-1 ring-gold-200">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-gold-700">
                  <Receipt size={11} /> Fee breakdown
                </p>
                <div className="mt-2 space-y-1 text-xs">
                  <Row label="Withdraw amount" value={peso(amt)} />
                  <Row label="Transaction fee" value={`− ${peso(fee)}`} muted />
                  <div className="my-1 border-t border-gold-200" />
                  <Row label="You'll receive" value={peso(net)} highlight />
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 rounded-2xl bg-brand-50 p-3 text-[11px] text-brand-800 ring-1 ring-brand-100">
              <Info size={14} className="mt-0.5 shrink-0 text-brand-600" />
              <p>
                Double-check your account details. Wrong numbers may delay your payout or be
                rejected.
              </p>
            </div>

            {errors._ && <p className="text-sm text-rose-600">{errors._[0]}</p>}
            <Button type="submit" className="w-full" disabled={submit.isPending}>
              {submit.isPending
                ? "Submitting…"
                : hasFee && amt > 0
                ? `Request withdrawal — receive ${peso(net)}`
                : "Request withdrawal"}
            </Button>
          </form>
        </Card>
      )}

      {/* History */}
      <section className="mt-7">
        <SectionTitle eyebrow="History" title="Your withdrawals" />
        {list.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : !list.data?.data?.length ? (
          <Empty>No withdrawals yet.</Empty>
        ) : (
          <ul className="space-y-2">
            {list.data.data.map((w) => (
              <li key={w.uuid}>
                <Card className="flex items-center gap-3 p-3.5">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-50 text-rose-600">
                    <Banknote size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-brand-800">{peso(w.amount)}</p>
                    {Number(w.fee || 0) > 0 && (
                      <p className="text-[11px] text-gold-700">
                        Fee {peso(w.fee)} · Net {peso(w.net_amount)}
                      </p>
                    )}
                    <p className="truncate text-[11px] text-slate-500">
                      {w.bank_name} · {w.account_number}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(w.created_at).toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge status={w.status} />
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageWrap>
  );
}

function Row({ label, value, muted, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-slate-500" : "text-slate-600"}>{label}</span>
      <span
        className={`font-semibold ${
          highlight ? "text-gold-700 text-sm" : muted ? "text-rose-600" : "text-brand-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
