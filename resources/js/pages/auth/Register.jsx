import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input } from "../../components/ui";
import { useAuth } from "../../stores/authStore";

export default function Register() {
  const [form, setForm] = useState({ name: "", phone: "", password: "", password_confirmation: "" });
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
      setErrors(e.response?.data?.errors || { _: [e.response?.data?.message || "Failed."] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tight gradient-brand bg-clip-text text-transparent">
          Create account
        </h1>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <Input label="Full name" value={form.name} onChange={set("name")} error={errors.name?.[0]} required />
        <Input label="Phone" inputMode="tel" value={form.phone} onChange={set("phone")} error={errors.phone?.[0]} required />
        <Input label="Password" type="password" value={form.password} onChange={set("password")} error={errors.password?.[0]} required />
        <Input
          label="Confirm password"
          type="password"
          value={form.password_confirmation}
          onChange={set("password_confirmation")}
          required
        />
        {errors._ && <p className="text-sm text-rose-600">{errors._[0]}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </Button>
        <p className="text-center text-sm text-slate-500">
          Have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-600">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
