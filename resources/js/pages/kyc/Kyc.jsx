import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck,
  IdCard,
  Camera,
  ImagePlus,
  CheckCircle2,
  Info,
  Clock,
} from "lucide-react";
import api from "../../lib/api";
import {
  Button,
  Card,
  Input,
  Select,
  PageWrap,
  StatusBadge,
  Loader,
  SectionTitle,
  Pill,
} from "../../components/ui";
import { useAuth } from "../../stores/authStore";

const ID_TYPES = [
  { value: "national_id", label: "National ID (PhilSys)" },
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "umid", label: "UMID" },
  { value: "sss", label: "SSS" },
  { value: "prc", label: "PRC" },
];

export default function Kyc() {
  const refresh = useAuth((s) => s.refresh);
  const qc = useQueryClient();
  const [form, setForm] = useState({
    id_type: "national_id",
    id_number: "",
    id_front: null,
    id_back: null,
    selfie: null,
  });
  const [previews, setPreviews] = useState({ id_front: null, id_back: null, selfie: null });
  const [errors, setErrors] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["kyc"],
    queryFn: async () => (await api.get("/kyc")).data,
  });

  const submit = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v != null && fd.append(k, v));
      return (await api.post("/kyc", fd)).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kyc"] });
      refresh();
    },
    onError: (e) => setErrors(e.response?.data?.errors || {}),
  });

  if (isLoading) return <Loader />;

  const statusValue = data?.kyc_status?.value;
  const isApproved = statusValue === "approved";
  const isPending = statusValue === "pending" || statusValue === "submitted";
  const canSubmit = !isApproved && !isPending;

  function pickFile(key, file) {
    setForm((f) => ({ ...f, [key]: file }));
    setPreviews((p) => ({ ...p, [key]: file ? URL.createObjectURL(file) : null }));
  }

  return (
    <PageWrap>
      {/* Hero */}
      <Card className="gradient-hero-rich relative overflow-hidden border-0 p-5 text-white pop-shadow">
        <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="relative flex items-start gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-gold text-brand-900 shadow-md shadow-gold-500/40">
            <ShieldCheck size={22} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">
              Identity verification
            </p>
            <h1 className="text-xl font-black">KYC verification</h1>
            <p className="text-xs text-white/70">
              Required for withdrawals. Approved in ~24 hours.
            </p>
          </div>
        </div>
        <div className="relative mt-4 flex items-center justify-between">
          <span className="text-[11px] text-white/80">Status</span>
          <StatusBadge status={data?.kyc_status} />
        </div>
      </Card>

      {/* Stepper */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <Step n={1} title="Submit" active={!isApproved} done={isPending || isApproved} />
        <Step n={2} title="Review" active={isPending} done={isApproved} />
        <Step n={3} title="Approved" active={isApproved} done={isApproved} />
      </div>

      {/* Pending banner */}
      {isPending && (
        <Card className="mt-5 flex items-center gap-3 border-sky-200 bg-sky-50 p-4">
          <Clock className="text-sky-600" />
          <div>
            <p className="text-sm font-bold text-sky-800">Under review</p>
            <p className="text-[11px] text-sky-700">
              We're verifying your documents. You'll be notified shortly.
            </p>
          </div>
        </Card>
      )}

      {isApproved && (
        <Card className="mt-5 flex items-center gap-3 border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="text-emerald-600" />
          <div>
            <p className="text-sm font-bold text-emerald-800">Verified</p>
            <p className="text-[11px] text-emerald-700">
              Your identity is confirmed — all features are unlocked.
            </p>
          </div>
        </Card>
      )}

      {data?.submission?.admin_note && !isApproved && (
        <Card className="mt-4 border-rose-200 bg-rose-50 p-4">
          <div className="flex items-start gap-2">
            <Info size={16} className="mt-0.5 text-rose-600" />
            <div>
              <p className="text-sm font-bold text-rose-800">Previous submission notes</p>
              <p className="mt-1 text-xs text-rose-700">{data.submission.admin_note}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Form */}
      {canSubmit && (
        <Card className="mt-5 p-4 lg:p-5">
          <SectionTitle eyebrow="Step 1" title="Submit documents" />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit.mutate();
            }}
            className="space-y-4"
          >
            <Select
              label="ID type"
              value={form.id_type}
              onChange={(e) => setForm({ ...form, id_type: e.target.value })}
            >
              {ID_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
            <Input
              label="ID number"
              value={form.id_number}
              onChange={(e) => setForm({ ...form, id_number: e.target.value })}
              error={errors.id_number?.[0]}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <FileTile
                label="ID front"
                icon={<IdCard size={16} />}
                preview={previews.id_front}
                onPick={(f) => pickFile("id_front", f)}
                error={errors.id_front?.[0]}
                required
              />
              <FileTile
                label="ID back"
                icon={<IdCard size={16} />}
                preview={previews.id_back}
                onPick={(f) => pickFile("id_back", f)}
                optional
              />
            </div>

            <FileTile
              label="Selfie holding ID"
              icon={<Camera size={16} />}
              preview={previews.selfie}
              onPick={(f) => pickFile("selfie", f)}
              error={errors.selfie?.[0]}
              required
              fullWidth
            />

            <div className="flex items-start gap-2 rounded-2xl bg-gold-50/60 p-3 text-[11px] text-gold-800 ring-1 ring-gold-200">
              <Info size={14} className="mt-0.5 shrink-0 text-gold-600" />
              <p>
                Make sure all four corners of the ID are visible, text is readable, and your face
                is unobstructed.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={submit.isPending}>
              {submit.isPending ? "Submitting…" : "Submit for verification"}
            </Button>
          </form>
        </Card>
      )}
    </PageWrap>
  );
}

function Step({ n, title, active, done }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-2xl p-3 ring-1 ${
        done
          ? "bg-emerald-50 ring-emerald-200 text-emerald-700"
          : active
          ? "bg-gold-50 ring-gold-200 text-gold-700"
          : "bg-white ring-slate-200 text-slate-400"
      }`}
    >
      <span
        className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold ${
          done
            ? "bg-emerald-500 text-white"
            : active
            ? "bg-gold-500 text-white"
            : "bg-slate-200 text-slate-500"
        }`}
      >
        {done ? "✓" : n}
      </span>
      <span className="text-[11px] font-semibold">{title}</span>
    </div>
  );
}

function FileTile({ label, icon, preview, onPick, error, required, optional, fullWidth }) {
  return (
    <label className={`block cursor-pointer ${fullWidth ? "col-span-2" : ""}`}>
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
        {icon} {label}
        {optional && <Pill tone="slate">Optional</Pill>}
      </span>
      {preview ? (
        <div className="relative overflow-hidden rounded-2xl ring-1 ring-brand-100">
          <img src={preview} alt={label} className="aspect-[4/3] w-full object-cover" />
          <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-brand-700 ring-1 ring-brand-100">
            Replace
          </span>
        </div>
      ) : (
        <div className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/40 text-center transition hover:bg-brand-50">
          <ImagePlus className="text-brand-600" />
          <span className="text-[11px] font-semibold text-brand-700">Tap to upload</span>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => onPick(e.target.files?.[0] || null)}
        required={required}
        className="hidden"
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </label>
  );
}
