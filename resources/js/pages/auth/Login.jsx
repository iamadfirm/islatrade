import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Phone, Lock, TrendingUp, ShieldCheck, Coins, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../stores/authStore";

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

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const login = useAuth((s) => s.login);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(phone, password);
      nav("/", { replace: true });
    } catch (e) {
      setErr(e.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-2">
      <AuthHero
        eyebrow="Wealth, in your pocket"
        title="Grow your money. Trade with confidence."
        subtitle="The premium digital wallet for everyday transfers and serious investments."
      />

      <div className="flex min-h-screen items-center justify-center px-6 py-10 lg:min-h-0 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img src="/logo.png" alt="Isla Trade" className="h-11 w-11 rounded-2xl shadow-lg shadow-gold-400/30" />
            <div>
              <p className="text-base font-bold tracking-wide text-brand-800">
                ISLA TRADE WALLET
              </p>
              <p className="text-xs text-brand-600/70">Digital wallet & investments</p>
            </div>
          </div>

          <div className="mb-7">
            <h2 className="text-3xl font-black tracking-tight text-brand-900">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to access your wallet and active partnerships.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field
              icon={<Phone size={18} />}
              label="Phone number"
              placeholder="09xxxxxxxxx"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Field
              icon={<Lock size={18} />}
              label="Password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="text-slate-400 hover:text-brand-700"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {err && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl gradient-brand px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/25 transition active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              secure access
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="text-center text-sm text-slate-500">
              No account yet?{" "}
              <Link
                to="/register"
                className="font-semibold text-brand-700 hover:text-gold-500"
              >
                Create one →
              </Link>
            </p>
          </form>

          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-[#1877F2]/20 bg-[#1877F2]/5 px-4 py-3 text-sm font-semibold text-[#1877F2] transition hover:bg-[#1877F2]/10"
          >
            <Facebook size={18} />
            Follow us on Facebook
          </a>

          <p className="mt-8 text-center text-[11px] text-slate-400">
            By signing in, you agree to our Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, trailing, className = "", ...rest }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-brand-700">
        {label}
      </span>
      <div className="group relative flex items-center rounded-2xl border border-brand-100 bg-white px-3.5 py-3 transition focus-within:border-gold-400 focus-within:ring-2 focus-within:ring-gold-200">
        {icon && <span className="mr-2.5 text-brand-500">{icon}</span>}
        <input
          {...rest}
          className={`w-full bg-transparent text-base text-brand-900 placeholder-slate-400 outline-none ${className}`}
        />
        {trailing && <span className="ml-2">{trailing}</span>}
      </div>
    </label>
  );
}

function AuthHero({ eyebrow, title, subtitle }) {
  return (
    <aside className="relative hidden overflow-hidden gradient-hero lg:flex lg:flex-col lg:justify-between p-12 text-white">
      {/* Decorative glow & coins */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl" />
      <div className="pointer-events-none absolute right-8 top-1/3 h-24 w-24 rounded-full gradient-gold opacity-30 blur-2xl" />

      <div className="relative">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Isla Trade" className="h-12 w-12 rounded-2xl shadow-lg shadow-gold-400/30" />
          <div>
            <p className="text-base font-bold tracking-wide">ISLA TRADE WALLET</p>
            <p className="text-xs text-gold-400/80">Digital wallet & investments</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <p className="text-[11px] uppercase tracking-[0.25em] text-gold-400">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight">
          {title}
        </h1>
        <p className="mt-3 text-sm text-white/70">{subtitle}</p>

        <ul className="mt-8 space-y-3">
          <Bullet icon={<Coins size={16} />} text="Send & receive in seconds — peso wallet, zero fuss." />
          <Bullet icon={<TrendingUp size={16} />} text="Invest in partnership packages with scheduled payouts." />
          <Bullet icon={<ShieldCheck size={16} />} text="Bank-grade KYC and admin-reviewed payouts." />
        </ul>
      </div>

      <div className="relative">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <p className="text-[10px] uppercase tracking-widest text-white/60">
            Sample portfolio
          </p>
          <p className="mt-1 text-3xl font-black text-gold-400">
            ₱ 248,500.<span className="text-2xl">00</span>
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-white/70">
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-semibold text-emerald-300">
              +12.4%
            </span>
            <span>this quarter</span>
          </div>
        </div>
        <p className="mt-4 text-[11px] text-white/50">
          © {new Date().getFullYear()} Isla Trade. All rights reserved.
        </p>
      </div>
    </aside>
  );
}

function Bullet({ icon, text }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid h-7 w-7 place-items-center rounded-lg bg-gold-400/15 text-gold-400">
        {icon}
      </span>
      <span className="text-sm text-white/85">{text}</span>
    </li>
  );
}
