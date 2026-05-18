import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import { Button, Card, Input, Select, PageWrap, StatusBadge, Loader } from "../../components/ui";
import { useAuth } from "../../stores/authStore";

export default function Kyc() {
  const refresh = useAuth((s) => s.refresh);
  const qc = useQueryClient();
  const [form, setForm] = useState({ id_type: "national_id", id_number: "", id_front: null, id_back: null, selfie: null });
  const [errors, setErrors] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["kyc"],
    queryFn: async () => (await api.get("/kyc")).data,
  });

  const submit = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v != null && fd.append(k, v));
      return (await api.post("/kyc", fd)).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kyc"] });
      refresh();
    },
    onError: (e) => setErrors(e.response?.data?.errors || {}),
  });

  if (isLoading) return <Loader />;

  return (
    <PageWrap title="KYC verification">
      <Card className="p-4 mb-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Current status</span>
          <StatusBadge status={data?.kyc_status} />
        </div>
        {data?.submission?.admin_note && (
          <p className="mt-2 text-xs text-rose-600">Note: {data.submission.admin_note}</p>
        )}
      </Card>

      {data?.kyc_status?.value !== "approved" && data?.kyc_status?.value !== "pending" && (
        <Card className="p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit.mutate();
            }}
            className="space-y-3"
          >
            <Select label="ID type" value={form.id_type} onChange={(e) => setForm({ ...form, id_type: e.target.value })}>
              <option value="national_id">National ID</option>
              <option value="passport">Passport</option>
              <option value="drivers_license">Driver's License</option>
              <option value="umid">UMID</option>
              <option value="sss">SSS</option>
              <option value="prc">PRC</option>
            </Select>
            <Input
              label="ID number"
              value={form.id_number}
              onChange={(e) => setForm({ ...form, id_number: e.target.value })}
              error={errors.id_number?.[0]}
              required
            />
            <FileField label="ID front" onChange={(f) => setForm({ ...form, id_front: f })} error={errors.id_front?.[0]} required />
            <FileField label="ID back (optional)" onChange={(f) => setForm({ ...form, id_back: f })} />
            <FileField label="Selfie" onChange={(f) => setForm({ ...form, selfie: f })} error={errors.selfie?.[0]} required />
            <Button type="submit" className="w-full" disabled={submit.isPending}>
              {submit.isPending ? "Submitting…" : "Submit KYC"}
            </Button>
          </form>
        </Card>
      )}
    </PageWrap>
  );
}

function FileField({ label, onChange, error, required }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        required={required}
        className="w-full text-sm"
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </label>
  );
}
