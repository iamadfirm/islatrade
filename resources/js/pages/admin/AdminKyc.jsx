import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Check, X, IdCard, Camera, Image as ImageIcon } from "lucide-react";
import api from "../../lib/api";
import {
  Button,
  Card,
  Input,
  PageWrap,
  StatusBadge,
  Loader,
  Empty,
  Avatar,
  Pill,
} from "../../components/ui";

const TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminKyc() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const [viewImage, setViewImage] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-kyc", filter],
    queryFn: async () => (await api.get(`/admin/kyc?status=${filter}`)).data,
  });

  return (
    <PageWrap>
      <Card className="gradient-hero-rich relative overflow-hidden border-0 p-5 text-white pop-shadow">
        <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-gold text-brand-900 shadow-md shadow-gold-500/40">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">Compliance</p>
            <h1 className="text-xl font-black">KYC submissions</h1>
            <p className="text-xs text-white/70">Verify member identity documents.</p>
          </div>
        </div>
      </Card>

      <div className="my-5 grid grid-cols-3 gap-1.5 rounded-2xl bg-white p-1.5 ring-1 ring-brand-100">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
              filter === t.value
                ? "gradient-brand text-white shadow-md"
                : "text-slate-600 hover:bg-brand-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loader />
      ) : !data?.data?.length ? (
        <Empty>No {filter} submissions.</Empty>
      ) : (
        <ul className="space-y-3">
          {data.data.map((s) => (
            <KycRow key={s.uuid} s={s} qc={qc} onViewImage={setViewImage} />
          ))}
        </ul>
      )}

      {viewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4"
          onClick={() => setViewImage(null)}
        >
          <img src={viewImage} alt="document" className="max-h-[90vh] max-w-full rounded-2xl" />
        </div>
      )}
    </PageWrap>
  );
}

function KycRow({ s, qc, onViewImage }) {
  const [note, setNote] = useState("");
  const approve = useMutation({
    mutationFn: () => api.post(`/admin/kyc/${s.uuid}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-kyc"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
    },
  });
  const reject = useMutation({
    mutationFn: () => api.post(`/admin/kyc/${s.uuid}/reject`, { admin_note: note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-kyc"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
    },
  });

  const docs = [
    { url: s.id_front_url, label: "ID front", icon: IdCard },
    { url: s.id_back_url, label: "ID back", icon: IdCard },
    { url: s.selfie_url, label: "Selfie", icon: Camera },
  ].filter((d) => d.url);

  return (
    <li>
      <Card className="overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <Avatar name={s.user.name} size={40} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-brand-800 truncate">{s.user.name}</p>
            <p className="text-xs text-slate-500 truncate">{s.user.phone}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Pill tone="brand">{s.id_type?.replace("_", " ")}</Pill>
              <span className="text-[11px] text-slate-500 font-mono">{s.id_number}</span>
            </div>
          </div>
          <StatusBadge status={s.status} />
        </div>

        {docs.length > 0 && (
          <div className="grid grid-cols-3 gap-1 px-2">
            {docs.map((d) => {
              const Icon = d.icon;
              return (
                <button
                  key={d.label}
                  onClick={() => onViewImage(d.url)}
                  className="group relative overflow-hidden rounded-xl bg-slate-100"
                >
                  <img
                    src={d.url}
                    className="aspect-square w-full object-cover"
                    alt={d.label}
                  />
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-2 py-1 text-[10px] font-semibold text-white">
                    <span className="inline-flex items-center gap-1">
                      <Icon size={10} /> {d.label}
                    </span>
                    <ImageIcon size={10} />
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {s.status.value === "pending" && (
          <div className="space-y-2 p-4 pt-3">
            <Input
              placeholder="Reject reason (required to reject)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => approve.mutate()} disabled={approve.isPending}>
                <Check size={14} /> Approve
              </Button>
              <Button
                variant="danger"
                onClick={() => reject.mutate()}
                disabled={reject.isPending || !note}
              >
                <X size={14} /> Reject
              </Button>
            </div>
          </div>
        )}

        {s.status.value !== "pending" && s.admin_note && (
          <p className="border-t border-slate-100 p-3 text-[11px] text-slate-600">
            <b>Admin note:</b> {s.admin_note}
          </p>
        )}
      </Card>
    </li>
  );
}
