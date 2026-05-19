import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Layers,
  Pencil,
  Trash2,
  Plus,
  TrendingUp,
  Clock,
  Coins,
  X,
  Pause,
  Play,
} from "lucide-react";
import api, { peso } from "../../lib/api";
import {
  Button,
  Card,
  Input,
  Select,
  PageWrap,
  Loader,
  Empty,
  SectionTitle,
  Pill,
} from "../../components/ui";

const empty = {
  name: "",
  description: "",
  min_amount: "",
  max_amount: "",
  interest_rate: "",
  frequency: "daily",
  term_days: "",
  is_active: true,
  return_capital: true,
};

export default function AdminPackages() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);

  const list = useQuery({
    queryKey: ["admin-packages"],
    queryFn: async () => (await api.get("/admin/packages")).data,
  });

  const save = useMutation({
    mutationFn: async () => {
      const url = editing ? `/admin/packages/${editing}` : "/admin/packages";
      const method = editing ? "put" : "post";
      return (await api[method](url, form)).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-packages"] });
      setEditing(null);
      setForm(empty);
      setErrors({});
      setShowForm(false);
    },
    onError: (e) => setErrors(e.response?.data?.errors || {}),
  });

  const del = useMutation({
    mutationFn: (uuid) => api.delete(`/admin/packages/${uuid}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-packages"] }),
  });

  function startEdit(p) {
    setEditing(p.uuid);
    setForm({
      name: p.name,
      description: p.description ?? "",
      min_amount: p.min_amount,
      max_amount: p.max_amount ?? "",
      interest_rate: p.interest_rate,
      frequency: p.frequency.value,
      term_days: p.term_days,
      is_active: p.is_active,
      return_capital: p.return_capital ?? true,
    });
    setShowForm(true);
  }

  const toggleActive = useMutation({
    mutationFn: (p) => api.put(`/admin/packages/${p.uuid}`, { is_active: !p.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-packages"] }),
  });

  function cancelEdit() {
    setEditing(null);
    setForm(empty);
    setErrors({});
    setShowForm(false);
  }

  return (
    <PageWrap>
      <Card className="gradient-hero-rich relative overflow-hidden border-0 p-5 text-white pop-shadow">
        <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-gold text-brand-900 shadow-md shadow-gold-500/40">
              <Layers size={22} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">
                Partnership
              </p>
              <h1 className="text-xl font-black">Investment packages</h1>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditing(null);
              setForm(empty);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl gradient-gold px-3 py-2 text-xs font-bold text-brand-900 shadow-md shadow-gold-500/30 hover:opacity-95"
          >
            <Plus size={14} /> New
          </button>
        </div>
      </Card>

      {showForm && (
        <Card className="mt-5 p-4 lg:p-5 fade-up">
          <div className="mb-3 flex items-center justify-between">
            <SectionTitle
              eyebrow={editing ? "Edit" : "Create"}
              title={editing ? "Edit package" : "New package"}
            />
            <button
              onClick={cancelEdit}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>
          <div className="space-y-3">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name?.[0]}
            />
            <Input
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Min amount"
                inputMode="decimal"
                value={form.min_amount}
                onChange={(e) => setForm({ ...form, min_amount: e.target.value })}
                error={errors.min_amount?.[0]}
              />
              <Input
                label="Max amount"
                inputMode="decimal"
                value={form.max_amount}
                onChange={(e) => setForm({ ...form, max_amount: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Interest %"
                inputMode="decimal"
                value={form.interest_rate}
                onChange={(e) => setForm({ ...form, interest_rate: e.target.value })}
                error={errors.interest_rate?.[0]}
              />
              <Input
                label="Term days"
                inputMode="numeric"
                value={form.term_days}
                onChange={(e) => setForm({ ...form, term_days: e.target.value })}
                error={errors.term_days?.[0]}
              />
            </div>
            <Select
              label="Payout frequency"
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Select>
            <label className="flex items-center gap-2 rounded-2xl bg-brand-50/60 p-3 text-sm ring-1 ring-brand-100">
              <input
                type="checkbox"
                checked={!!form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 accent-brand-600"
              />
              <span className="font-medium text-brand-800">Active</span>
              <span className="ml-auto text-[11px] text-slate-500">
                Visible to users in the Partnership list
              </span>
            </label>
            <label className="flex items-start gap-2 rounded-2xl bg-gold-50/60 p-3 text-sm ring-1 ring-gold-100">
              <input
                type="checkbox"
                checked={!!form.return_capital}
                onChange={(e) => setForm({ ...form, return_capital: e.target.checked })}
                className="mt-0.5 h-4 w-4 accent-gold-600"
              />
              <div className="flex-1">
                <p className="font-medium text-brand-800">Return capital at maturity</p>
                <p className="text-[11px] text-slate-500">
                  If unchecked, only periodic interest is paid out; principal is retained at maturity.
                </p>
              </div>
            </label>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button onClick={() => save.mutate()} disabled={save.isPending}>
                {editing ? "Update package" : "Create package"}
              </Button>
              <Button variant="ghost" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <section className="mt-5">
        <SectionTitle eyebrow="Catalog" title="All packages" />
        {list.isLoading ? (
          <Loader />
        ) : !list.data?.data?.length ? (
          <Empty>No packages yet — create your first one above.</Empty>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {list.data.data.map((p) => (
              <li key={p.uuid}>
                <Card className="group relative overflow-hidden p-4">
                  <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold-100/60 blur-2xl" />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl gradient-gold text-brand-900">
                        <Layers size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-brand-800">{p.name}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1">
                          {p.is_active ? (
                            <Pill tone="emerald" dot>Active</Pill>
                          ) : (
                            <Pill tone="amber">Paused</Pill>
                          )}
                          <Pill tone="brand">{p.frequency.label}</Pill>
                          {p.return_capital === false && (
                            <Pill tone="slate">Interest-only</Pill>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-gold-600">
                        {p.interest_rate}%
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500">
                        per payout
                      </p>
                    </div>
                  </div>
                  <div className="relative mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div className="rounded-xl bg-brand-50/50 p-2">
                      <p className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-brand-600/70">
                        <Clock size={10} /> Term
                      </p>
                      <p className="mt-0.5 font-bold text-brand-800">{p.term_days} days</p>
                    </div>
                    <div className="rounded-xl bg-brand-50/50 p-2">
                      <p className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-brand-600/70">
                        <Coins size={10} /> Range
                      </p>
                      <p className="mt-0.5 font-bold text-brand-800">
                        {peso(p.min_amount)}
                        {p.max_amount ? `–${peso(p.max_amount)}` : "+"}
                      </p>
                    </div>
                  </div>
                  <div className="relative mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => toggleActive.mutate(p)}
                      disabled={toggleActive.isPending}
                      className={
                        p.is_active
                          ? "inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-100 hover:bg-amber-100 disabled:opacity-50"
                          : "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100 hover:bg-emerald-100 disabled:opacity-50"
                      }
                    >
                      {p.is_active ? (<><Pause size={11} /> Pause</>) : (<><Play size={11} /> Resume</>)}
                    </button>
                    <button
                      onClick={() => startEdit(p)}
                      className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
                    >
                      <Pencil size={11} /> Edit
                    </button>
                    <button
                      onClick={() => confirm(`Delete "${p.name}"?`) && del.mutate(p.uuid)}
                      className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-100 hover:bg-rose-100"
                    >
                      <Trash2 size={11} /> Delete
                    </button>
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
