import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Banknote,
  Building2,
  Smartphone,
  Wallet as WalletIcon,
  Receipt,
  Save,
  ImagePlus,
  Trash2,
  QrCode,
} from "lucide-react";
import api from "../../lib/api";
import {
  Card,
  PageWrap,
  Loader,
  Empty,
  Pill,
  SectionTitle,
  Button,
  Input,
} from "../../components/ui";

const ICONS = {
  bank: Building2,
  gcash: Smartphone,
  maya: WalletIcon,
  other: Receipt,
};

export default function AdminDepositMethods() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["admin-deposit-methods"],
    queryFn: async () => (await api.get("/admin/deposit-methods")).data,
  });

  return (
    <PageWrap>
      <Card className="gradient-hero-rich relative overflow-hidden border-0 p-5 text-white pop-shadow">
        <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-gold text-brand-900 shadow-md shadow-gold-500/40">
            <Banknote size={22} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">
              Deposit configuration
            </p>
            <h1 className="text-xl font-black">Payment methods</h1>
            <p className="text-xs text-white/70">
              Set instructions, account numbers and upload QR codes shown to users on the deposit
              page.
            </p>
          </div>
        </div>
      </Card>

      <section className="mt-5">
        <SectionTitle eyebrow="Methods" title="Configure each option" />
        {list.isLoading ? (
          <Loader />
        ) : !list.data?.length ? (
          <Empty>No methods configured.</Empty>
        ) : (
          <div className="space-y-3">
            {list.data.map((m) => (
              <MethodCard
                key={m.id}
                method={m}
                onSaved={() => qc.invalidateQueries({ queryKey: ["admin-deposit-methods"] })}
              />
            ))}
          </div>
        )}
      </section>
    </PageWrap>
  );
}

function MethodCard({ method, onSaved }) {
  const [label, setLabel] = useState(method.label);
  const [enabled, setEnabled] = useState(method.enabled);
  const [instructions, setInstructions] = useState(method.instructions || "");
  const [accountName, setAccountName] = useState(method.account_name || "");
  const [accountNumber, setAccountNumber] = useState(method.account_number || "");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(method.image_url);
  const [removeImage, setRemoveImage] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setLabel(method.label);
    setEnabled(method.enabled);
    setInstructions(method.instructions || "");
    setAccountName(method.account_name || "");
    setAccountNumber(method.account_number || "");
    setImageFile(null);
    setImagePreview(method.image_url);
    setRemoveImage(false);
  }, [method]);

  const save = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("label", label);
      fd.append("enabled", enabled ? "1" : "0");
      fd.append("instructions", instructions || "");
      fd.append("account_name", accountName || "");
      fd.append("account_number", accountNumber || "");
      if (imageFile) fd.append("image", imageFile);
      if (removeImage) fd.append("remove_image", "1");
      return (await api.post(`/admin/deposit-methods/${method.id}`, fd)).data;
    },
    onSuccess: () => {
      setErrors({});
      onSaved();
    },
    onError: (e) => setErrors(e.response?.data?.errors || {}),
  });

  function pickImage(file) {
    setImageFile(file);
    setRemoveImage(false);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  }

  const Icon = ICONS[method.key] || Receipt;

  return (
    <Card className="p-4 lg:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <Icon size={18} />
          </span>
          <div>
            <p className="font-bold text-brand-800">{method.label}</p>
            <p className="text-[11px] text-slate-500 font-mono">{method.key}</p>
          </div>
        </div>
        <Toggle checked={enabled} onChange={setEnabled} label={enabled ? "Enabled" : "Disabled"} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="space-y-3">
          <Input
            label="Display label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            error={errors.label?.[0]}
          />
          <Input
            label="Account name"
            placeholder="e.g. Juan Dela Cruz"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            error={errors.account_name?.[0]}
          />
          <Input
            label="Account number"
            placeholder="e.g. 1234-5678-90 or 09171234567"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            error={errors.account_number?.[0]}
          />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Instructions
            </span>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={`Steps for users to send to your ${method.label}.`}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            {errors.instructions?.[0] && (
              <p className="mt-1 text-xs text-rose-600">{errors.instructions[0]}</p>
            )}
          </label>
        </div>

        {/* QR / image upload */}
        <div>
          <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <QrCode size={14} className="text-gold-600" /> QR code / image
          </span>
          {imagePreview ? (
            <div className="relative overflow-hidden rounded-2xl ring-1 ring-brand-100">
              <img
                src={imagePreview}
                alt={method.label}
                className="aspect-square w-full object-contain bg-slate-50"
              />
              <div className="absolute right-2 top-2 flex gap-1">
                <label className="cursor-pointer rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-white">
                  Replace
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => pickImage(e.target.files?.[0] || null)}
                  />
                </label>
                <button
                  type="button"
                  onClick={clearImage}
                  className="inline-flex items-center gap-0.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-rose-100 hover:bg-white"
                >
                  <Trash2 size={11} /> Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/40 text-center transition hover:bg-brand-50">
                <ImagePlus className="text-brand-600" />
                <p className="text-xs font-semibold text-brand-700">Upload QR or image</p>
                <p className="text-[10px] text-slate-500">JPG / PNG · max 5 MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickImage(e.target.files?.[0] || null)}
              />
            </label>
          )}
          {errors.image?.[0] && (
            <p className="mt-1 text-xs text-rose-600">{errors.image[0]}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        {enabled ? (
          <Pill tone="emerald" dot>Visible to users</Pill>
        ) : (
          <Pill tone="slate">Hidden from users</Pill>
        )}
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          <Save size={14} /> {save.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </Card>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      {label && <span className="text-xs text-slate-700">{label}</span>}
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
