import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  LogOut,
  ShieldCheck,
  Settings,
  ChevronRight,
  Phone,
  Mail,
  CalendarDays,
  Wallet as WalletIcon,
  KeyRound,
  Gift,
  HelpCircle,
  Camera,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  PageWrap,
  Button,
  StatusBadge,
  Avatar,
  Pill,
  SectionTitle,
  Stat,
  Input,
} from "../components/ui";
import { useAuth } from "../stores/authStore";
import api, { peso } from "../lib/api";

export default function Profile() {
  const { user, logout, refresh } = useAuth();
  const nav = useNavigate();
  const fileRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [flash, setFlash] = useState(null);

  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : "—";

  function showFlash(msg) {
    setFlash(msg);
    setTimeout(() => setFlash(null), 3000);
  }

  const uploadAvatar = useMutation({
    mutationFn: async (file) => {
      const fd = new FormData();
      fd.append("avatar", file);
      return (await api.post("/profile/avatar", fd)).data;
    },
    onSuccess: () => {
      refresh();
      showFlash("Profile photo updated");
    },
  });

  const removeAvatar = useMutation({
    mutationFn: async () => (await api.delete("/profile/avatar")).data,
    onSuccess: () => {
      refresh();
      showFlash("Profile photo removed");
    },
  });

  function pickAvatar(e) {
    const file = e.target.files?.[0];
    if (file) uploadAvatar.mutate(file);
    e.target.value = "";
  }

  return (
    <PageWrap>
      {flash && (
        <div className="mb-3 fade-up">
          <Card className="flex items-center gap-2 border-emerald-200 bg-emerald-50 p-3">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <p className="text-xs font-semibold text-emerald-800">{flash}</p>
          </Card>
        </div>
      )}

      {/* Hero */}
      <Card className="gradient-hero-rich relative overflow-hidden border-0 p-5 text-white pop-shadow">
        <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <Avatar name={user?.name} src={user?.avatar_url} size={64} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadAvatar.isPending}
              className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-gold-500 text-brand-900 ring-2 ring-white shadow-md hover:bg-gold-400 disabled:opacity-60"
              aria-label="Change photo"
            >
              <Camera size={13} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={pickAvatar}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold truncate">{user?.name}</p>
            <p className="truncate text-xs text-white/70">{user?.phone}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {(user?.is_admin || user?.is_staff) && <Pill tone="gold">Admin</Pill>}
              {user?.is_frozen && <Pill tone="sky" dot>Frozen</Pill>}
              <Pill tone="brand">Member since {joined}</Pill>
            </div>
          </div>
        </div>
        {user?.avatar_url && (
          <div className="relative mt-3 flex justify-end">
            <button
              onClick={() => removeAvatar.mutate()}
              disabled={removeAvatar.isPending}
              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/90 ring-1 ring-white/20 hover:bg-white/20"
            >
              <Trash2 size={11} /> Remove photo
            </button>
          </div>
        )}
        <div className="relative mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Stat
            tone="ghost"
            className="!bg-white/10 !border-white/15 !text-white"
            icon={<WalletIcon size={14} />}
            label="Balance"
            value={peso(user?.wallet_balance)}
          />
          <Stat
            tone="ghost"
            className="!bg-white/10 !border-white/15 !text-white"
            icon={<ShieldCheck size={14} />}
            label="KYC"
            value={<StatusBadge status={user?.kyc_status} />}
          />
        </div>
      </Card>

      {/* Account info */}
      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <SectionTitle eyebrow="Account" title="Personal details" />
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
          >
            <Pencil size={11} /> Edit
          </button>
        </div>
        <Card className="divide-y divide-slate-100 p-0">
          <InfoRow icon={<Phone size={16} />} label="Phone" value={user?.phone} />
          <InfoRow icon={<Mail size={16} />} label="Email" value={user?.email || "—"} />
          <InfoRow
            icon={<CalendarDays size={16} />}
            label="Joined"
            value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
          />
        </Card>
      </section>

      {/* Security & verification */}
      <section className="mt-5">
        <SectionTitle eyebrow="Security" title="Verification & protection" />
        <div className="space-y-2">
          <LinkRow
            to="/kyc"
            icon={<ShieldCheck size={18} />}
            title="KYC verification"
            sub={
              user?.kyc_status?.value === "approved"
                ? "Verified ✓"
                : "Required for withdrawals"
            }
          />
          <button onClick={() => setPwOpen(true)} className="w-full text-left">
            <Card className="flex items-center gap-3 p-4 transition hover:border-brand-200">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <KeyRound size={18} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-brand-800">Change password</p>
                <p className="text-[11px] text-slate-500">Update your sign-in password</p>
              </div>
              <ChevronRight className="text-slate-300" />
            </Card>
          </button>
          <LinkRow
            to="/referrals"
            icon={<Gift size={18} />}
            title="Refer & earn"
            sub={user?.referral_code ? `Your code: ${user.referral_code}` : "Invite friends and earn"}
          />
          <LinkRow
            to="#"
            icon={<HelpCircle size={18} />}
            title="Support center"
            sub="Get help with your account"
            disabled
          />
        </div>
      </section>

      {/* Admin shortcut */}
      {(user?.is_admin || user?.is_staff) && (
        <Link to="/admin" className="mt-5 block">
          <Card className="flex items-center gap-3 gradient-brand p-4 text-white border-0">
            <div className="rounded-2xl gradient-gold p-2.5 text-brand-900">
              <Settings size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Admin console</p>
              <p className="text-xs text-white/70">Approvals, packages, users, settings</p>
            </div>
            <ChevronRight className="text-white/60" />
          </Card>
        </Link>
      )}

      <Button
        variant="ghost"
        className="mt-6 w-full"
        onClick={() => logout().then(() => nav("/login", { replace: true }))}
      >
        <LogOut size={16} /> Sign out
      </Button>

      {editing && (
        <EditProfileSheet
          user={user}
          onClose={() => setEditing(false)}
          onSaved={() => {
            refresh();
            setEditing(false);
            showFlash("Profile updated");
          }}
        />
      )}
      {pwOpen && (
        <ChangePasswordSheet
          onClose={() => setPwOpen(false)}
          onSaved={() => {
            setPwOpen(false);
            showFlash("Password updated");
          }}
        />
      )}
    </PageWrap>
  );
}

function EditProfileSheet({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });
  const [errors, setErrors] = useState({});

  const save = useMutation({
    mutationFn: async () => (await api.put("/profile", form)).data,
    onSuccess: () => onSaved(),
    onError: (e) => setErrors(e.response?.data?.errors || {}),
  });

  return (
    <Sheet title="Edit profile" onClose={onClose}>
      <div className="space-y-3">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name?.[0]}
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          error={errors.phone?.[0]}
        />
        <Input
          label="Email (optional)"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email?.[0]}
        />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

function ChangePasswordSheet({ onClose, onSaved }) {
  const [form, setForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});

  const save = useMutation({
    mutationFn: async () => (await api.put("/profile/password", form)).data,
    onSuccess: () => onSaved(),
    onError: (e) => setErrors(e.response?.data?.errors || {}),
  });

  return (
    <Sheet title="Change password" onClose={onClose}>
      <div className="space-y-3">
        <Input
          label="Current password"
          type="password"
          value={form.current_password}
          onChange={(e) => setForm({ ...form, current_password: e.target.value })}
          error={errors.current_password?.[0]}
        />
        <Input
          label="New password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password?.[0]}
        />
        <Input
          label="Confirm new password"
          type="password"
          value={form.password_confirmation}
          onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Update"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

function Sheet({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl fade-up">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-brand-800">{title}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-slate-100">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-50 text-brand-700">
        {icon}
      </span>
      <span className="text-xs text-slate-500">{label}</span>
      <span className="ml-auto text-sm font-semibold text-brand-800 truncate">{value}</span>
    </div>
  );
}

function LinkRow({ to, icon, title, sub, disabled }) {
  const inner = (
    <Card className={`flex items-center gap-3 p-4 transition ${disabled ? "opacity-60" : "hover:border-brand-200"}`}>
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-sm font-bold text-brand-800">{title}</p>
        {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
      </div>
      {!disabled && <ChevronRight className="text-slate-300" />}
    </Card>
  );
  return disabled ? inner : <Link to={to}>{inner}</Link>;
}
