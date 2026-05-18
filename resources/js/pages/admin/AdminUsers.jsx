import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { peso } from "../../lib/api";
import { Button, Card, Input, PageWrap, Loader, StatusBadge } from "../../components/ui";

export default function AdminUsers() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const list = useQuery({
    queryKey: ["admin-users", q],
    queryFn: async () => (await api.get(`/admin/users?q=${encodeURIComponent(q)}`)).data,
  });

  return (
    <PageWrap title="Users">
      <Input placeholder="Search by name or phone" value={q} onChange={(e) => setQ(e.target.value)} className="mb-3" />
      {list.isLoading ? <Loader /> : (
        <ul className="space-y-2">
          {list.data?.data?.map((u) => <Row key={u.uuid} u={u} qc={qc} />)}
        </ul>
      )}
    </PageWrap>
  );
}

function Row({ u, qc }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const adjust = useMutation({
    mutationFn: () => api.post(`/admin/users/${u.uuid}/adjust-balance`, { amount: Number(amount), note }),
    onSuccess: () => {
      setAmount(""); setNote("");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
  return (
    <li>
      <Card className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-sm font-bold">{u.name}</p>
            <p className="text-xs text-slate-500">{u.phone}</p>
            <p className="text-xs text-slate-600 mt-1">Balance: {peso(u.wallet_balance)}</p>
          </div>
          <StatusBadge status={u.kyc_status} />
        </div>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs font-semibold text-brand-600">Adjust balance</summary>
          <div className="mt-2 space-y-2">
            <Input placeholder="Amount (positive credit, negative debit)" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Input placeholder="Note (required)" value={note} onChange={(e) => setNote(e.target.value)} />
            <Button className="w-full" onClick={() => adjust.mutate()} disabled={!amount || !note || adjust.isPending}>
              Apply
            </Button>
          </div>
        </details>
      </Card>
    </li>
  );
}
