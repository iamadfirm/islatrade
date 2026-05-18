<?php

namespace App\Http\Controllers\Api\V1\Partnership;

use App\Enums\InvestmentStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\InvestmentResource;
use App\Models\Investment;
use App\Models\InvestmentPackage;
use App\Services\InvestmentService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class InvestmentController extends Controller
{
    public function __construct(private InvestmentService $service) {}

    public function index(Request $request)
    {
        return InvestmentResource::collection(
            $request->user()->investments()->with('package')->paginate(20)
        );
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();
        $active = $user->investments()->where('status', InvestmentStatus::Active);
        return response()->json([
            'active_count' => (clone $active)->count(),
            'total_principal' => (clone $active)->sum('principal'),
            'total_paid_out' => $user->investments()->sum('total_paid_out'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'package_uuid' => ['required', 'string', 'exists:investment_packages,uuid'],
            'amount' => ['required', 'numeric', 'min:1'],
        ]);

        $package = InvestmentPackage::where('uuid', $data['package_uuid'])->firstOrFail();

        try {
            $investment = $this->service->enroll($request->user(), $package, (float) $data['amount']);
        } catch (\RuntimeException $e) {
            throw ValidationException::withMessages(['amount' => $e->getMessage()]);
        }

        return new InvestmentResource($investment->load('package'));
    }

    public function show(Request $request, Investment $investment)
    {
        abort_unless($investment->user_id === $request->user()->id, 404);
        return new InvestmentResource($investment->load('package'));
    }
}
