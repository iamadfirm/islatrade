import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  KeySquare,
  Plus,
  Pencil,
  Trash2,
  Users,
  ShieldCheck,
  X,
  Save,
  Lock,
} from "lucide-react";
import api from "../../lib/api";
import {
  Card,
  PageWrap,
  Loader,
  Empty,
  Pill,
  SectionTitle,
  Button,
  Input,
} from "../../components/ui";

export default function AdminRoles() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);

  const roles = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => (await api.get("/admin/roles")).data,
  });

  const caps = useQuery({
    queryKey: ["admin-roles-capabilities"],
    queryFn: async () => (await api.get("/admin/roles/capabilities")).data,
  });

  const onClose = () => setEditing(null);

  return (
    <PageWrap>
      <Card className="gradient-hero-rich relative overflow-hidden border-0 p-5 text-white pop-shadow">
        <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-gold text-brand-900 shadow-md shadow-gold-500/40">
              <KeySquare size={22} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">Access control</p>
              <h1 className="text-xl font-black">Roles & capabilities</h1>
              <p className="text-xs text-white/70">
                Define what each role can manage in the admin console.
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditing({ name: "", permissions: [], protected: false, _new: true })}
            className="inline-flex items-center gap-1.5 rounded-xl gradient-gold px-3 py-2 text-xs font-bold text-brand-900 shadow-md shadow-gold-500/30 hover:opacity-95"
          >
            <Plus size={14} /> New role
          </button>
        </div>
      </Card>

      <section className="mt-5">
        <SectionTitle eyebrow="Catalog" title="All roles" />
        {roles.isLoading ? (
          <Loader />
        ) : !roles.data?.length ? (
          <Empty>No roles yet.</Empty>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {roles.data.map((r) => (
              <li key={r.id}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-brand-800 capitalize">{r.name}</p>
                        {r.protected && (
                          <Pill tone="amber">
                            <Lock size={10} className="mr-0.5" /> System
                          </Pill>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500 inline-flex items-center gap-1">
                        <Users size={11} /> {r.users_count} user{r.users_count === 1 ? "" : "s"} ·{" "}
                        {r.permissions.length} capabilit
                        {r.permissions.length === 1 ? "y" : "ies"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditing(r)}
                        className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
                      >
                        <Pencil size={11} /> Edit
                      </button>
                      {!r.protected && (
                        <button
                          onClick={() => {
                            if (!confirm(`Delete role "${r.name}"?`)) return;
                            api.delete(`/admin/roles/${r.id}`).then(
                              () => qc.invalidateQueries({ queryKey: ["admin-roles"] }),
                              (e) =>
                                alert(
                                  e?.response?.data?.errors?.role?.[0] ||
                                    e?.response?.data?.message ||
                                    "Failed"
                                )
                            );
                          }}
                          className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-100 hover:bg-rose-100"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                  {r.permissions.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {r.permissions.map((p) => (
                        <Pill key={p} tone="brand">
                          <ShieldCheck size={10} className="mr-0.5" /> {capLabel(p, caps.data)}
                        </Pill>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-[11px] text-slate-400">
                      No admin capabilities — base member access only.
                    </p>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editing && (
        <RoleEditor
          role={editing}
          capabilities={caps.data || []}
          onClose={onClose}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["admin-roles"] });
            onClose();
          }}
        />
      )}
    </PageWrap>
  );
}

function capLabel(key, list) {
  return list?.find((c) => c.key === key)?.label || key;
}

function RoleEditor({ role, capabilities, onClose, onSaved }) {
  const [name, setName] = useState(role.name || "");
  const [perms, setPerms] = useState(new Set(role.permissions || []));
  const [errors, setErrors] = useState({});
  const isNew = !!role._new;
  const isProtected = role.protected;
  const isAdminRole = role.name === "admin";

  useEffect(() => {
    setName(role.name || "");
    setPerms(new Set(role.permissions || []));
  }, [role]);

  const save = useMutation({
    mutationFn: async () => {
      const body = {
        name,
        permissions: Array.from(perms),
      };
      if (isNew) return (await api.post("/admin/roles", body)).data;
      return (await api.put(`/admin/roles/${role.id}`, body)).data;
    },
    onSuccess: onSaved,
    onError: (e) => setErrors(e.response?.data?.errors || {}),
  });

  const toggle = (k) => {
    setPerms((s) => {
      const n = new Set(s);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  };

  const grouped = useMemo(() => capabilities, [capabilities]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4">
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-xl flex flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-brand-600/70">
              {isNew ? "Create" : "Edit"}
            </p>
            <h2 className="text-sm font-bold text-brand-800">
              {isNew ? "New role" : `Edit ${role.name}`}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-slate-100">
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Input
            label="Role name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name?.[0]}
            disabled={isProtected}
          />

          {isAdminRole && (
            <div className="rounded-2xl bg-amber-50 p-3 text-[11px] text-amber-800 ring-1 ring-amber-200">
              The <b>admin</b> role always has every capability — its permissions can't be reduced.
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-semibold text-slate-600">Capabilities</p>
            <ul className="space-y-1.5">
              {grouped.map((c) => {
                const checked = perms.has(c.key);
                return (
                  <li key={c.key}>
                    <label
                      className={`flex items-center justify-between gap-2 rounded-2xl border px-3 py-2.5 cursor-pointer transition ${
                        checked
                          ? "border-gold-300 bg-gold-50/60"
                          : "border-slate-200 bg-white hover:border-brand-200"
                      } ${isAdminRole ? "opacity-70" : ""}`}
                    >
                      <span>
                        <p className="text-sm font-semibold text-brand-800">{c.label}</p>
                        <p className="text-[10px] font-mono text-slate-500">{c.key}</p>
                      </span>
                      <input
                        type="checkbox"
                        checked={isAdminRole ? true : checked}
                        disabled={isAdminRole}
                        onChange={() => toggle(c.key)}
                        className="h-4 w-4 accent-gold-500"
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <footer className="border-t border-slate-100 p-3">
          <Button
            className="w-full"
            onClick={() => save.mutate()}
            disabled={save.isPending || !name}
          >
            <Save size={14} /> {save.isPending ? "Saving…" : isNew ? "Create role" : "Save changes"}
          </Button>
        </footer>
      </div>
    </div>
  );
}
