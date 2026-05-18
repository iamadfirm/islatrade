import { NavLink, Outlet, Link } from "react-router-dom";
import {
  Wallet,
  LayoutDashboard,
  Sparkles,
  User,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useAuth } from "../stores/authStore";
import { peso } from "../lib/api";

const primaryNav = [
  { to: "/", icon: LayoutDashboard, label: "Home", end: true },
  { to: "/wallet", icon: Wallet, label: "Wallet" },
  { to: "/partnership", icon: Sparkles, label: "Partnership" },
  { to: "/profile", icon: User, label: "Profile" },
];

const quickNav = [
  { to: "/deposit", icon: ArrowDownToLine, label: "Deposit" },
  { to: "/withdraw", icon: ArrowUpFromLine, label: "Withdraw" },
  { to: "/transfer", icon: ArrowLeftRight, label: "Transfer" },
  { to: "/kyc", icon: ShieldCheck, label: "KYC" },
];

export default function AppLayout() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const isAdmin = user?.is_admin || user?.roles?.includes?.("admin");

  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:sticky lg:top-0 lg:h-screen lg:flex-col gradient-hero text-white">
        <div className="px-6 pt-7 pb-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-gold text-brand-900 font-black">
              H
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">ISLA TRADE WALLET</p>
              <p className="text-[11px] text-white/60">Digital Wallet</p>
            </div>
          </div>
        </div>

        <div className="px-5 pt-5 pb-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-[10px] uppercase tracking-widest text-white/60">
              Total balance
            </p>
            <p className="mt-1 text-2xl font-bold text-gold-400">
              {peso(user?.wallet_balance)}
            </p>
            <p className="mt-0.5 text-xs text-white/70 truncate">
              {user?.name} · {user?.phone}
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Menu
          </p>
          {primaryNav.map((item) => (
            <SideLink key={item.to} {...item} />
          ))}

          <p className="px-3 pt-5 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Quick actions
          </p>
          {quickNav.map((item) => (
            <SideLink key={item.to} {...item} />
          ))}

          {isAdmin && (
            <>
              <p className="px-3 pt-5 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                Admin
              </p>
              <SideLink to="/admin/deposits" icon={ShieldCheck} label="Admin Panel" />
            </>
          )}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-gold-400 transition"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen flex-col lg:min-h-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-10 px-4 pt-5 pb-3 gradient-hero text-white lg:hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-white/70">
                Hello,
              </p>
              <h2 className="text-base font-semibold">{user?.name}</h2>
            </div>
            <Link
              to="/wallet"
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-gold-400 ring-1 ring-white/15 backdrop-blur"
            >
              {peso(user?.wallet_balance)}
            </Link>
          </div>
        </header>

        {/* Desktop topbar */}
        <header className="hidden lg:flex sticky top-0 z-10 items-center justify-between border-b border-brand-100 bg-white/80 px-8 py-3 backdrop-blur">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-brand-600/70">
              Welcome back
            </p>
            <h1 className="text-lg font-semibold text-brand-800">
              {user?.name}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/deposit"
              className="rounded-xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition"
            >
              + Deposit
            </Link>
            <Link
              to="/wallet"
              className="rounded-xl gradient-gold px-4 py-2 text-sm font-bold text-brand-900 shadow-sm hover:opacity-95 transition"
            >
              {peso(user?.wallet_balance)}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-md lg:max-w-6xl lg:px-8 lg:py-2">
            <Outlet />
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="sticky bottom-0 z-10 grid grid-cols-4 gap-1 border-t border-brand-100 bg-white px-2 pt-2 safe-bottom lg:hidden">
          {primaryNav.map((item) => (
            <BottomTab key={item.to} {...item} />
          ))}
        </nav>
      </div>
    </div>
  );
}

function SideLink({ to, icon: Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
          isActive
            ? "bg-white/5 text-gold-400 shadow-[inset_2px_0_0_#D4A93C]"
            : "text-white/70 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}

function BottomTab({ to, icon: Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] ${
          isActive ? "text-brand-700 font-semibold" : "text-slate-500"
        }`
      }
    >
      <Icon size={20} />
      {label}
    </NavLink>
  );
}
