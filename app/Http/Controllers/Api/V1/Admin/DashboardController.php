<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\InvestmentStatus;
use App\Enums\Status;
use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\Investment;
use App\Models\KycSubmission;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Models\Withdrawal;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function stats()
    {
        $today = Carbon::today();
        $weekAgo = Carbon::now()->subDays(6)->startOfDay();
        $twoWeeksAgo = Carbon::now()->subDays(13)->startOfDay();
        $monthAgo = Carbon::now()->subDays(29)->startOfDay();

        // 7-day totals
        $depositVolume7 = (float) Deposit::where('status', Status::Approved)
            ->where('processed_at', '>=', $weekAgo)->sum('amount');
        $withdrawVolume7 = (float) Withdrawal::where('status', Status::Approved)
            ->where('processed_at', '>=', $weekAgo)->sum('amount');

        // 14-day daily series — deposits + withdrawals
        $depositByDay14 = Deposit::where('status', Status::Approved)
            ->where('processed_at', '>=', $twoWeeksAgo)
            ->selectRaw('DATE(processed_at) as d, SUM(amount) as v')
            ->groupBy('d')->pluck('v', 'd')->all();

        $withdrawByDay14 = Withdrawal::where('status', Status::Approved)
            ->where('processed_at', '>=', $twoWeeksAgo)
            ->selectRaw('DATE(processed_at) as d, SUM(amount) as v')
            ->groupBy('d')->pluck('v', 'd')->all();

        $volumeSeries14 = [];
        $depositSeries7 = [];
        for ($i = 13; $i >= 0; $i--) {
            $d = Carbon::now()->subDays($i)->toDateString();
            $dep = (float) ($depositByDay14[$d] ?? 0);
            $wit = (float) ($withdrawByDay14[$d] ?? 0);
            $volumeSeries14[] = [
                'date' => $d,
                'label' => Carbon::parse($d)->format('M j'),
                'deposit' => $dep,
                'withdraw' => $wit,
                'net' => $dep - $wit,
            ];
            if ($i <= 6) {
                $depositSeries7[] = $dep;
            }
        }

        // 30-day user growth — daily new + cumulative total
        $newByDay30 = User::where('created_at', '>=', $monthAgo)
            ->selectRaw('DATE(created_at) as d, COUNT(*) as v')
            ->groupBy('d')->pluck('v', 'd')->all();

        $totalBefore = User::where('created_at', '<', $monthAgo)->count();
        $userSeries30 = [];
        $running = $totalBefore;
        for ($i = 29; $i >= 0; $i--) {
            $d = Carbon::now()->subDays($i)->toDateString();
            $new = (int) ($newByDay30[$d] ?? 0);
            $running += $new;
            $userSeries30[] = [
                'date' => $d,
                'label' => Carbon::parse($d)->format('M j'),
                'new_users' => $new,
                'total' => $running,
            ];
        }

        // Investments grouped by package (top 6 by principal, active only)
        $byPackage = Investment::query()
            ->where('investments.status', InvestmentStatus::Active)
            ->join('investment_packages', 'investment_packages.id', '=', 'investments.package_id')
            ->selectRaw('investment_packages.name as name, SUM(investments.principal) as principal, COUNT(*) as count')
            ->groupBy('investment_packages.id', 'investment_packages.name')
            ->orderByDesc('principal')
            ->limit(6)
            ->get()
            ->map(fn ($r) => [
                'name' => $r->name,
                'principal' => (float) $r->principal,
                'count' => (int) $r->count,
            ])->all();

        // Wallet transaction type breakdown (30d)
        $txBreakdown30 = WalletTransaction::where('created_at', '>=', $monthAgo)
            ->selectRaw('type, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('type')
            ->get()
            ->map(function ($r) {
                $type = $r->type; // already cast to enum
                return [
                    'value' => $type->value,
                    'label' => $type->label(),
                    'is_credit' => $type->isCredit(),
                    'total' => (float) $r->total,
                    'count' => (int) $r->count,
                ];
            })->values()->all();

        return [
            'pending' => [
                'deposits' => Deposit::where('status', Status::Pending)->count(),
                'withdrawals' => Withdrawal::where('status', Status::Pending)->count(),
                'kyc' => KycSubmission::where('status', Status::Pending)->count(),
            ],
            'users' => [
                'total' => User::count(),
                'frozen' => User::whereNotNull('frozen_at')->count(),
                'new_today' => User::whereDate('created_at', $today)->count(),
                'series_30d' => $userSeries30,
            ],
            'volume' => [
                'deposit_7d' => $depositVolume7,
                'withdraw_7d' => $withdrawVolume7,
                'net_7d' => $depositVolume7 - $withdrawVolume7,
                'deposit_series_7d' => $depositSeries7,
                'series_14d' => $volumeSeries14,
            ],
            'investments' => [
                'active' => Investment::where('status', InvestmentStatus::Active)->count(),
                'principal' => (float) Investment::where('status', InvestmentStatus::Active)->sum('principal'),
                'paid_out' => (float) Investment::sum('total_paid_out'),
                'by_package' => $byPackage,
            ],
            'wallet' => [
                'tx_breakdown_30d' => $txBreakdown30,
            ],
        ];
    }

    public function recentActivity()
    {
        return WalletTransaction::with('user:id,name,phone,uuid')
            ->latest('id')->limit(15)->get()
            ->map(fn ($t) => [
                'uuid' => $t->uuid,
                'type' => [
                    'value' => $t->type->value,
                    'label' => $t->type->label(),
                    'is_credit' => $t->type->isCredit(),
                ],
                'amount' => $t->amount,
                'description' => $t->description,
                'user' => $t->user ? [
                    'name' => $t->user->name,
                    'phone' => $t->user->phone,
                    'uuid' => $t->user->uuid,
                ] : null,
                'created_at' => $t->created_at,
            ]);
    }
}
