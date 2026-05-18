import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api, { peso } from "../../lib/api";
import { Button, Card, Input, PageWrap } from "../../components/ui";
import { useAuth } from "../../stores/authStore";

export default function Transfer() {
  const refresh = useAuth((s) => s.refresh);
  const qc = useQueryClient();
  const [phone, setPhone] = useState("");
  const [recipient, setRecipient] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);

  const lookup = useMutation({
    mutationFn: async () => (await api.post("/wallet/transfer/lookup", { phone })).data,
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
    mutationFn: async () => (await api.post("/wallet/transfer", { phone, amount, note })).data,
    onSuccess: (d) => {
      setSuccess(d);
      setAmount("");
      setNote("");
      refresh();
      qc.invalidateQueries({ queryKey: ["wallet-tx"] });
    },
    onError: (e) => setErrors(e.response?.data?.errors || { _: [e.response?.data?.message || "Failed"] }),
  });

  return (
    <PageWrap title="Send money">
      <Card className="p-4 mb-4">
        <Input
          label="Recipient phone"
          inputMode="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setRecipient(null);
            setSuccess(null);
          }}
          error={errors.phone?.[0]}
        />
        <Button variant="soft" className="mt-3 w-full" onClick={() => lookup.mutate()} disabled={!phone || lookup.isPending}>
          {lookup.isPending ? "Looking up…" : "Find recipient"}
        </Button>
      </Card>

      {recipient && (
        <Card className="p-4 mb-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">Sending to</p>
          <p className="mt-1 text-base font-bold">{recipient.name}</p>
          <p className="text-xs text-slate-500 mb-3">{recipient.phone}</p>
          <Input
            label="Amount (₱)"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount?.[0]}
          />
          <div className="h-3" />
          <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          {errors._ && <p className="mt-2 text-sm text-rose-600">{errors._[0]}</p>}
          <Button className="mt-4 w-full" onClick={() => send.mutate()} disabled={send.isPending || !amount}>
            {send.isPending ? "Sending…" : `Send ${amount ? peso(amount) : ""}`}
          </Button>
        </Card>
      )}

      {success && (
        <Card className="p-4 border-emerald-200 bg-emerald-50">
          <p className="text-sm font-semibold text-emerald-800">
            Sent {peso(success.amount)} to {success.recipient.name}
          </p>
          <p className="text-xs text-emerald-700 mt-1">New balance: {peso(success.balance)}</p>
        </Card>
      )}
    </PageWrap>
  );
}
