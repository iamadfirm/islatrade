import { useEffect, useState } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
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
  Bell,
  TrendingUp,
  Menu,
  X,
  Gift,
} from "lucide-react";

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61590089355623";

function Facebook({ size = 18, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}
import { useAuth } from "../stores/authStore";
import { peso } from "../lib/api";
import { Avatar, Sparkline } from "../components/ui";

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
  { to: "/referrals", icon: Gift, label: "Referrals" },
  { to: "/kyc", icon: ShieldCheck, label: "KYC" },
];

function balanceSpark(balance) {
  const n = Number(balance || 0);
  const base = Math.max(1, Math.log10(n + 10));
  const seed = (n % 100) || 23;
  return Array.from({ length: 16 }, (_, i) =>
    Math.max(0.4, Math.sin(i * 0.7 + seed * 0.13) * 0.5 + base + (i / 16) * 0.4)
  );
}

export default function AppLayout() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const loc = useLocation();
  const isAdmin = user?.is_admin || user?.is_staff || user?.roles?.includes?.("admin");
  const spark = balanceSpark(user?.wallet_balance);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Auto-close drawer on route change
  useEffect(() => setDrawerOpen(false), [loc.pathname]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:sticky lg:top-0 lg:h-screen lg:flex-col gradient-hero-rich text-white">
        <SidebarContent
          user={user}
          isAdmin={isAdmin}
          spark={spark}
          onLogout={logout}
        />
      </aside>

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <SidebarContent
          user={user}
          isAdmin={isAdmin}
          spark={spark}
          onLogout={logout}
          mobile
        />
      </MobileDrawer>

      {/* Main column */}
      <div className="flex min-h-screen flex-col lg:min-h-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-20 px-4 pt-5 pb-4 gradient-hero-rich text-white lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 hover:bg-white/20"
              >
                <Menu size={18} />
              </button>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-widest text-white/60">
                  Welcome back
                </p>
                <h2 className="truncate text-sm font-semibold">{user?.name}</h2>
              </div>
            </div>
            <Link
              to="/profile"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 hover:bg-white/20"
              aria-label="Notifications"
            >
              <Bell size={16} className="text-white/90" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold-400 pulse-dot" />
            </Link>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/60">Balance</p>
              <p className="text-2xl font-black text-gold-300">
                {peso(user?.wallet_balance)}
              </p>
            </div>
            <Sparkline data={spark} width={110} height={30} />
          </div>
        </header>

        {/* Desktop topbar */}
        <header className="hidden lg:flex sticky top-0 z-10 items-center justify-between border-b border-brand-100 bg-white/85 px-8 py-3 backdrop-blur">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-brand-600/70">
              Dashboard
            </p>
            <h1 className="text-lg font-bold text-brand-800">
              Hi, {user?.name?.split(" ")[0]} 👋
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gold-400 pulse-dot" />
            </button>
            <Link
              to="/deposit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100 transition"
            >
              <ArrowDownToLine size={14} /> Deposit
            </Link>
            <Link
              to="/wallet"
              className="inline-flex items-center gap-2 rounded-xl gradient-gold px-4 py-2 text-sm font-bold text-brand-900 shadow-md shadow-gold-400/30 hover:opacity-95 transition"
            >
              <TrendingUp size={14} /> {peso(user?.wallet_balance)}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-md lg:max-w-6xl lg:px-8 lg:py-2">
            <Outlet />
          </div>
        </main>

        <nav className="sticky bottom-0 z-10 grid grid-cols-4 gap-1 border-t border-brand-100 bg-white/95 px-2 pt-2 safe-bottom backdrop-blur lg:hidden">
          {primaryNav.map((item) => (
            <BottomTab key={item.to} {...item} />
          ))}
        </nav>
      </div>
    </div>
  );
}

function SidebarContent({ user, isAdmin, spark, onLogout, mobile }) {
  return (
    <>
      <div className={`px-6 ${mobile ? "pt-5" : "pt-7"} pb-5 border-b border-white/10`}>
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Isla Trade" className="h-9 w-9 rounded-xl shadow-lg shadow-gold-500/30" />
          <div>
            <p className="text-sm font-semibold tracking-wide">ISLA TRADE WALLET</p>
            <p className="text-[11px] text-gold-300/80">Crypto · Wallet · Partnership</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 pb-3">
        <div className="relative overflow-hidden rounded-2xl glass-dark p-4">
          <span className="pointer-events-none absolute -right-4 -top-6 h-20 w-20 rounded-full bg-gold-400/20 blur-2xl" />
          <p className="text-[10px] uppercase tracking-widest text-white/60">
            Total balance
          </p>
          <p className="mt-0.5 text-2xl font-bold text-gold-300">
            {peso(user?.wallet_balance)}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[11px] text-white/70 truncate">{user?.name}</p>
            <Sparkline data={spark} width={70} height={22} />
          </div>
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

        <p className="px-3 pt-5 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Connect
        </p>
        <a
          href={FACEBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
        >
          <Facebook size={18} />
          Facebook Page
        </a>

        {isAdmin && (
          <>
            <p className="px-3 pt-5 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">
              Admin
            </p>
            <Link
              to="/admin"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gold-300 hover:bg-white/5"
            >
              <ShieldCheck size={18} />
              Admin Console
            </Link>
          </>
        )}
      </nav>

      <div className="border-t border-white/10 p-3">
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

function SideLink({ to, icon: Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
          isActive
            ? "bg-white/5 text-gold-300 shadow-[inset_2px_0_0_#D4A93C]"
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
        `flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] transition ${
          isActive ? "text-brand-700 font-semibold" : "text-slate-500"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`grid h-9 w-9 place-items-center rounded-xl transition ${
              isActive
                ? "gradient-gold text-brand-900 shadow-md shadow-gold-400/40"
                : "text-slate-500"
            }`}
          >
            <Icon size={18} />
          </span>
          <span>{label}</span>
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
