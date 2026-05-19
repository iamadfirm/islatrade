import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpFromLine, Check, X, Copy, Banknote } from "lucide-react";
import api, { peso } from "../../lib/api";
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

export default function AdminWithdrawals() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-withdrawals", filter],
    queryFn: async () => (await api.get(`/admin/withdrawals?status=${filter}`)).data,
  });

  return (
    <PageWrap>
      <Card className="gradient-hero-rich relative overflow-hidden border-0 p-5 text-white pop-shadow">
        <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-gold text-brand-900 shadow-md shadow-gold-500/40">
            <ArrowUpFromLine size={22} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">Approvals</p>
            <h1 className="text-xl font-black">Withdrawal requests</h1>
            <p className="text-xs text-white/70">Pay out funds to verified bank accounts.</p>
          </div>
        </div>
      </Card>

      <Tabs value={filter} onChange={setFilter} />

      {isLoading ? (
        <Loader />
      ) : !data?.data?.length ? (
        <Empty>No {filter} withdrawals.</Empty>
      ) : (
        <ul className="space-y-2">
          {data.data.map((w) => (
            <WithdrawRow key={w.uuid} w={w} qc={qc} />
          ))}
        </ul>
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

function WithdrawRow({ w, qc }) {
  const [note, setNote] = useState("");
  const approve = useMutation({
    mutationFn: () => api.post(`/admin/withdrawals/${w.uuid}/approve`, { admin_note: note || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-withdrawals"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
    },
  });
  const reject = useMutation({
    mutationFn: () => api.post(`/admin/withdrawals/${w.uuid}/reject`, { admin_note: note || "Rejected" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-withdrawals"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
    },
  });

  const copy = (text) => navigator.clipboard?.writeText(text);

  return (
    <li>
      <Card className="overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <Avatar name={w.user?.name} size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-base font-bold text-brand-800">{peso(w.amount)}</p>
              <Pill tone="rose">
                <Banknote size={11} className="mr-0.5" /> Payout
              </Pill>
            </div>
            {Number(w.fee || 0) > 0 && (
              <p className="text-[11px] text-gold-700">
                Fee {peso(w.fee)} · Send {peso(w.net_amount)}
              </p>
            )}
            <p className="truncate text-xs text-slate-500">
              {w.user?.name} · {w.user?.phone}
            </p>
            <p className="text-[11px] text-slate-400">
              {new Date(w.created_at).toLocaleString()}
            </p>
          </div>
          <StatusBadge status={w.status} />
        </div>

        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Send to</p>
            <p className="text-[10px] uppercase tracking-widest text-gold-700">
              Net {peso(w.net_amount || w.amount)}
            </p>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="truncate font-semibold text-brand-800">
              {w.bank_name} · {w.account_name}
            </p>
          </div>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p className="font-mono text-sm text-brand-700">{w.account_number}</p>
            <button
              onClick={() => copy(w.account_number)}
              className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-brand-50"
            >
              <Copy size={11} /> Copy
            </button>
          </div>
        </div>

        {w.status.value === "pending" && (
          <div className="space-y-2 p-4 pt-3">
            <Input
              placeholder="Admin note (required to reject)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => approve.mutate()} disabled={approve.isPending}>
                <Check size={14} /> Approve & pay
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

        {w.status.value !== "pending" && w.admin_note && (
          <p className="border-t border-slate-100 p-3 text-[11px] text-slate-600">
            <b>Admin note:</b> {w.admin_note}
          </p>
        )}
      </Card>
    </li>
  );
}
