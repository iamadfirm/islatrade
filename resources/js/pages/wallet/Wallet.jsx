import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownToLine, ArrowUpFromLine, Send } from "lucide-react";
import api, { peso } from "../../lib/api";
import { Card, PageWrap, Loader, Empty } from "../../components/ui";
import { useAuth } from "../../stores/authStore";

export default function Wallet() {
  const user = useAuth((s) => s.user);
  const { data, isLoading } = useQuery({
    queryKey: ["wallet-tx"],
    queryFn: async () => (await api.get("/wallet/transactions")).data,
  });

  return (
    <PageWrap title="Wallet">
      <Card className="gradient-brand p-5 text-white mb-5">
        <p className="text-xs uppercase tracking-widest opacity-80">Available</p>
        <p className="mt-1 text-3xl font-black">{peso(user?.wallet_balance)}</p>
      </Card>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <ActionTile to="/deposit" icon={<ArrowDownToLine />} label="Deposit" />
        <ActionTile to="/withdraw" icon={<ArrowUpFromLine />} label="Withdraw" />
        <ActionTile to="/transfer" icon={<Send />} label="Transfer" />
      </div>

      <h2 className="mb-2 px-1 text-sm font-semibold text-slate-700">Transactions</h2>
      {isLoading ? (
        <Loader />
      ) : !data?.data?.length ? (
        <Empty>No transactions yet.</Empty>
      ) : (
        <ul className="space-y-2">
          {data.data.map((t) => (
            <li key={t.uuid}>
              <Card className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold">{t.type.label}</p>
                  <p className="text-xs text-slate-500">{new Date(t.created_at).toLocaleString()}</p>
                </div>
                <div className={`text-right font-bold ${t.type.is_credit ? "text-emerald-600" : "text-rose-600"}`}>
                  {t.type.is_credit ? "+" : "−"}
                  {peso(t.amount)}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </PageWrap>
  );
}

function ActionTile({ to, icon, label }) {
  return (
    <Link to={to}>
      <Card className="flex flex-col items-center gap-1 p-3 text-brand-600">
        {icon}
        <span className="text-xs font-medium text-slate-700">{label}</span>
      </Card>
    </Link>
  );
}
