import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { peso } from "../../lib/api";
import { Button, Card, Input, PageWrap, StatusBadge, Loader, Empty } from "../../components/ui";

export default function AdminDeposits() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-deposits", filter],
    queryFn: async () => (await api.get(`/admin/deposits?status=${filter}`)).data,
  });

  return (
    <PageWrap title="Deposits">
      <FilterTabs value={filter} onChange={setFilter} />
      {isLoading ? <Loader /> : !data?.data?.length ? <Empty>No {filter} deposits.</Empty> : (
        <ul className="space-y-2">
          {data.data.map((d) => <DepositRow key={d.uuid} d={d} qc={qc} />)}
        </ul>
      )}
    </PageWrap>
  );
}

function DepositRow({ d, qc }) {
  const [note, setNote] = useState("");
  const approve = useMutation({
    mutationFn: () => api.post(`/admin/deposits/${d.uuid}/approve`, { admin_note: note || null }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-deposits"] }),
  });
  const reject = useMutation({
    mutationFn: () => api.post(`/admin/deposits/${d.uuid}/reject`, { admin_note: note || "Rejected" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-deposits"] }),
  });

  return (
    <li>
      <Card className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-base font-bold">{peso(d.amount)} · {d.method}</p>
            <p className="text-xs text-slate-500">{d.user?.name} · {d.user?.phone}</p>
            {d.reference_number && <p className="text-xs text-slate-500">Ref: {d.reference_number}</p>}
          </div>
          <StatusBadge status={d.status} />
        </div>
        {d.proof_url && (
          <a href={d.proof_url} target="_blank" rel="noreferrer">
            <img src={d.proof_url} alt="proof" className="mb-2 max-h-48 w-full rounded-2xl object-contain bg-slate-50" />
          </a>
        )}
        {d.status.value === "pending" && (
          <>
            <Input placeholder="Admin note (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="mb-2" />
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

function FilterTabs({ value, onChange }) {
  const tabs = ["pending", "approved", "rejected"];
  return (
    <div className="mb-3 flex gap-2">
      {tabs.map((t) => (
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
