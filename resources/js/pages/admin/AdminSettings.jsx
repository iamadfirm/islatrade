import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sliders, ShieldCheck, Save, Percent, Coins } from "lucide-react";
import api, { peso } from "../../lib/api";
import { Card, PageWrap, Loader, Empty, Pill } from "../../components/ui";
import { useAuth } from "../../stores/authStore";

export default function AdminSettings() {
  const qc = useQueryClient();
  const refreshUser = useAuth((s) => s.refresh);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "feature-settings"],
    queryFn: async () => (await api.get("/admin/settings/features")).data,
  });

  const update = useMutation({
    mutationFn: async ({ key, body }) =>
      (await api.put(`/admin/settings/features/${key}`, body)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "feature-settings"] });
      refreshUser();
    },
  });

  if (isLoading) return <Loader />;
  if (!data?.length) return <Empty>No features available.</Empty>;

  return (
    <PageWrap title="Feature Settings">
      <p className="mb-4 text-sm text-slate-500">
        Enable or disable features globally. Toggle <b>Requires KYC</b> to force
        approved KYC before users can use a feature.
      </p>
      <div className="space-y-3">
        {data.map((f) => (
          <FeatureRow
            key={f.key}
            feature={f}
            saving={update.isPending}
            onSave={(body) => update.mutate({ key: f.key, body })}
          />
        ))}
      </div>
    </PageWrap>
  );
}

function FeatureRow({ feature, onSave, saving }) {
  const [enabled, setEnabled] = useState(feature.enabled);
  const [requiresKyc, setRequiresKyc] = useState(feature.requires_kyc);
  const [message, setMessage] = useState(feature.disabled_message || "");
  const [feeFlat, setFeeFlat] = useState(feature.fee_flat ?? "0");
  const [feePercent, setFeePercent] = useState(feature.fee_percent ?? "0");

  useEffect(() => {
    setEnabled(feature.enabled);
    setRequiresKyc(feature.requires_kyc);
    setMessage(feature.disabled_message || "");
    setFeeFlat(feature.fee_flat ?? "0");
    setFeePercent(feature.fee_percent ?? "0");
  }, [feature.enabled, feature.requires_kyc, feature.disabled_message, feature.fee_flat, feature.fee_percent]);

  const dirty =
    enabled !== feature.enabled ||
    requiresKyc !== feature.requires_kyc ||
    (message || "") !== (feature.disabled_message || "") ||
    Number(feeFlat) !== Number(feature.fee_flat ?? 0) ||
    Number(feePercent) !== Number(feature.fee_percent ?? 0);

  // Live preview using ₱1,000 sample
  const sample = 1000;
  const previewFee = Math.max(0, Number(feeFlat || 0) + (sample * Number(feePercent || 0)) / 100);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <Sliders size={18} />
          </span>
          <div>
            <p className="font-semibold text-brand-800">{feature.label}</p>
            <p className="text-xs text-slate-500">key: {feature.key}</p>
          </div>
        </div>
        <Toggle checked={enabled} onChange={setEnabled} label="Enabled" />
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 px-3 py-2">
        <span className="flex items-center gap-2 text-sm text-slate-700">
          <ShieldCheck size={16} className="text-gold-600" />
          Requires KYC approval
        </span>
        <Toggle checked={requiresKyc} onChange={setRequiresKyc} />
      </div>

      <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Coins size={14} className="text-gold-600" /> Transaction fee
          </span>
          {(Number(feeFlat) > 0 || Number(feePercent) > 0) && (
            <Pill tone="gold">
              {peso(previewFee)} on {peso(sample)}
            </Pill>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              <Coins size={10} /> Flat fee (₱)
            </span>
            <input
              inputMode="decimal"
              value={feeFlat}
              onChange={(e) => setFeeFlat(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              <Percent size={10} /> Percent fee
            </span>
            <input
              inputMode="decimal"
              value={feePercent}
              onChange={(e) => setFeePercent(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </label>
        </div>
        <p className="mt-1.5 text-[10px] text-slate-500">
          Formula: <b>flat + amount × percent / 100</b>. Set both to 0 to disable fees.
        </p>
      </div>

      <label className="mt-3 block">
        <span className="mb-1 block text-xs font-medium text-slate-600">
          Disabled message (optional)
        </span>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`${feature.label} is currently disabled.`}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </label>

      <div className="mt-3 flex justify-end">
        <button
          disabled={!dirty || saving}
          onClick={() =>
            onSave({
              enabled,
              requires_kyc: requiresKyc,
              disabled_message: message || null,
              fee_flat: Number(feeFlat) || 0,
              fee_percent: Number(feePercent) || 0,
            })
          }
          className="inline-flex items-center gap-1.5 rounded-xl gradient-brand px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </Card>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      {label && <span className="text-sm text-slate-700">{label}</span>}
      <span
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? "bg-emerald-500" : "bg-slate-300"
        }`}
        onClick={() => onChange(!checked)}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
    </label>
  );
}
