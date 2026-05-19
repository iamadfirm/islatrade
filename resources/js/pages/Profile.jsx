import { Link, useNavigate } from "react-router-dom";
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
  HelpCircle,
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
} from "../components/ui";
import { useAuth } from "../stores/authStore";
import { peso } from "../lib/api";

export default function Profile() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : "—";

  return (
    <PageWrap>
      {/* Hero */}
      <Card className="gradient-hero-rich relative overflow-hidden border-0 p-5 text-white pop-shadow">
        <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <Avatar name={user?.name} size={64} />
          <div className="min-w-0">
            <p className="text-base font-bold truncate">{user?.name}</p>
            <p className="truncate text-xs text-white/70">{user?.phone}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {(user?.is_admin || user?.is_staff) && <Pill tone="gold">Admin</Pill>}
              {user?.is_frozen && <Pill tone="sky" dot>Frozen</Pill>}
              <Pill tone="brand">Member since {joined}</Pill>
            </div>
          </div>
        </div>
        <div className="relative mt-4 grid grid-cols-2 gap-2">
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
        <SectionTitle eyebrow="Account" title="Personal details" />
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
          <LinkRow
            to="#"
            icon={<KeyRound size={18} />}
            title="Change password"
            sub="Coming soon"
            disabled
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
    </PageWrap>
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
