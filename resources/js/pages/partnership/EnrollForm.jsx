import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { peso } from "../../lib/api";
import { Button, Card, Input, PageWrap, Loader } from "../../components/ui";
import { useAuth } from "../../stores/authStore";

export default function EnrollForm() {
  const { uuid } = useParams();
  const refresh = useAuth((s) => s.refresh);
  const qc = useQueryClient();
  const nav = useNavigate();
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState({});

  const pkg = useQuery({
    queryKey: ["package", uuid],
    queryFn: async () => (await api.get(`/partnerships/packages/${uuid}`)).data,
  });

  const enroll = useMutation({
    mutationFn: async () =>
      (await api.post("/partnerships/investments", { package_uuid: uuid, amount })).data,
    onSuccess: () => {
      refresh();
      qc.invalidateQueries({ queryKey: ["investments"] });
      qc.invalidateQueries({ queryKey: ["partnership-dash"] });
      nav("/partnership", { replace: true });
    },
    onError: (e) => setErrors(e.response?.data?.errors || { _: [e.response?.data?.message || "Failed"] }),
  });

  if (pkg.isLoading) return <Loader />;
  const p = pkg.data?.data;

  return (
    <PageWrap title={p?.name || "Enroll"}>
      <Card className="p-4 mb-4">
        <p className="text-xs uppercase tracking-widest text-slate-500">Package</p>
        <p className="mt-1 text-2xl font-black">{p?.interest_rate}%</p>
        <p className="text-xs text-slate-500">
          Paid {p?.frequency.label.toLowerCase()} · {p?.term_days} days
        </p>
        <p className="mt-2 text-xs text-slate-600">
          Range: {peso(p?.min_amount)}
          {p?.max_amount ? ` – ${peso(p?.max_amount)}` : "+"}
        </p>
      </Card>

      <Card className="p-4">
        <Input
          label="Amount to invest"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount?.[0]}
        />
        {errors._ && <p className="mt-2 text-sm text-rose-600">{errors._[0]}</p>}
        <Button className="mt-4 w-full" onClick={() => enroll.mutate()} disabled={enroll.isPending || !amount}>
          {enroll.isPending ? "Enrolling…" : "Confirm investment"}
        </Button>
      </Card>
    </PageWrap>
  );
}
