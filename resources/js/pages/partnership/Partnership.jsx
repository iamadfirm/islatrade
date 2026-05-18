import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api, { peso } from "../../lib/api";
import { Card, PageWrap, Loader, Empty, StatusBadge } from "../../components/ui";

export default function Partnership() {
  const dash = useQuery({
    queryKey: ["partnership-dash"],
    queryFn: async () => (await api.get("/partnerships/dashboard")).data,
  });
  const investments = useQuery({
    queryKey: ["investments"],
    queryFn: async () => (await api.get("/partnerships/investments")).data,
  });
  const packages = useQuery({
    queryKey: ["packages"],
    queryFn: async () => (await api.get("/partnerships/packages")).data,
  });

  return (
    <PageWrap title="Partnership">
      <div className="grid grid-cols-3 gap-2 mb-5">
        <StatTile label="Active" value={dash.data?.active_count ?? "—"} />
        <StatTile label="Principal" value={peso(dash.data?.total_principal)} />
        <StatTile label="Earned" value={peso(dash.data?.total_paid_out)} />
      </div>

      <h2 className="mb-2 px-1 text-sm font-semibold text-slate-700">Packages</h2>
      {packages.isLoading ? (
        <Loader />
      ) : (
        <ul className="space-y-2 mb-5">
          {packages.data?.data?.map((p) => (
            <li key={p.uuid}>
              <Link to={`/partnership/enroll/${p.uuid}`}>
                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-bold">{p.name}</p>
                      <p className="text-xs text-slate-500">
                        {p.interest_rate}% {p.frequency.label.toLowerCase()} · {p.term_days} days
                      </p>
                    </div>
                    <p className="text-xs text-slate-600">
                      {peso(p.min_amount)} {p.max_amount ? `– ${peso(p.max_amount)}` : "+"}
                    </p>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-2 px-1 text-sm font-semibold text-slate-700">My investments</h2>
      {investments.isLoading ? (
        <Loader />
      ) : !investments.data?.data?.length ? (
        <Empty>No investments yet.</Empty>
      ) : (
        <ul className="space-y-2">
          {investments.data.data.map((i) => (
            <li key={i.uuid}>
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base font-bold">{peso(i.principal)}</p>
                    <p className="text-xs text-slate-500">
                      {i.package?.name} · {i.interest_rate}% {i.frequency}
                    </p>
                    <p className="text-xs text-slate-500">
                      Matures {new Date(i.matures_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={i.status} />
                    <p className="mt-1 text-xs text-emerald-600 font-semibold">
                      +{peso(i.total_paid_out)}
                    </p>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </PageWrap>
  );
}

function StatTile({ label, value }) {
  return (
    <Card className="p-3 text-center">
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </Card>
  );
}
