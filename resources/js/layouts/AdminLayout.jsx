import { NavLink, Outlet, Link } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  Wallet,
  ShieldCheck,
  Layers,
  Users,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../stores/authStore";

const nav = [
  { to: "/admin/deposits", icon: Banknote, label: "Deposits" },
  { to: "/admin/withdrawals", icon: Wallet, label: "Withdrawals" },
  { to: "/admin/kyc", icon: ShieldCheck, label: "KYC" },
  { to: "/admin/packages", icon: Layers, label: "Packages" },
  { to: "/admin/users", icon: Users, label: "Users" },
];

export default function AdminLayout() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

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
              <p className="text-[11px] text-gold-400">Admin Console</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <Link
            to="/"
            className="mb-3 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition"
          >
            <LayoutDashboard size={18} />
            Back to app
          </Link>
          <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Manage
          </p>
          {nav.map((item) => (
            <SideLink key={item.to} {...item} />
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 px-2 text-xs text-white/60 truncate">
            Signed in as <span className="text-white">{user?.name}</span>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-gold-400 transition"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:min-h-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-brand-100 bg-white px-4 py-3 lg:hidden">
          <Link to="/" className="rounded-full p-1.5 hover:bg-brand-50">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-base font-semibold text-brand-800">Admin</h1>
        </header>

        {/* Desktop topbar */}
        <header className="hidden lg:flex sticky top-0 z-10 items-center justify-between border-b border-brand-100 bg-white/80 px-8 py-3 backdrop-blur">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-brand-600/70">
              Admin
            </p>
            <h1 className="text-lg font-semibold text-brand-800">
              Operations Console
            </h1>
          </div>
          <span className="rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold text-gold-600 ring-1 ring-gold-200">
            Administrator
          </span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-md lg:max-w-6xl lg:px-8 lg:py-2">
            <Outlet />
          </div>
        </main>

        <nav className="sticky bottom-0 z-10 grid grid-cols-5 gap-1 border-t border-brand-100 bg-white px-1 pt-2 safe-bottom lg:hidden">
          {nav.map((item) => (
            <BottomTab key={item.to} {...item} />
          ))}
        </nav>
      </div>
    </div>
  );
}

function SideLink({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
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

function BottomTab({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] ${
          isActive ? "text-brand-700 font-semibold" : "text-slate-500"
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}
