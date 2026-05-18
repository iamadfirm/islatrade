import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { peso } from "../../lib/api";
import { Button, Card, Input, PageWrap, StatusBadge, Loader, Empty } from "../../components/ui";

export default function Withdraw() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ amount: "", bank_name: "", account_name: "", account_number: "" });
  const [errors, setErrors] = useState({});

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
    },
    onError: (e) => setErrors(e.response?.data?.errors || { _: [e.response?.data?.message || "Failed"] }),
  });

  const kycOk = info.data?.kyc_status?.value === "approved";

  return (
    <PageWrap title="Withdraw">
      <Card className="p-4 mb-5">
        <p className="text-xs uppercase tracking-widest text-slate-500">Available balance</p>
        <p className="mt-1 text-2xl font-black">{peso(info.data?.balance)}</p>
        <p className="mt-1 text-xs text-slate-500">Minimum withdrawal: ₱{info.data?.min_amount}</p>
      </Card>

      {!kycOk ? (
        <Card className="p-4 mb-5">
          <p className="text-sm font-semibold mb-1">KYC required</p>
          <p className="text-xs text-slate-600 mb-3">You need an approved KYC to withdraw.</p>
          <Link to="/kyc">
            <Button className="w-full">Complete KYC</Button>
          </Link>
        </Card>
      ) : (
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
            <Input
              label="Bank name"
              value={form.bank_name}
              onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
              error={errors.bank_name?.[0]}
              required
            />
            <Input
              label="Account name"
              value={form.account_name}
              onChange={(e) => setForm({ ...form, account_name: e.target.value })}
              error={errors.account_name?.[0]}
              required
            />
            <Input
              label="Account number"
              value={form.account_number}
              onChange={(e) => setForm({ ...form, account_number: e.target.value })}
              error={errors.account_number?.[0]}
              required
            />
            {errors._ && <p className="text-sm text-rose-600">{errors._[0]}</p>}
            <Button type="submit" className="w-full" disabled={submit.isPending}>
              {submit.isPending ? "Submitting…" : "Request withdrawal"}
            </Button>
          </form>
        </Card>
      )}

      <h2 className="mb-2 px-1 text-sm font-semibold text-slate-700">History</h2>
      {list.isLoading ? (
        <Loader />
      ) : !list.data?.data?.length ? (
        <Empty>No withdrawals yet.</Empty>
      ) : (
        <ul className="space-y-2">
          {list.data.data.map((w) => (
            <li key={w.uuid}>
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base font-bold">{peso(w.amount)}</p>
                    <p className="text-xs text-slate-500">
                      {w.bank_name} · {w.account_number}
                    </p>
                    <p className="text-xs text-slate-500">{new Date(w.created_at).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={w.status} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </PageWrap>
  );
}
