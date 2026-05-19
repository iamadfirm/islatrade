<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvestmentResource;
use App\Models\Investment;
use Illuminate\Http\Request;

class InvestmentController extends Controller
{
    public function index(Request $request)
    {
        $q = Investment::with(['user', 'package'])->latest('id');

        if ($status = $request->string('status')->toString()) {
            $q->where('status', $status);
        }

        if ($search = trim((string) $request->string('search'))) {
            $q->whereHas('user', function ($u) use ($search) {
                $u->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return InvestmentResource::collection($q->paginate(20));
    }

    public function show(Investment $investment)
    {
        return new InvestmentResource(
            $investment->load(['user', 'package', 'transactions'])
        );
    }
}
