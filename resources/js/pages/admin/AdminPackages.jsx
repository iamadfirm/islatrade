import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { peso } from "../../lib/api";
import { Button, Card, Input, Select, PageWrap, Loader } from "../../components/ui";

const empty = { name: "", description: "", min_amount: "", max_amount: "", interest_rate: "", frequency: "daily", term_days: "", is_active: true };

export default function AdminPackages() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

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
      name: p.name, description: p.description ?? "", min_amount: p.min_amount,
      max_amount: p.max_amount ?? "", interest_rate: p.interest_rate,
      frequency: p.frequency.value, term_days: p.term_days, is_active: p.is_active,
    });
  }

  return (
    <PageWrap title="Packages">
      <Card className="p-4 mb-4">
        <h2 className="mb-3 text-sm font-semibold">{editing ? "Edit package" : "New package"}</h2>
        <div className="space-y-3">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name?.[0]} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input label="Min amount" inputMode="decimal" value={form.min_amount} onChange={(e) => setForm({ ...form, min_amount: e.target.value })} error={errors.min_amount?.[0]} />
            <Input label="Max amount" inputMode="decimal" value={form.max_amount} onChange={(e) => setForm({ ...form, max_amount: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input label="Interest %" inputMode="decimal" value={form.interest_rate} onChange={(e) => setForm({ ...form, interest_rate: e.target.value })} error={errors.interest_rate?.[0]} />
            <Input label="Term days" inputMode="numeric" value={form.term_days} onChange={(e) => setForm({ ...form, term_days: e.target.value })} error={errors.term_days?.[0]} />
          </div>
          <Select label="Frequency" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Active
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => save.mutate()} disabled={save.isPending}>{editing ? "Update" : "Create"}</Button>
            {editing && <Button variant="ghost" onClick={() => { setEditing(null); setForm(empty); }}>Cancel</Button>}
          </div>
        </div>
      </Card>

      {list.isLoading ? <Loader /> : (
        <ul className="space-y-2">
          {list.data?.data?.map((p) => (
            <li key={p.uuid}>
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base font-bold">{p.name}</p>
                    <p className="text-xs text-slate-500">
                      {p.interest_rate}% {p.frequency.label.toLowerCase()} · {p.term_days}d
                    </p>
                    <p className="text-xs text-slate-500">
                      {peso(p.min_amount)} {p.max_amount ? `– ${peso(p.max_amount)}` : "+"} · {p.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button className="text-xs text-brand-600 font-semibold" onClick={() => startEdit(p)}>Edit</button>
                    <button className="text-xs text-rose-600 font-semibold" onClick={() => confirm("Delete?") && del.mutate(p.uuid)}>Delete</button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </PageWrap>
  );
}
