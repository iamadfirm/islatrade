import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Snowflake,
  Sun,
  Key,
  ShieldCheck,
  ShieldOff,
  Trash2,
  RotateCcw,
  Wallet as WalletIcon,
  X,
  AlertTriangle,
} from "lucide-react";
import api, { peso } from "../../lib/api";
import {
  Button,
  Card,
  Input,
  PageWrap,
  Loader,
  StatusBadge,
  Empty,
  Pill,
} from "../../components/ui";
import { useAuth } from "../../stores/authStore";

export default function AdminUsers() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState(""); // "", "frozen_only", "trashed_only"
  const [openUuid, setOpenUuid] = useState(null);

  const params = new URLSearchParams({ q });
  if (filter) params.set(filter, "1");

  const list = useQuery({
    queryKey: ["admin-users", q, filter],
    queryFn: async () => (await api.get(`/admin/users?${params.toString()}`)).data,
  });

  return (
    <PageWrap title="Users">
      <div className="mb-3 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search by name or phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-3 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm"
        >
          <option value="">All</option>
          <option value="frozen_only">Frozen</option>
          <option value="trashed_only">Deleted</option>
        </select>
      </div>

      {list.isLoading ? (
        <Loader />
      ) : !list.data?.data?.length ? (
        <Empty>No users found.</Empty>
      ) : (
        <ul className="space-y-2">
          {list.data.data.map((u) => (
            <UserCard key={u.uuid} u={u} onOpen={() => setOpenUuid(u.uuid)} />
          ))}
        </ul>
      )}

      {openUuid && (
        <UserDetailModal
          uuid={openUuid}
          onClose={() => setOpenUuid(null)}
          qc={qc}
        />
      )}
    </PageWrap>
  );
}

function UserCard({ u, onOpen }) {
  return (
    <li>
      <button
        onClick={onOpen}
        className="block w-full text-left"
      >
        <Card className="p-4 hover:border-brand-200 transition">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-bold text-brand-800">{u.name}</p>
                {u.is_admin && (
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                    Admin
                  </span>
                )}
                {u.is_frozen && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                    <Snowflake size={10} /> Frozen
                  </span>
                )}
                {u.deleted_at && (
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                    Deleted
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{u.phone}</p>
              <p className="mt-1 text-xs text-slate-600">
                Balance: <b>{peso(u.wallet_balance)}</b>
              </p>
            </div>
            <StatusBadge status={u.kyc_status} />
          </div>
        </Card>
      </button>
    </li>
  );
}

function UserDetailModal({ uuid, onClose, qc }) {
  const [tab, setTab] = useState("overview");
  const me = useAuth((s) => s.user);

  const detail = useQuery({
    queryKey: ["admin-user", uuid],
    queryFn: async () => (await api.get(`/admin/users/${uuid}`)).data?.data,
  });
  const u = detail.data;
  const isSelf = me?.uuid === uuid;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-users"] });
    qc.invalidateQueries({ queryKey: ["admin-user", uuid] });
    qc.invalidateQueries({ queryKey: ["admin-user-wallet", uuid] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4">
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-xl flex flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
          <h2 className="text-sm font-semibold text-brand-800">User details</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-slate-100">
            <X size={18} />
          </button>
        </header>

        {detail.isLoading || !u ? (
          <Loader />
        ) : (
          <>
            <div className="flex border-b border-slate-100 px-4 overflow-x-auto no-scrollbar">
              {["overview", "wallet", "roles", "actions"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-2.5 text-xs font-semibold capitalize ${
                    tab === t
                      ? "border-b-2 border-brand-600 text-brand-700"
                      : "text-slate-500"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {tab === "overview" && <Overview u={u} />}
              {tab === "wallet" && <WalletTab uuid={uuid} />}
              {tab === "roles" && (
                <RolesTab u={u} isSelf={isSelf} onDone={invalidate} />
              )}
              {tab === "actions" && (
                <Actions u={u} isSelf={isSelf} onDone={invalidate} onClose={onClose} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Overview({ u }) {
  return (
    <div className="space-y-2 text-sm">
      <Row label="Name" value={u.name} />
      <Row label="Phone" value={u.phone} />
      <Row label="Email" value={u.email || "—"} />
      <Row
        label="Roles"
        value={
          <div className="flex flex-wrap justify-end gap-1">
            {(u.roles || ["user"]).map((r) => (
              <Pill key={r} tone={r === "admin" ? "gold" : "brand"}>
                {r}
              </Pill>
            ))}
          </div>
        }
      />
      <Row
        label="KYC"
        value={<StatusBadge status={u.kyc_status} />}
      />
      <Row label="Wallet balance" value={<b>{peso(u.wallet_balance)}</b>} />
      <Row
        label="Status"
        value={
          u.deleted_at ? (
            <span className="text-rose-600">Deleted</span>
          ) : u.is_frozen ? (
            <span className="text-sky-700">Frozen</span>
          ) : (
            <span className="text-emerald-700">Active</span>
          )
        }
      />
      {u.is_frozen && (
        <>
          <Row label="Frozen at" value={new Date(u.frozen_at).toLocaleString()} />
          <Row label="Reason" value={u.frozen_reason || "—"} />
        </>
      )}
      <Row label="Joined" value={new Date(u.created_at).toLocaleDateString()} />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-50 py-1.5">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm text-slate-800">{value}</span>
    </div>
  );
}

function WalletTab({ uuid }) {
  const adjust = useAdjust(uuid);
  const tx = useQuery({
    queryKey: ["admin-user-wallet", uuid],
    queryFn: async () =>
      (await api.get(`/admin/users/${uuid}/wallet-transactions`)).data,
  });

  return (
    <div className="space-y-3">
      <Card className="p-3">
        <p className="mb-2 text-xs font-semibold text-brand-700">Adjust balance</p>
        <div className="space-y-2">
          <Input
            placeholder="Amount (+ credit / − debit)"
            inputMode="decimal"
            value={adjust.amount}
            onChange={(e) => adjust.setAmount(e.target.value)}
          />
          <Input
            placeholder="Note (required)"
            value={adjust.note}
            onChange={(e) => adjust.setNote(e.target.value)}
          />
          <Button
            className="w-full"
            disabled={!adjust.amount || !adjust.note || adjust.mut.isPending}
            onClick={() => adjust.mut.mutate()}
          >
            Apply adjustment
          </Button>
        </div>
      </Card>

      <p className="text-xs font-semibold text-brand-700">Recent transactions</p>
      {tx.isLoading ? (
        <Loader />
      ) : !tx.data?.data?.length ? (
        <Empty>No transactions yet.</Empty>
      ) : (
        <ul className="space-y-1.5">
          {tx.data.data.map((t) => (
            <li
              key={t.uuid}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-brand-800">
                  {t.type.label}
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  {t.description || "—"}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-bold ${
                    t.type.is_credit ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {t.type.is_credit ? "+" : "−"}
                  {peso(t.amount)}
                </p>
                <p className="text-[10px] text-slate-400">
                  bal {peso(t.balance_after)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function useAdjust(uuid) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const mut = useMutation({
    mutationFn: () =>
      api.post(`/admin/users/${uuid}/adjust-balance`, {
        amount: Number(amount),
        note,
      }),
    onSuccess: () => {
      setAmount("");
      setNote("");
      qc.invalidateQueries({ queryKey: ["admin-user", uuid] });
      qc.invalidateQueries({ queryKey: ["admin-user-wallet", uuid] });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
  return { amount, setAmount, note, setNote, mut };
}

function Actions({ u, isSelf, onDone, onClose }) {
  const [confirm, setConfirm] = useState(null); // {action, label, run}
  const [freezeReason, setFreezeReason] = useState("");
  const [password, setPassword] = useState("");

  const call = (path, body) => api.post(`/admin/users/${u.uuid}${path}`, body || {});

  const run = (label, fn) => {
    setConfirm({
      label,
      run: async () => {
        try {
          await fn();
          onDone();
          setConfirm(null);
        } catch (e) {
          const msg =
            e?.response?.data?.message ||
            e?.response?.data?.errors?.user?.[0] ||
            "Action failed.";
          alert(msg);
          setConfirm(null);
        }
      },
    });
  };

  if (isSelf) {
    return (
      <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200">
        You cannot perform admin actions on your own account.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Freeze / Unfreeze */}
      {!u.is_frozen ? (
        <Card className="p-3">
          <ActionTitle icon={<Snowflake size={16} />} label="Freeze account" />
          <Input
            className="mt-2"
            placeholder="Reason (optional)"
            value={freezeReason}
            onChange={(e) => setFreezeReason(e.target.value)}
          />
          <Button
            variant="ghost"
            className="mt-2 w-full"
            onClick={() =>
              run("Freeze this account?", () =>
                call("/freeze", { reason: freezeReason })
              )
            }
          >
            Freeze
          </Button>
        </Card>
      ) : (
        <Card className="p-3">
          <ActionTitle icon={<Sun size={16} />} label="Unfreeze account" />
          <Button
            variant="ghost"
            className="mt-2 w-full"
            onClick={() => run("Unfreeze this account?", () => call("/unfreeze"))}
          >
            Unfreeze
          </Button>
        </Card>
      )}

      {/* Reset password */}
      <Card className="p-3">
        <ActionTitle icon={<Key size={16} />} label="Reset password" />
        <Input
          className="mt-2"
          type="password"
          placeholder="New password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="ghost"
          className="mt-2 w-full"
          disabled={password.length < 8}
          onClick={() =>
            run("Reset password and sign user out?", async () => {
              await call("/reset-password", { password });
              setPassword("");
            })
          }
        >
          Set new password
        </Button>
      </Card>

      {/* Reset KYC */}
      <Card className="p-3">
        <ActionTitle icon={<RotateCcw size={16} />} label="Reset KYC" />
        <p className="text-[11px] text-slate-500">
          Clears submission so the user can resubmit.
        </p>
        <Button
          variant="ghost"
          className="mt-2 w-full"
          onClick={() => run("Reset this user's KYC?", () => call("/reset-kyc"))}
        >
          Reset
        </Button>
      </Card>

      {/* Promote / Demote */}
      <Card className="p-3">
        <ActionTitle
          icon={u.is_admin ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
          label={u.is_admin ? "Demote from admin" : "Promote to admin"}
        />
        <Button
          variant="ghost"
          className="mt-2 w-full"
          onClick={() =>
            run(
              u.is_admin ? "Demote this user from admin?" : "Promote to admin?",
              () => call("/toggle-admin")
            )
          }
        >
          {u.is_admin ? "Demote" : "Promote"}
        </Button>
      </Card>

      {/* Delete / Restore */}
      {!u.deleted_at ? (
        <Card className="p-3 ring-1 ring-rose-100">
          <ActionTitle icon={<Trash2 size={16} className="text-rose-600" />} label="Soft-delete user" />
          <Button
            variant="danger"
            className="mt-2 w-full"
            onClick={() =>
              run("Soft-delete this user? (recoverable)", async () => {
                await api.delete(`/admin/users/${u.uuid}`);
                onClose();
              })
            }
          >
            Delete
          </Button>
        </Card>
      ) : (
        <Card className="p-3">
          <ActionTitle icon={<RotateCcw size={16} />} label="Restore user" />
          <Button
            variant="ghost"
            className="mt-2 w-full"
            onClick={() => run("Restore this user?", () => call("/restore"))}
          >
            Restore
          </Button>
        </Card>
      )}

      {confirm && (
        <ConfirmDialog
          label={confirm.label}
          onCancel={() => setConfirm(null)}
          onConfirm={confirm.run}
        />
      )}
    </div>
  );
}

function ActionTitle({ icon, label }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-brand-800">
      {icon}
      {label}
    </div>
  );
}

function ConfirmDialog({ label, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">
      <Card className="w-full max-w-xs p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-amber-500" />
          <p className="text-sm text-slate-800">{label}</p>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </Card>
    </div>
  );
}

function RolesTab({ u, isSelf, onDone }) {
  const qc = useQueryClient();
  const roles = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => (await api.get("/admin/roles")).data,
  });

  const initial = new Set(u.roles || []);
  const [selected, setSelected] = useState(initial);

  const dirty =
    selected.size !== initial.size ||
    Array.from(selected).some((r) => !initial.has(r));

  const save = useMutation({
    mutationFn: async () =>
      api.post(`/admin/users/${u.uuid}/roles`, {
        roles: Array.from(selected),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
      onDone();
    },
    onError: (e) => alert(e?.response?.data?.errors?.user?.[0] || "Failed"),
  });

  if (isSelf) {
    return (
      <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200">
        You can't change your own roles.
      </div>
    );
  }

  if (roles.isLoading) return <Loader />;

  const toggle = (name) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(name) ? n.delete(name) : n.add(name);
      // base "user" role is always implied — visually always on
      if (name === "user") n.add("user");
      return n;
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-slate-500">
        Assign one or more roles to grant admin capabilities. The base <b>user</b> role is always
        applied and can't be removed.
      </p>

      <ul className="space-y-2">
        {(roles.data || []).map((r) => {
          const checked = selected.has(r.name) || r.name === "user";
          const disabled = r.name === "user";
          return (
            <li key={r.id}>
              <label
                className={`flex items-start gap-3 rounded-2xl border p-3 cursor-pointer transition ${
                  checked
                    ? "border-gold-300 bg-gold-50/60"
                    : "border-slate-200 bg-white hover:border-brand-200"
                } ${disabled ? "opacity-80 cursor-default" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(r.name)}
                  className="mt-1 h-4 w-4 accent-gold-500"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-brand-800 capitalize">{r.name}</p>
                    {r.protected && <Pill tone="amber">System</Pill>}
                  </div>
                  {r.permissions.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.permissions.slice(0, 6).map((p) => (
                        <Pill key={p} tone="brand">
                          {p}
                        </Pill>
                      ))}
                      {r.permissions.length > 6 && (
                        <Pill tone="slate">+{r.permissions.length - 6}</Pill>
                      )}
                    </div>
                  ) : (
                    <p className="mt-0.5 text-[11px] text-slate-500">No admin capabilities.</p>
                  )}
                </div>
              </label>
            </li>
          );
        })}
      </ul>

      <Button
        className="w-full"
        onClick={() => save.mutate()}
        disabled={!dirty || save.isPending}
      >
        {save.isPending ? "Saving…" : "Save roles"}
      </Button>

      {u.permissions?.length > 0 && (
        <div className="rounded-2xl bg-brand-50/60 p-3 ring-1 ring-brand-100">
          <p className="text-[10px] uppercase tracking-widest text-brand-700/80">
            Effective capabilities
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {u.permissions.map((p) => (
              <Pill key={p} tone="gold">
                {p}
              </Pill>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
