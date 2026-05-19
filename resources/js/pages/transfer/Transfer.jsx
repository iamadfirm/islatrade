import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Send, CheckCircle2, ArrowRight, User } from "lucide-react";
import api, { peso } from "../../lib/api";
import {
  Button,
  Card,
  Input,
  PageWrap,
  Avatar,
  SectionTitle,
  Pill,
} from "../../components/ui";
import { useAuth } from "../../stores/authStore";

const QUICK = [100, 500, 1000, 2500];

export default function Transfer() {
  const me = useAuth((s) => s.user);
  const refresh = useAuth((s) => s.refresh);
  const qc = useQueryClient();
  const [phone, setPhone] = useState("");
  const [recipient, setRecipient] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);

  const lookup = useMutation({
    mutationFn: async () =>
      (await api.post("/wallet/transfer/lookup", { phone })).data,
    onSuccess: (d) => {
      setRecipient(d);
      setErrors({});
    },
    onError: (e) => {
      setRecipient(null);
      setErrors({ phone: [e.response?.data?.message || "Not found"] });
    },
  });

  const send = useMutation({
    mutationFn: async () =>
      (await api.post("/wallet/transfer", { phone, amount, note })).data,
    onSuccess: (d) => {
      setSuccess(d);
      setAmount("");
      setNote("");
      refresh();
      qc.invalidateQueries({ queryKey: ["wallet-tx"] });
      qc.invalidateQueries({ queryKey: ["wallet-tx-recent"] });
    },
    onError: (e) =>
      setErrors(
        e.response?.data?.errors || {
          _: [e.response?.data?.message || "Failed"],
        }
      ),
  });

  return (
    <PageWrap>
      {/* Hero */}
      <Card className="gradient-hero-rich relative overflow-hidden border-0 p-5 text-white pop-shadow">
        <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="relative flex items-start gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-gold text-brand-900 shadow-md shadow-gold-500/40">
            <Send size={22} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">
              Wallet-to-wallet
            </p>
            <h1 className="text-xl font-black">Send money</h1>
            <p className="text-xs text-white/70">
              Instant transfer to any user on the platform.
            </p>
          </div>
        </div>
        <div className="relative mt-4">
          <p className="text-[10px] uppercase tracking-widest text-white/60">
            Your balance
          </p>
          <p className="text-2xl font-black text-gold-300">
            {peso(me?.wallet_balance)}
          </p>
        </div>
      </Card>

      {/* Recipient lookup */}
      <Card className="mt-5 p-4 lg:p-5">
        <p className="text-xs font-semibold text-slate-600">Recipient</p>
        <div className="mt-2 flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              inputMode="tel"
              placeholder="Recipient phone number"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setRecipient(null);
                setSuccess(null);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-3 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <Button
            variant="soft"
            onClick={() => lookup.mutate()}
            disabled={!phone || lookup.isPending}
          >
            {lookup.isPending ? "…" : "Find"}
          </Button>
        </div>
        {errors.phone && (
          <p className="mt-2 text-xs text-rose-600">{errors.phone[0]}</p>
        )}

        {recipient && (
          <div className="mt-4 fade-up rounded-2xl bg-brand-50/60 p-3.5 ring-1 ring-brand-100">
            <div className="flex items-center gap-3">
              <Avatar name={recipient.name} size={42} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-brand-800">{recipient.name}</p>
                <p className="truncate text-xs text-slate-500">{recipient.phone}</p>
              </div>
              <Pill tone="emerald" dot>Verified user</Pill>
            </div>
          </div>
        )}
      </Card>

      {/* Amount + send */}
      {recipient && (
        <Card className="mt-4 p-4 lg:p-5 fade-up">
          <Input
            label="Amount (₱)"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount?.[0]}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {QUICK.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(v))}
                className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
              >
                {peso(v)}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <Input
              label="Note (optional)"
              placeholder="What's this for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {errors._ && (
            <p className="mt-3 text-sm text-rose-600">{errors._[0]}</p>
          )}

          <Button
            className="mt-4 w-full"
            onClick={() => send.mutate()}
            disabled={send.isPending || !amount}
          >
            {send.isPending ? (
              "Sending…"
            ) : (
              <>
                Send {amount ? peso(amount) : ""} <ArrowRight size={14} />
              </>
            )}
          </Button>
        </Card>
      )}

      {/* Success */}
      {success && (
        <div className="mt-5 fade-up">
          <Card className="border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-emerald-600" />
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-800">
                  Sent {peso(success.amount)} to {success.recipient.name}
                </p>
                <p className="mt-0.5 text-[11px] text-emerald-700">
                  New balance: <b>{peso(success.balance)}</b>
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <section className="mt-7">
        <SectionTitle eyebrow="Tip" title="Send safely" />
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gold-50 text-gold-600">
              <User size={16} />
            </span>
            <p className="text-xs text-slate-600">
              Always verify the recipient's name before sending. Transfers between wallets are
              instant and cannot be reversed.
            </p>
          </div>
        </Card>
      </section>
    </PageWrap>
  );
}
