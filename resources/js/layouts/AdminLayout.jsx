import { useEffect, useState } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Banknote,
  Wallet,
  ShieldCheck,
  Layers,
  Users,
  LogOut,
  LayoutDashboard,
  Sliders,
  Bell,
  Menu,
  X,
  UserCircle,
  KeySquare,
  Wallet2,
} from "lucide-react";
import { useAuth } from "../stores/authStore";
import api from "../lib/api";
import { Avatar } from "../components/ui";
import { useCan } from "../lib/permissions";

export default function AdminLayout() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const loc = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => setDrawerOpen(false), [loc.pathname]);

  const canDashboard = useCan("dashboard.view");
  const canDeposits = useCan("deposits.manage");
  const canWithdrawals = useCan("withdrawals.manage");
  const canKyc = useCan("kyc.manage");
  const canPackages = useCan("packages.manage");
  const canUsers = useCan("users.manage");
  const canSettings = useCan("settings.manage");
  const canRoles = useCan("roles.manage");

  const stats = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => (await api.get("/admin/dashboard/stats")).data,
    staleTime: 60 * 1000,
    enabled: canDashboard,
  });

  const counts = stats.data?.pending || {};

  const nav = [
    canDashboard && { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
    canDeposits && { to: "/admin/deposits", icon: Banknote, label: "Deposits", badge: counts.deposits },
    canWithdrawals && { to: "/admin/withdrawals", icon: Wallet, label: "Withdrawals", badge: counts.withdrawals },
    canKyc && { to: "/admin/kyc", icon: ShieldCheck, label: "KYC", badge: counts.kyc },
    canPackages && { to: "/admin/packages", icon: Layers, label: "Packages" },
    canUsers && { to: "/admin/users", icon: Users, label: "Users" },
    canRoles && { to: "/admin/roles", icon: KeySquare, label: "Roles" },
    canSettings && { to: "/admin/deposit-methods", icon: Wallet2, label: "Pay methods" },
    canSettings && { to: "/admin/settings", icon: Sliders, label: "Settings" },
  ].filter(Boolean);

  const totalPending = (counts.deposits || 0) + (counts.withdrawals || 0) + (counts.kyc || 0);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:sticky lg:top-0 lg:h-screen lg:flex-col gradient-hero-rich text-white">
        <SidebarContent nav={nav} user={user} onLogout={logout} />
      </aside>

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <SidebarContent nav={nav} user={user} onLogout={logout} mobile />
      </MobileDrawer>

      <div className="flex min-h-screen flex-col lg:min-h-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-brand-100 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
            >
              <Menu size={18} />
            </button>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-brand-600/70">Admin</p>
              <h1 className="text-sm font-bold text-brand-800">Operations</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              aria-label="Switch to wallet app"
              title="Switch to wallet app"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gold-50 px-3 text-[11px] font-bold text-gold-700 ring-1 ring-gold-200 hover:bg-gold-100"
            >
              <UserCircle size={14} /> User
            </Link>
            <div className="relative">
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-brand-100"
                aria-label="Pending"
              >
                <Bell size={16} />
              </button>
              {totalPending > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold-400 px-1 text-[9px] font-bold text-brand-900 ring-1 ring-white pulse-dot">
                  {totalPending}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Desktop topbar */}
        <header className="hidden lg:flex sticky top-0 z-10 items-center justify-between border-b border-brand-100 bg-white/85 px-8 py-3 backdrop-blur">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-brand-600/70">
              Admin
            </p>
            <h1 className="text-lg font-bold text-brand-800">
              Operations Console
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
            >
              <UserCircle size={14} /> Wallet app
            </Link>
            <div className="relative">
              <button
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
                aria-label="Pending notifications"
              >
                <Bell size={18} />
                {totalPending > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold-400 px-1 text-[10px] font-bold text-brand-900 ring-2 ring-white pulse-dot">
                    {totalPending}
                  </span>
                )}
              </button>
            </div>
            <span className="rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold text-gold-600 ring-1 ring-gold-200">
              Administrator
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-md lg:max-w-6xl lg:px-8 lg:py-2">
            <Outlet />
          </div>
        </main>

        <nav
          className="sticky bottom-0 z-10 flex gap-0.5 overflow-x-auto no-scrollbar border-t border-brand-100 bg-white/95 px-1 pt-2 safe-bottom backdrop-blur lg:hidden"
        >
          {nav.map((item) => (
            <div key={item.to} className="flex-1 min-w-[64px]">
              <BottomTab {...item} />
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

function SidebarContent({ nav, user, onLogout, mobile }) {
  return (
    <>
      <div className={`px-6 ${mobile ? "pt-5" : "pt-7"} pb-5 border-b border-white/10`}>
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-gold text-brand-900 font-black shadow-lg shadow-gold-500/30">
            H
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide">ISLA TRADE WALLET</p>
            <p className="text-[11px] text-gold-300/80">Admin Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <Link
          to="/"
          className="mb-3 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gold-300 ring-1 ring-white/10 hover:bg-white/5 hover:text-gold-200 transition"
        >
          <ArrowLeft size={18} />
          Switch to wallet app
        </Link>
        <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Manage
        </p>
        {nav.map((item) => (
          <SideLink key={item.to} {...item} />
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-white/5 p-2">
          <Avatar name={user?.name} src={user?.avatar_url} size={32} />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">{user?.name}</p>
            <p className="text-[10px] text-gold-300">Administrator</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-gold-400 transition"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </>
  );
}

function SideLink({ to, icon: Icon, label, end, badge }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
          isActive
            ? "bg-white/5 text-gold-300 shadow-[inset_2px_0_0_#D4A93C]"
            : "text-white/70 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      <Icon size={18} />
      {label}
      {badge > 0 && (
        <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold-400 px-1 text-[10px] font-bold text-brand-900">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

function BottomTab({ to, icon: Icon, label, end, badge }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `relative flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] ${
          isActive ? "text-brand-700 font-semibold" : "text-slate-500"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`relative grid h-8 w-8 place-items-center rounded-xl transition ${
              isActive
                ? "gradient-gold text-brand-900 shadow-md shadow-gold-400/40"
                : "text-slate-500"
            }`}
          >
            <Icon size={16} />
            {badge > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-1 ring-white">
                {badge}
              </span>
            )}
          </span>
          <span className="text-[9px]">{label}</span>
        </>
      )}
    </NavLink>
  );
}

function MobileDrawer({ open, onClose, children }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/60 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85%] flex-col gradient-hero-rich text-white shadow-2xl transition-transform lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 hover:bg-white/20"
        >
          <X size={16} />
        </button>
        {children}
      </aside>
    </>
  );
}
