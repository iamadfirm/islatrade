import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, RefreshCw, Activity } from "lucide-react";
import api from "../../lib/api";
import { Card, Pill, Skeleton, SectionTitle } from "../ui";
import { AreaChart } from "../ui/charts";

const COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", color: "#F7931A" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", color: "#627EEA" },
  { id: "binancecoin", symbol: "BNB", name: "BNB", color: "#F0B90B" },
  { id: "solana", symbol: "SOL", name: "Solana", color: "#14F195" },
  { id: "tether", symbol: "USDT", name: "Tether", color: "#26A17B" },
];

const RANGES = [
  { days: 1, label: "1D" },
  { days: 7, label: "7D" },
  { days: 30, label: "30D" },
  { days: 90, label: "90D" },
];

function usd(v, opts = {}) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n >= 1 ? 2 : 4,
    ...opts,
  }).format(n);
}

export default function CryptoMarket() {
  const [active, setActive] = useState("bitcoin");
  const [days, setDays] = useState(7);
  const coin = COINS.find((c) => c.id === active) || COINS[0];

  // Combined price + 24h change for the tab strip (server proxy → CoinGecko)
  const summary = useQuery({
    queryKey: ["crypto-prices", COINS.map((c) => c.id).join(",")],
    queryFn: async () =>
      (
        await api.get("/crypto/prices", {
          params: { ids: COINS.map((c) => c.id).join(",") },
        })
      ).data,
    refetchInterval: 60 * 1000,
    staleTime: 50 * 1000,
    retry: 1,
  });

  const chart = useQuery({
    queryKey: ["crypto-chart", active, days],
    queryFn: async () =>
      (await api.get(`/crypto/chart/${active}`, { params: { days } })).data,
    refetchInterval: 120 * 1000,
    staleTime: 90 * 1000,
    retry: 1,
  });

  const series = (chart.data?.prices || []).map(([t, p]) => ({
    label: new Date(t).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      ...(days <= 1 ? { hour: "2-digit", minute: "2-digit" } : {}),
    }),
    value: p,
  }));

  const price = summary.data?.[active]?.usd;
  const change = summary.data?.[active]?.usd_24h_change;
  const mcap = summary.data?.[active]?.usd_market_cap;
  const positive = (change ?? 0) >= 0;

  const failed = summary.isError && chart.isError;

  return (
    <section className="fade-up">
      <SectionTitle
        eyebrow="Markets"
        title="Live crypto"
        action={
          <button
            onClick={() => {
              summary.refetch();
              chart.refetch();
            }}
            className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
          >
            <RefreshCw size={11} className={summary.isFetching || chart.isFetching ? "animate-spin" : ""} />
            Refresh
          </button>
        }
      />

      {/* Tab strip with mini price + change */}
      <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto no-scrollbar px-1 pb-1">
        {COINS.map((c) => {
          const p = summary.data?.[c.id]?.usd;
          const ch = summary.data?.[c.id]?.usd_24h_change;
          const isActive = c.id === active;
          return (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`min-w-[120px] shrink-0 rounded-2xl border p-3 text-left transition ${
                isActive
                  ? "border-gold-300 bg-gold-50/60 ring-2 ring-gold-200"
                  : "border-slate-200 bg-white hover:border-brand-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-brand-800">
                  <span
                    className="grid h-5 w-5 place-items-center rounded-full text-[9px] font-black text-white"
                    style={{ background: c.color }}
                  >
                    {c.symbol[0]}
                  </span>
                  {c.symbol}
                </span>
                {Number.isFinite(ch) && (
                  <span
                    className={`text-[10px] font-bold ${
                      ch >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {ch >= 0 ? "▲" : "▼"} {Math.abs(ch).toFixed(2)}%
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-black text-brand-800">
                {summary.isLoading ? <span className="inline-block h-3 w-16 skeleton rounded" /> : usd(p)}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected coin chart */}
      <Card className="p-4 lg:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="grid h-9 w-9 place-items-center rounded-2xl text-xs font-black text-white"
                style={{ background: coin.color }}
              >
                {coin.symbol}
              </span>
              <div>
                <p className="text-sm font-bold text-brand-800">{coin.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">
                  {coin.symbol} / USD
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-black text-brand-800 lg:text-3xl">
                {summary.isLoading ? (
                  <span className="inline-block h-6 w-28 skeleton rounded" />
                ) : (
                  usd(price)
                )}
              </p>
              {Number.isFinite(change) && (
                <Pill tone={positive ? "emerald" : "rose"} dot>
                  {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(change).toFixed(2)}%
                </Pill>
              )}
            </div>
            {Number.isFinite(mcap) && (
              <p className="mt-1 text-[11px] text-slate-500">
                Market cap{" "}
                <b className="text-brand-700">
                  {new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    style: "currency",
                    currency: "USD",
                  }).format(mcap)}
                </b>
              </p>
            )}
          </div>
          <div className="flex gap-1 rounded-full bg-brand-50 p-1 ring-1 ring-brand-100">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                  days === r.days
                    ? "bg-white text-brand-800 shadow-sm"
                    : "text-brand-600/80 hover:text-brand-800"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          {failed ? (
            <div className="flex h-[200px] items-center justify-center rounded-2xl bg-slate-50 text-xs text-slate-500">
              <Activity size={14} className="mr-1.5" />
              Market data temporarily unavailable.
            </div>
          ) : chart.isLoading || !series.length ? (
            <Skeleton className="h-[200px]" />
          ) : (
            <div className="h-[200px]">
              <AreaChart
                data={series}
                color={coin.color}
                height={200}
                formatter={(v) => usd(v)}
              />
            </div>
          )}
        </div>

        <p className="mt-2 text-[10px] text-slate-400">
          Data: CoinGecko · Auto-refresh every 60s. Indicative only — not financial advice.
        </p>
      </Card>
    </section>
  );
}
