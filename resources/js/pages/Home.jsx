import { Link } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Send,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Wallet as WalletIcon,
} from "lucide-react";
import { Card, PageWrap, StatusBadge } from "../components/ui";
import { useAuth } from "../stores/authStore";
import { peso } from "../lib/api";

export default function Home() {
  const user = useAuth((s) => s.user);
  const isAdmin = user?.is_admin || user?.roles?.includes?.("admin");

  return (
    <PageWrap>
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Hero card — spans wide on desktop */}
        <div className="lg:col-span-2">
          <Card className="gradient-hero relative overflow-hidden border-0 p-6 text-white shadow-xl shadow-brand-900/20 lg:p-8">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-400/15 blur-2xl" />
            <div className="relative">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">
                Wallet balance
              </p>
              <p className="mt-1 text-4xl font-black tracking-tight text-gold-400 lg:text-5xl">
                {peso(user?.wallet_balance)}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="text-white/70">KYC</span>
                <StatusBadge status={user?.kyc_status} />
              </div>

              <div className="mt-6 hidden gap-3 lg:flex">
                <Link
                  to="/deposit"
                  className="rounded-xl gradient-gold px-4 py-2.5 text-sm font-bold text-brand-900 hover:opacity-95"
                >
                  + Deposit funds
                </Link>
                <Link
                  to="/transfer"
                  className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Send money
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats panel — desktop only */}
        <div className="hidden lg:block">
          <Card className="h-full p-5">
            <p className="text-[11px] uppercase tracking-widest text-brand-600/70">
              Account
            </p>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <WalletIcon size={16} />
                </span>
                <div>
                  <p className="text-xs text-slate-500">Member</p>
                  <p className="font-semibold text-brand-800">{user?.name}</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold-50 text-gold-600">
                  <TrendingUp size={16} />
                </span>
                <div>
                  <p className="text-xs text-slate-500">Partnership</p>
                  <Link
                    to="/partnership"
                    className="font-semibold text-brand-800 hover:text-brand-600"
                  >
                    View packages →
                  </Link>
                </div>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3 text-center lg:grid-cols-4 lg:gap-4">
        <Quick to="/deposit" icon={<ArrowDownToLine />} label="Deposit" />
        <Quick to="/withdraw" icon={<ArrowUpFromLine />} label="Withdraw" />
        <Quick to="/transfer" icon={<Send />} label="Send" />
        <Quick to="/partnership" icon={<Sparkles />} label="Partner" />
      </div>

      {user?.kyc_status?.value !== "approved" && (
        <Link to="/kyc" className="mt-5 block">
          <Card className="flex items-center gap-3 p-4 ring-1 ring-gold-200">
            <div className="rounded-2xl bg-gold-50 p-2 text-gold-600">
              <ShieldCheck />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-brand-800">
                Complete KYC verification
              </p>
              <p className="text-xs text-slate-500">
                Required to withdraw funds.
              </p>
            </div>
          </Card>
        </Link>
      )}

      {isAdmin && (
        <Link to="/admin/deposits" className="mt-4 block">
          <Card className="flex items-center gap-3 p-4 border-brand-200">
            <div className="rounded-2xl gradient-brand p-2.5 text-gold-400">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-800">
                Admin panel
              </p>
              <p className="text-xs text-slate-500">
                Approvals, packages, users
              </p>
            </div>
          </Card>
        </Link>
      )}
    </PageWrap>
  );
}

function Quick({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-1.5 lg:gap-2"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-brand-100 text-brand-700 shadow-sm hover:border-gold-300 hover:text-gold-600 transition lg:h-14 lg:w-14">
        {icon}
      </span>
      <span className="text-[11px] font-medium text-slate-700 lg:text-xs">
        {label}
      </span>
    </Link>
  );
}
