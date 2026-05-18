import { Link, useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck, Settings } from "lucide-react";
import { Card, PageWrap, Button, StatusBadge } from "../components/ui";
import { useAuth } from "../stores/authStore";
import { peso } from "../lib/api";

export default function Profile() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <PageWrap title="Profile">
      <Card className="p-4 mb-4">
        <p className="text-base font-bold">{user?.name}</p>
        <p className="text-xs text-slate-500">{user?.phone}</p>
        <p className="mt-2 text-xs text-slate-500">Wallet: {peso(user?.wallet_balance)}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-slate-500">KYC:</span>
          <StatusBadge status={user?.kyc_status} />
        </div>
      </Card>

      <Link to="/kyc">
        <Card className="flex items-center gap-3 p-4 mb-2">
          <ShieldCheck className="text-brand-600" />
          <span className="text-sm font-medium">KYC verification</span>
        </Card>
      </Link>

      {user?.is_admin && (
        <Link to="/admin/deposits">
          <Card className="flex items-center gap-3 p-4 mb-2">
            <Settings className="text-brand-600" />
            <span className="text-sm font-medium">Admin panel</span>
          </Card>
        </Link>
      )}

      <Button variant="ghost" className="mt-4 w-full" onClick={() => logout().then(() => nav("/login", { replace: true }))}>
        <LogOut size={16} /> Log out
      </Button>
    </PageWrap>
  );
}
