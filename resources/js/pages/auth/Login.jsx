import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input } from "../../components/ui";
import { useAuth } from "../../stores/authStore";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tight gradient-brand bg-clip-text text-transparent">
          ISLA TRADE WALLET
        </h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to continue</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Phone"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {err && <p className="text-sm text-rose-600">{err}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-center text-sm text-slate-500">
          No account?{" "}
          <Link to="/register" className="font-semibold text-brand-600">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
