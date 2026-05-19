import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Gift,
  Copy,
  Share2,
  Users,
  CheckCircle2,
  ChevronLeft,
  Sparkles,
  Clock,
} from "lucide-react";
import api, { peso } from "../lib/api";
import {
  Card,
  PageWrap,
  Loader,
  Empty,
  Pill,
  SectionTitle,
  Stat,
  Avatar,
} from "../components/ui";
import { useAuth } from "../stores/authStore";

export default function Referrals() {
  const user = useAuth((s) => s.user);
  const [copied, setCopied] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["referral-stats"],
    queryFn: async () => (await api.get("/referrals/stats")).data,
  });

  const d = data?.data;
  const code = d?.referral_code || user?.referral_code || "";
  const link = code ? `${window.location.origin}/register?ref=${code}` : "";

  async function copy(value, key) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  }

  async function share() {
    if (!link) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Isla Trade Wallet",
          text: `Sign up with my referral code ${code}`,
          url: link,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      copy(link, "link");
    }
  }

  if (isLoading) return <Loader />;

  return (
    <PageWrap>
      <Link
        to="/profile"
        className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800"
      >
        <ChevronLeft size={14} /> Back to profile
      </Link>

      <Card className="gradient-hero-rich relative overflow-hidden border-0 p-5 text-white pop-shadow">
        <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="relative flex items-start gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-gold text-brand-900">
            <Gift size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-widest text-white/60">
              Refer & earn
            </p>
            <h1 className="text-lg font-black">Invite friends, earn rewards</h1>
            <p className="mt-1 text-xs text-white/70">
              {d?.enabled !== false ? (
                <>
                  You get <b className="text-gold-300">{peso(d?.bonus_amount)}</b> credited to your wallet
                  when a friend signs up with your code and their first deposit is approved.
                </>
              ) : (
                <>The referral program is currently paused. Existing pending referrals will be paid when re-enabled.</>
              )}
            </p>
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-2">
          <Stat
            tone="ghost"
            className="!bg-white/10 !border-white/15 !text-white"
            label="Earned"
            value={peso(d?.total_earned)}
          />
          <Stat
            tone="ghost"
            className="!bg-white/10 !border-white/15 !text-white"
            label="Paid"
            value={d?.paid_count ?? 0}
          />
          <Stat
            tone="ghost"
            className="!bg-white/10 !border-white/15 !text-white"
            label="Pending"
            value={d?.pending_count ?? 0}
          />
        </div>
      </Card>

      <Card className="mt-5 p-4 lg:p-5">
        <SectionTitle eyebrow="Your code" title="Share to earn" />
        <div className="mt-2 rounded-2xl bg-gradient-to-br from-gold-50 to-white p-4 ring-1 ring-gold-200">
          <p className="text-[10px] uppercase tracking-widest text-gold-700">
            Referral code
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-2xl font-black tracking-widest text-brand-800">{code || "—"}</p>
            <button
              onClick={() => copy(code, "code")}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
            >
              {copied === "code" ? <CheckCircle2 size={12} /> : <Copy size={12} />}
              {copied === "code" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">
            Shareable link
          </p>
          <div className="mt-1 flex items-center gap-2 rounded-2xl border border-brand-100 bg-white px-3 py-2">
            <p className="flex-1 truncate text-xs text-brand-800">{link || "—"}</p>
            <button
              onClick={() => copy(link, "link")}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
              disabled={!link}
            >
              {copied === "link" ? <CheckCircle2 size={11} /> : <Copy size={11} />}
              {copied === "link" ? "Copied" : "Copy"}
            </button>
            <button
              onClick={share}
              className="inline-flex items-center gap-1 rounded-full gradient-gold px-2.5 py-1 text-[11px] font-bold text-brand-900 hover:opacity-95"
              disabled={!link}
            >
              <Share2 size={11} /> Share
            </button>
          </div>
        </div>
      </Card>

      <section className="mt-5">
        <SectionTitle eyebrow="Your referrals" title={`People you invited (${d?.referrals?.length ?? 0})`} />
        {!d?.referrals?.length ? (
          <Empty>You haven't referred anyone yet — share your code to start earning.</Empty>
        ) : (
          <ul className="space-y-2">
            {d.referrals.map((r) => (
              <li key={r.id}>
                <Card className="flex items-center gap-3 p-3">
                  <Avatar name={r.referee?.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-brand-800 truncate">
                      {r.referee?.name || "—"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Joined{" "}
                      {r.referee?.created_at
                        ? new Date(r.referee.created_at).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    {r.status === "paid" ? (
                      <>
                        <p className="text-sm font-bold text-emerald-600">
                          +{peso(r.bonus_amount)}
                        </p>
                        <Pill tone="emerald" dot>
                          Paid
                        </Pill>
                      </>
                    ) : (
                      <Pill tone="amber">
                        <Clock size={10} /> Pending deposit
                      </Pill>
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-5 flex items-start gap-2 rounded-2xl bg-brand-50 p-3 text-[11px] text-brand-800 ring-1 ring-brand-100">
        <Sparkles size={14} className="mt-0.5 shrink-0 text-brand-600" />
        <p>
          Your bonus is credited automatically when your friend's first deposit is
          approved by an admin. There's no limit to how many people you can refer.
        </p>
      </div>
    </PageWrap>
  );
}
