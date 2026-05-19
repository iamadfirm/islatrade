import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Coins,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Gift,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../stores/authStore";

export default function Register() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    password_confirmation: "",
    referral_code: (params.get("ref") || "").toUpperCase(),
  });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const register = useAuth((s) => s.register);
  const nav = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await register(form);
      nav("/", { replace: true });
    } catch (e) {
      setErrors(
        e.response?.data?.errors || {
          _: [e.response?.data?.message || "Failed."],
        }
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-2">
      <AuthHero />

      <div className="flex min-h-screen items-center justify-center px-6 py-10 lg:min-h-0 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-11 w-11 place-items-center rounded-2xl gradient-gold text-brand-900 font-black shadow-lg shadow-gold-400/30">
              IT
            </span>
            <div>
              <p className="text-base font-bold tracking-wide text-brand-800">
                ISLA TRADE WALLET
              </p>
              <p className="text-xs text-brand-600/70">
                Digital wallet & investments
              </p>
            </div>
          </div>

          <div className="mb-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold-600 ring-1 ring-gold-200">
              <Sparkles size={12} /> Limited welcome bonus
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-brand-900">
              Open your wallet
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Takes under a minute. KYC unlocks investments & withdrawals.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field
              icon={<User size={18} />}
              label="Full name"
              placeholder="Juan Dela Cruz"
              value={form.name}
              onChange={set("name")}
              error={errors.name?.[0]}
              required
            />
            <Field
              icon={<Phone size={18} />}
              label="Phone number"
              placeholder="09xxxxxxxxx"
              inputMode="tel"
              value={form.phone}
              onChange={set("phone")}
              error={errors.phone?.[0]}
              required
            />
            <Field
              icon={<Lock size={18} />}
              label="Password"
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              error={errors.password?.[0]}
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
            <Field
              icon={<Lock size={18} />}
              label="Confirm password"
              type={showPw ? "text" : "password"}
              value={form.password_confirmation}
              onChange={set("password_confirmation")}
              required
            />
            <Field
              icon={<Gift size={18} />}
              label="Referral code (optional)"
              placeholder="e.g. ABC12345"
              value={form.referral_code}
              onChange={(e) =>
                setForm((f) => ({ ...f, referral_code: e.target.value.toUpperCase() }))
              }
              error={errors.referral_code?.[0]}
            />

            {errors._ && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {errors._[0]}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl gradient-brand px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/25 transition active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create my wallet"}
            </button>

            <p className="text-center text-[11px] text-slate-400">
              By continuing you agree to our Terms & Privacy Policy.
            </p>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-brand-700 hover:text-gold-500"
              >
                Sign in →
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, error, trailing, className = "", ...rest }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-brand-700">
        {label}
      </span>
      <div
        className={`group relative flex items-center rounded-2xl border bg-white px-3.5 py-3 transition focus-within:ring-2 ${
          error
            ? "border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-100"
            : "border-brand-100 focus-within:border-gold-400 focus-within:ring-gold-200"
        }`}
      >
        {icon && <span className="mr-2.5 text-brand-500">{icon}</span>}
        <input
          {...rest}
          className={`w-full bg-transparent text-base text-brand-900 placeholder-slate-400 outline-none ${className}`}
        />
        {trailing && <span className="ml-2">{trailing}</span>}
      </div>
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}

function AuthHero() {
  return (
    <aside className="relative hidden overflow-hidden gradient-hero lg:flex lg:flex-col lg:justify-between p-12 text-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl gradient-gold text-brand-900 font-black shadow-lg shadow-gold-400/30">
            IT
          </span>
          <div>
            <p className="text-base font-bold tracking-wide">ISLA TRADE WALLET</p>
            <p className="text-xs text-gold-400/80">Digital wallet & investments</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <p className="text-[11px] uppercase tracking-[0.25em] text-gold-400">
          A new chapter of wealth
        </p>
        <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight">
          Join thousands building <span className="text-gold-400">passive income</span> with Isla Trade.
        </h1>
        <p className="mt-3 text-sm text-white/70">
          Open your wallet for free. No hidden fees. Invest from as little as ₱500 and watch scheduled payouts roll in.
        </p>

        <ul className="mt-8 space-y-3">
          <Bullet icon={<Coins size={16} />} text="₱0 to open · instant peso wallet" />
          <Bullet icon={<TrendingUp size={16} />} text="Daily, weekly & monthly payout packages" />
          <Bullet icon={<ShieldCheck size={16} />} text="KYC-protected and admin-reviewed for safety" />
        </ul>
      </div>

      <div className="relative grid grid-cols-3 gap-3">
        <Stat label="Members" value="12k+" />
        <Stat label="Paid out" value="₱48M" />
        <Stat label="Active plans" value="6" />
      </div>
    </aside>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
      <p className="text-xl font-black text-gold-400">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-white/60">
        {label}
      </p>
    </div>
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
