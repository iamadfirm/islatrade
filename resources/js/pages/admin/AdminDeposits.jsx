import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  Check,
  X,
  Image as ImageIcon,
  Building2,
  Smartphone,
  Wallet as WalletIcon,
  Receipt,
} from "lucide-react";
import api, { peso } from "../../lib/api";
import {
  Button,
  Card,
  Input,
  PageWrap,
  StatusBadge,
  Loader,
  Empty,
  SectionTitle,
  Avatar,
  Pill,
} from "../../components/ui";

const TABS = [
  { value: "pending", label: "Pending", tone: "amber" },
  { value: "approved", label: "Approved", tone: "emerald" },
  { value: "rejected", label: "Rejected", tone: "rose" },
];

const METHOD_ICONS = {
  bank: Building2,
  gcash: Smartphone,
  maya: WalletIcon,
  other: Receipt,
};

export default function AdminDeposits() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const [viewImage, setViewImage] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-deposits", filter],
    queryFn: async () => (await api.get(`/admin/deposits?status=${filter}`)).data,
  });

  return (
    <PageWrap>
      {/* Hero */}
      <Card className="gradient-hero-rich relative overflow-hidden border-0 p-5 text-white pop-shadow">
        <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-gold text-brand-900 shadow-md shadow-gold-500/40">
            <ArrowDownToLine size={22} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">Approvals</p>
            <h1 className="text-xl font-black">Deposit requests</h1>
            <p className="text-xs text-white/70">Review proofs and approve incoming top-ups.</p>
          </div>
        </div>
      </Card>

      <Tabs value={filter} onChange={setFilter} />

      {isLoading ? (
        <Loader />
      ) : !data?.data?.length ? (
        <Empty>No {filter} deposits.</Empty>
      ) : (
        <ul className="space-y-2">
          {data.data.map((d) => (
            <DepositRow key={d.uuid} d={d} qc={qc} onViewImage={setViewImage} />
          ))}
        </ul>
      )}

      {viewImage && (
        <ImageLightbox src={viewImage} onClose={() => setViewImage(null)} />
      )}
    </PageWrap>
  );
}

function Tabs({ value, onChange }) {
  return (
    <div className="my-5 grid grid-cols-3 gap-1.5 rounded-2xl bg-white p-1.5 ring-1 ring-brand-100">
      {TABS.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
            value === t.value
              ? "gradient-brand text-white shadow-md"
              : "text-slate-600 hover:bg-brand-50"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function DepositRow({ d, qc, onViewImage }) {
  const [note, setNote] = useState("");
  const approve = useMutation({
    mutationFn: () => api.post(`/admin/deposits/${d.uuid}/approve`, { admin_note: note || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-deposits"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
    },
  });
  const reject = useMutation({
    mutationFn: () => api.post(`/admin/deposits/${d.uuid}/reject`, { admin_note: note || "Rejected" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-deposits"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
    },
  });

  const MethodIcon = METHOD_ICONS[d.method] || Receipt;

  return (
    <li>
      <Card className="overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <Avatar name={d.user?.name} size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-base font-bold text-brand-800">{peso(d.amount)}</p>
              <Pill tone="slate">
                <MethodIcon size={11} className="mr-0.5" />
                {d.method?.toUpperCase()}
              </Pill>
            </div>
            <p className="truncate text-xs text-slate-500">
              {d.user?.name} · {d.user?.phone}
            </p>
            {d.reference_number && (
              <p className="truncate text-[11px] text-slate-500">
                Ref: <span className="font-mono">{d.reference_number}</span>
              </p>
            )}
            <p className="text-[11px] text-slate-400">
              {new Date(d.created_at).toLocaleString()}
            </p>
          </div>
          <StatusBadge status={d.status} />
        </div>

        {d.proof_url && (
          <button
            type="button"
            onClick={() => onViewImage(d.proof_url)}
            className="block w-full"
          >
            <div className="relative">
              <img
                src={d.proof_url}
                alt="proof"
                className="max-h-56 w-full object-contain bg-slate-50"
              />
              <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-brand-700 ring-1 ring-brand-100">
                <ImageIcon size={11} /> Zoom
              </span>
            </div>
          </button>
        )}

        {d.status.value === "pending" && (
          <div className="space-y-2 p-4 pt-3">
            <Input
              placeholder="Admin note (required to reject)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => approve.mutate()}
                disabled={approve.isPending}
              >
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

        {d.status.value !== "pending" && d.admin_note && (
          <p className="border-t border-slate-100 p-3 text-[11px] text-slate-600">
            <b>Admin note:</b> {d.admin_note}
          </p>
        )}
      </Card>
    </li>
  );
}

function ImageLightbox({ src, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4"
      onClick={onClose}
    >
      <img src={src} alt="proof" className="max-h-[90vh] max-w-full rounded-2xl" />
    </div>
  );
}
