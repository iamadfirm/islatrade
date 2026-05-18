import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { peso } from "../../lib/api";
import { Button, Card, Input, Select, PageWrap, StatusBadge, Loader, Empty } from "../../components/ui";

export default function Deposit() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ amount: "", method: "bank", reference_number: "", proof: null });
  const [errors, setErrors] = useState({});

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
      setErrors({});
    },
    onError: (e) => setErrors(e.response?.data?.errors || {}),
  });

  return (
    <PageWrap title="Deposit">
      <Card className="p-4 mb-5">
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
          <Select
            label="Method"
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value })}
          >
            <option value="bank">Bank transfer</option>
            <option value="gcash">GCash</option>
            <option value="maya">Maya</option>
            <option value="other">Other</option>
          </Select>
          <Input
            label="Reference number"
            value={form.reference_number}
            onChange={(e) => setForm({ ...form, reference_number: e.target.value })}
          />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Proof of payment</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setForm({ ...form, proof: e.target.files?.[0] || null })}
              required
              className="w-full text-sm"
            />
            {errors.proof && <p className="mt-1 text-xs text-rose-600">{errors.proof[0]}</p>}
          </label>
          <Button type="submit" className="w-full" disabled={submit.isPending}>
            {submit.isPending ? "Submitting…" : "Submit deposit"}
          </Button>
        </form>
      </Card>

      <h2 className="mb-2 px-1 text-sm font-semibold text-slate-700">History</h2>
      {isLoading ? (
        <Loader />
      ) : !data?.data?.length ? (
        <Empty>No deposits yet.</Empty>
      ) : (
        <ul className="space-y-2">
          {data.data.map((d) => (
            <li key={d.uuid}>
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base font-bold">{peso(d.amount)}</p>
                    <p className="text-xs text-slate-500">
                      {d.method.toUpperCase()} · {new Date(d.created_at).toLocaleDateString()}
                    </p>
                    {d.admin_note && <p className="mt-1 text-xs text-slate-600">{d.admin_note}</p>}
                  </div>
                  <StatusBadge status={d.status} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </PageWrap>
  );
}
