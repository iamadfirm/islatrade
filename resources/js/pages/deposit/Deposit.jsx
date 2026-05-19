import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  Building2,
  Smartphone,
  Wallet as WalletIcon,
  ImagePlus,
  CheckCircle2,
  Info,
  Receipt,
  Copy,
  QrCode,
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
  Pill,
  Skeleton,
} from "../../components/ui";

const METHOD_ICONS = {
  bank: Building2,
  gcash: Smartphone,
  maya: WalletIcon,
  other: Receipt,
};

const QUICK = [500, 1000, 2500, 5000];

export default function Deposit() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ amount: "", method: "", reference_number: "", proof: null });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [success, setSuccess] = useState(false);

  const methods = useQuery({
    queryKey: ["deposit-methods"],
    queryFn: async () => (await api.get("/deposits/methods")).data,
  });

  // Default selection when methods load
  useEffect(() => {
    if (methods.data?.length && !form.method) {
      setForm((f) => ({ ...f, method: methods.data[0].key }));
    }
  }, [methods.data, form.method]);

  const selectedMethod = useMemo(
    () => methods.data?.find((m) => m.key === form.method) || null,
    [methods.data, form.method]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["deposits"],
    queryFn: async () => (await api.get("/deposits")).data,
  });

  const submit = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v != null && fd.append(k, v));
      return (await api.post("/deposits", fd)).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deposits"] });
      setForm({ amount: "", method: "bank", reference_number: "", proof: null });
      setPreview(null);
      setErrors({});
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    },
    onError: (e) => setErrors(e.response?.data?.errors || {}),
  });

  function pickFile(file) {
    setForm((f) => ({ ...f, proof: file }));
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  return (
    <PageWrap>
      {/* Hero */}
      <Card className="gradient-hero-rich relative overflow-hidden border-0 p-5 text-white pop-shadow">
        <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-gold text-brand-900 shadow-md shadow-gold-500/40">
            <ArrowDownToLine size={22} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">Top up</p>
            <h1 className="text-xl font-black">Deposit funds</h1>
            <p className="text-xs text-white/70">Send via bank, GCash, or Maya — we'll verify & credit your wallet.</p>
          </div>
        </div>
      </Card>

      {success && (
        <div className="mt-4 fade-up">
          <Card className="flex items-center gap-3 border-emerald-200 bg-emerald-50 p-3.5">
            <CheckCircle2 className="text-emerald-600" />
            <div>
              <p className="text-sm font-bold text-emerald-800">Deposit submitted</p>
              <p className="text-[11px] text-emerald-700">An admin will review your payment shortly.</p>
            </div>
          </Card>
        </div>
      )}

      {/* Form */}
      <Card className="mt-5 p-4 lg:p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit.mutate();
          }}
          className="space-y-4"
        >
          {/* Method selector */}
          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-600">Payment method</p>
            {!methods.data?.length ? (
              <p className="rounded-2xl bg-amber-50 p-3 text-[11px] text-amber-800 ring-1 ring-amber-200">
                No deposit methods are currently available. Please try again later.
              </p>
            ) : (
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${Math.min(methods.data.length, 4)}, minmax(0, 1fr))` }}
              >
                {methods.data.map((m) => {
                  const Icon = METHOD_ICONS[m.key] || Receipt;
                  const active = form.method === m.key;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setForm({ ...form, method: m.key })}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl border p-2.5 text-[11px] font-semibold transition ${
                        active
                          ? "border-gold-300 bg-gold-50 text-gold-700 ring-2 ring-gold-200"
                          : "border-slate-200 bg-white text-slate-600 hover:border-brand-200"
                      }`}
                    >
                      <Icon size={18} />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected method: instructions + QR + account */}
          {selectedMethod && (selectedMethod.instructions || selectedMethod.image_url || selectedMethod.account_number) && (
            <MethodInstructions m={selectedMethod} />
          )}

          <Input
            label="Amount (₱)"
            inputMode="decimal"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            error={errors.amount?.[0]}
            required
          />
          <div className="flex flex-wrap gap-1.5">
            {QUICK.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setForm((f) => ({ ...f, amount: String(v) }))}
                className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
              >
                + {peso(v)}
              </button>
            ))}
          </div>

          <Input
            label="Reference number"
            placeholder="From your bank/e-wallet receipt"
            value={form.reference_number}
            onChange={(e) => setForm({ ...form, reference_number: e.target.value })}
          />

          {/* File dropzone */}
          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">Proof of payment</p>
            <label className="block cursor-pointer">
              {preview ? (
                <div className="relative overflow-hidden rounded-2xl ring-1 ring-brand-100">
                  <img src={preview} alt="proof preview" className="max-h-52 w-full object-contain bg-slate-50" />
                  <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-brand-700 ring-1 ring-brand-100">
                    Replace
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/40 px-4 py-6 text-center transition hover:bg-brand-50">
                  <ImagePlus className="text-brand-600" />
                  <p className="text-sm font-semibold text-brand-800">Tap to upload receipt</p>
                  <p className="text-[11px] text-slate-500">JPG / PNG · max 5 MB</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0] || null)}
                required
              />
            </label>
            {errors.proof && <p className="mt-1 text-xs text-rose-600">{errors.proof[0]}</p>}
          </div>

          <div className="flex items-start gap-2 rounded-2xl bg-gold-50/60 p-3 text-[11px] text-gold-800 ring-1 ring-gold-200">
            <Info size={14} className="mt-0.5 shrink-0 text-gold-600" />
            <p>
              Send your payment first, then upload the screenshot. Funds credit after admin
              verification.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={submit.isPending}>
            {submit.isPending ? "Submitting…" : "Submit deposit"}
          </Button>
        </form>
      </Card>

      {/* History */}
      <section className="mt-7">
        <SectionTitle eyebrow="History" title="Your deposits" />
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : !data?.data?.length ? (
          <Empty>No deposits yet — your submissions will appear here.</Empty>
        ) : (
          <ul className="space-y-2">
            {data.data.map((d) => (
              <li key={d.uuid}>
                <Card className="flex items-center gap-3 p-3.5">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <ArrowDownToLine size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-brand-800">{peso(d.amount)}</p>
                      <Pill tone="slate">{d.method?.toUpperCase()}</Pill>
                    </div>
                    <p className="truncate text-[11px] text-slate-500">
                      {new Date(d.created_at).toLocaleString()}
                    </p>
                    {d.admin_note && (
                      <p className="mt-0.5 truncate text-[11px] text-slate-600">{d.admin_note}</p>
                    )}
                  </div>
                  <StatusBadge status={d.status} />
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageWrap>
  );
}

function MethodInstructions({ m }) {
  const copy = (text) => text && navigator.clipboard?.writeText(text);
  return (
    <div className="rounded-2xl bg-gradient-to-br from-brand-50/60 to-white p-3.5 ring-1 ring-brand-100">
      <p className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-brand-700/80">
        <QrCode size={11} className="text-gold-600" /> Send your payment to
      </p>
      <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
        {m.image_url && (
          <a
            href={m.image_url}
            target="_blank"
            rel="noreferrer"
            className="block overflow-hidden rounded-2xl ring-1 ring-brand-100"
          >
            <img
              src={m.image_url}
              alt={`${m.label} QR`}
              className="aspect-square w-full max-w-[180px] object-contain bg-white"
            />
          </a>
        )}
        <div className="space-y-1.5">
          {m.account_name && (
            <Row label="Account name" value={m.account_name} onCopy={() => copy(m.account_name)} />
          )}
          {m.account_number && (
            <Row
              label="Account number"
              value={m.account_number}
              mono
              onCopy={() => copy(m.account_number)}
            />
          )}
          {m.instructions && (
            <div className="mt-1 whitespace-pre-line rounded-xl bg-white/80 p-2.5 text-[11px] leading-relaxed text-slate-700 ring-1 ring-brand-100">
              {m.instructions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono, onCopy }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <p className={`text-sm font-semibold text-brand-800 ${mono ? "font-mono" : ""}`}>{value}</p>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-brand-50"
        >
          <Copy size={11} /> Copy
        </button>
      </div>
    </div>
  );
}
