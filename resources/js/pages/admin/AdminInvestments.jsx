import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  Search,
  Phone,
  Mail,
  ShieldCheck,
  Wallet as WalletIcon,
  Calendar,
  Clock,
  TrendingUp,
  X,
  Snowflake,
  Layers,
} from "lucide-react";
import api, { peso } from "../../lib/api";
import {
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
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "matured", label: "Matured" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminInvestments() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const list = useQuery({
    queryKey: ["admin-investments", status, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (search) params.set("search", search);
      return (await api.get(`/admin/investments?${params.toString()}`)).data;
    },
  });

  return (
    <PageWrap>
      <Card className="gradient-hero-rich relative overflow-hidden border-0 p-5 text-white pop-shadow">
        <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-gold text-brand-900 shadow-md shadow-gold-500/40">
            <Briefcase size={22} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">
              Partnership
            </p>
            <h1 className="text-xl font-black">Investor enrollments</h1>
            <p className="text-xs text-white/70">
              See who invested, in which package, and how much.
            </p>
          </div>
        </div>
      </Card>

      <div className="my-4 space-y-2">
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or email"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-4 gap-1.5 rounded-2xl bg-white p-1.5 ring-1 ring-brand-100">
          {TABS.map((t) => (
            <button
              key={t.value || "all"}
              onClick={() => setStatus(t.value)}
              className={`rounded-xl px-2 py-2 text-[11px] font-semibold transition ${
                status === t.value
                  ? "gradient-brand text-white shadow-md"
                  : "text-slate-600 hover:bg-brand-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {list.isLoading ? (
        <Loader />
      ) : !list.data?.data?.length ? (
        <Empty>No investments yet.</Empty>
      ) : (
        <ul className="space-y-2">
          {list.data.data.map((inv) => (
            <InvestmentRow
              key={inv.uuid}
              inv={inv}
              onClick={() => setSelected(inv)}
            />
          ))}
        </ul>
      )}

      {selected && (
        <DetailModal
          uuid={selected.uuid}
          onClose={() => setSelected(null)}
        />
      )}
    </PageWrap>
  );
}

function InvestmentRow({ inv, onClick }) {
  const u = inv.user || {};
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left"
      >
        <Card className="overflow-hidden p-4 hover:bg-brand-50/40 transition">
          <div className="flex items-start gap-3">
            <Avatar name={u.name} src={u.avatar_url} size={44} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-bold text-brand-800">
                  {u.name || "Unknown investor"}
                </p>
                {u.frozen && (
                  <Pill tone="sky">
                    <Snowflake size={10} className="mr-0.5" /> Frozen
                  </Pill>
                )}
              </div>
              <p className="truncate text-xs text-slate-500">{u.phone}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <Pill tone="brand">
                  <Layers size={10} className="mr-0.5" />
                  {inv.package?.name || "—"}
                </Pill>
                <Pill tone="slate">{inv.frequency?.label}</Pill>
              </div>
            </div>
            <div className="text-right">
              <p className="text-base font-black text-gold-600">
                {peso(inv.principal)}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                principal
              </p>
              <div className="mt-1 flex justify-end">
                <StatusBadge status={inv.status} />
              </div>
            </div>
          </div>
        </Card>
      </button>
    </li>
  );
}

function DetailModal({ uuid, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-investment", uuid],
    queryFn: async () => (await api.get(`/admin/investments/${uuid}`)).data,
  });

  const inv = data?.data;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/70 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-100 bg-white px-5 py-3">
          <SectionTitle eyebrow="Partnership" title="Investment details" />
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        {isLoading || !inv ? (
          <Loader />
        ) : (
          <div className="p-5">
            <InvestorBlock user={inv.user} />
            <PackageBlock inv={inv} />
            <ScheduleBlock inv={inv} />
            <TxBlock txs={inv.transactions || []} />
          </div>
        )}
      </div>
    </div>
  );
}

function InvestorBlock({ user }) {
  if (!user) return null;
  return (
    <Card className="p-4">
      <SectionTitle eyebrow="Investor" title={user.name || "—"} />
      <div className="mt-2 flex items-center gap-3">
        <Avatar name={user.name} src={user.avatar_url} size={48} />
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="flex items-center gap-1.5 text-xs text-slate-600">
            <Phone size={12} className="text-brand-500" />
            <span className="font-mono">{user.phone || "—"}</span>
          </p>
          {user.email && (
            <p className="flex items-center gap-1.5 text-xs text-slate-600">
              <Mail size={12} className="text-brand-500" />
              <span className="truncate">{user.email}</span>
            </p>
          )}
          <p className="flex items-center gap-1.5 text-xs text-slate-600">
            <ShieldCheck size={12} className="text-brand-500" />
            KYC:{" "}
            <span className="font-semibold capitalize">
              {user.kyc_status || "none"}
            </span>
          </p>
          <p className="flex items-center gap-1.5 text-xs text-slate-600">
            <WalletIcon size={12} className="text-brand-500" />
            Wallet balance:{" "}
            <span className="font-semibold">{peso(user.wallet_balance)}</span>
          </p>
          {user.created_at && (
            <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Calendar size={11} />
              Joined {new Date(user.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {user.frozen && (
          <Pill tone="sky">
            <Snowflake size={10} className="mr-0.5" /> Frozen
          </Pill>
        )}
        <span className="ml-auto text-[10px] font-mono text-slate-400">
          {user.uuid}
        </span>
      </div>
    </Card>
  );
}

function PackageBlock({ inv }) {
  const p = inv.package || {};
  return (
    <Card className="mt-3 p-4">
      <SectionTitle eyebrow="Package" title={p.name || "—"} />
      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
        <Stat label="Principal" value={peso(inv.principal)} accent />
        <Stat label="Rate per payout" value={`${inv.interest_rate}%`} accent />
        <Stat label="Frequency" value={inv.frequency?.label} />
        <Stat label="Term" value={`${inv.term_days} days`} />
        <Stat label="Total paid out" value={peso(inv.total_paid_out)} />
        <Stat
          label="Status"
          value={
            <span className="capitalize font-bold">
              {inv.status?.label}
            </span>
          }
        />
      </div>
    </Card>
  );
}

function ScheduleBlock({ inv }) {
  return (
    <Card className="mt-3 p-4">
      <SectionTitle eyebrow="Schedule" title="Timeline" />
      <div className="mt-2 space-y-1.5 text-xs text-slate-600">
        <ScheduleRow
          icon={Calendar}
          label="Started"
          value={fmt(inv.started_at)}
        />
        <ScheduleRow
          icon={Clock}
          label="Next payout"
          value={fmt(inv.next_payout_at) || "—"}
        />
        <ScheduleRow
          icon={TrendingUp}
          label="Matures"
          value={fmt(inv.matures_at)}
        />
      </div>
    </Card>
  );
}

function ScheduleRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={12} className="text-brand-500" />
      <span className="text-slate-500">{label}:</span>
      <span className="ml-auto font-semibold text-brand-800">{value}</span>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-xl bg-brand-50/50 p-2">
      <p className="text-[10px] uppercase tracking-widest text-brand-600/70">
        {label}
      </p>
      <p
        className={`mt-0.5 ${
          accent ? "text-base font-black text-gold-600" : "font-bold text-brand-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function TxBlock({ txs }) {
  if (!txs.length) {
    return (
      <Card className="mt-3 p-4">
        <SectionTitle eyebrow="Payouts" title="Ledger" />
        <p className="mt-2 text-xs text-slate-500">No payouts processed yet.</p>
      </Card>
    );
  }
  return (
    <Card className="mt-3 p-4">
      <SectionTitle eyebrow="Payouts" title={`${txs.length} transactions`} />
      <ul className="mt-2 divide-y divide-slate-100">
        {txs.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between gap-2 py-2 text-xs"
          >
            <div>
              <p className="font-semibold capitalize text-brand-800">
                {t.type}
              </p>
              <p className="text-[10px] text-slate-500">
                {t.paid_at ? new Date(t.paid_at).toLocaleString() : "—"}
              </p>
            </div>
            <span className="font-bold text-emerald-600">
              +{peso(t.amount)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function fmt(d) {
  return d ? new Date(d).toLocaleString() : null;
}
