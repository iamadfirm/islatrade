import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "./stores/authStore";
import AppLayout from "./layouts/AppLayout";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home";
import Wallet from "./pages/wallet/Wallet";
import Deposit from "./pages/deposit/Deposit";
import Withdraw from "./pages/withdraw/Withdraw";
import Transfer from "./pages/transfer/Transfer";
import Kyc from "./pages/kyc/Kyc";
import Partnership from "./pages/partnership/Partnership";
import EnrollForm from "./pages/partnership/EnrollForm";
import Profile from "./pages/Profile";
import AdminDeposits from "./pages/admin/AdminDeposits";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import AdminKyc from "./pages/admin/AdminKyc";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminDepositMethods from "./pages/admin/AdminDepositMethods";

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false } },
});

function Protected({ children, admin }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="flex h-screen items-center justify-center text-slate-400">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />;
  if (admin && !(user.is_admin || user.is_staff)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const hydrate = useAuth((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<Protected><AppLayout /></Protected>}>
            <Route index element={<Home />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="deposit" element={<Deposit />} />
            <Route path="withdraw" element={<Withdraw />} />
            <Route path="transfer" element={<Transfer />} />
            <Route path="kyc" element={<Kyc />} />
            <Route path="partnership" element={<Partnership />} />
            <Route path="partnership/enroll/:uuid" element={<EnrollForm />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="/admin" element={<Protected admin><AdminLayout /></Protected>}>
            <Route index element={<AdminDashboard />} />
            <Route path="deposits" element={<AdminDeposits />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="kyc" element={<AdminKyc />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="roles" element={<AdminRoles />} />
            <Route path="deposit-methods" element={<AdminDepositMethods />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
