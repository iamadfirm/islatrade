import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import { Button, Card, Input, PageWrap, StatusBadge, Loader, Empty } from "../../components/ui";

export default function AdminKyc() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-kyc", filter],
    queryFn: async () => (await api.get(`/admin/kyc?status=${filter}`)).data,
  });

  return (
    <PageWrap title="KYC submissions">
      <div className="mb-3 flex gap-2">
        {["pending", "approved", "rejected"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`flex-1 rounded-2xl px-3 py-1.5 text-xs font-semibold capitalize ${
              filter === t ? "gradient-brand text-white" : "bg-white border border-slate-200 text-slate-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {isLoading ? <Loader /> : !data?.data?.length ? <Empty>No {filter} submissions.</Empty> : (
        <ul className="space-y-2">{data.data.map((s) => <Row key={s.uuid} s={s} qc={qc} />)}</ul>
      )}
    </PageWrap>
  );
}

function Row({ s, qc }) {
  const [note, setNote] = useState("");
  const approve = useMutation({
    mutationFn: () => api.post(`/admin/kyc/${s.uuid}/approve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-kyc"] }),
  });
  const reject = useMutation({
    mutationFn: () => api.post(`/admin/kyc/${s.uuid}/reject`, { admin_note: note }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-kyc"] }),
  });
  return (
    <li>
      <Card className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-sm font-bold">{s.user.name} · {s.user.phone}</p>
            <p className="text-xs text-slate-500">{s.id_type} · {s.id_number}</p>
          </div>
          <StatusBadge status={s.status} />
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {[s.id_front_url, s.id_back_url, s.selfie_url].filter(Boolean).map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noreferrer">
              <img src={url} className="aspect-square w-full rounded-xl object-cover bg-slate-100" />
            </a>
          ))}
        </div>
        {s.status.value === "pending" && (
          <>
            <Input placeholder="Reject reason" value={note} onChange={(e) => setNote(e.target.value)} className="mb-2" />
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
