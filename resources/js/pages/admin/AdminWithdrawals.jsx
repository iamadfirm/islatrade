import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { peso } from "../../lib/api";
import { Button, Card, Input, PageWrap, StatusBadge, Loader, Empty } from "../../components/ui";

export default function AdminWithdrawals() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-withdrawals", filter],
    queryFn: async () => (await api.get(`/admin/withdrawals?status=${filter}`)).data,
  });

  return (
    <PageWrap title="Withdrawals">
      <Tabs value={filter} onChange={setFilter} />
      {isLoading ? <Loader /> : !data?.data?.length ? <Empty>No {filter} withdrawals.</Empty> : (
        <ul className="space-y-2">{data.data.map((w) => <Row key={w.uuid} w={w} qc={qc} />)}</ul>
      )}
    </PageWrap>
  );
}

function Row({ w, qc }) {
  const [note, setNote] = useState("");
  const approve = useMutation({
    mutationFn: () => api.post(`/admin/withdrawals/${w.uuid}/approve`, { admin_note: note || null }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-withdrawals"] }),
  });
  const reject = useMutation({
    mutationFn: () => api.post(`/admin/withdrawals/${w.uuid}/reject`, { admin_note: note || "Rejected" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-withdrawals"] }),
  });
  return (
    <li>
      <Card className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-base font-bold">{peso(w.amount)}</p>
            <p className="text-xs text-slate-500">{w.user?.name} · {w.user?.phone}</p>
            <p className="text-xs text-slate-600 mt-1">
              {w.bank_name} · {w.account_name}<br />
              {w.account_number}
            </p>
          </div>
          <StatusBadge status={w.status} />
        </div>
        {w.status.value === "pending" && (
          <>
            <Input placeholder="Admin note" value={note} onChange={(e) => setNote(e.target.value)} className="mb-2" />
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => approve.mutate()} disabled={approve.isPending}>Approve</Button>
              <Button variant="danger" onClick={() => reject.mutate()} disabled={reject.isPending || !note}>Reject</Button>
            </div>
          </>
        )}
      </Card>
    </li>
  );
}

function Tabs({ value, onChange }) {
  return (
    <div className="mb-3 flex gap-2">
      {["pending", "approved", "rejected"].map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`flex-1 rounded-2xl px-3 py-1.5 text-xs font-semibold capitalize ${
            value === t ? "gradient-brand text-white" : "bg-white border border-slate-200 text-slate-600"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
