<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\DepositResource;
use App\Models\Deposit;
use App\Models\DepositMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class DepositController extends Controller
{
    public function index(Request $request)
    {
        return DepositResource::collection(
            $request->user()->deposits()->paginate(20)
        );
    }

    public function methods()
    {
        return DepositMethod::where('enabled', true)
            ->orderBy('sort')
            ->get()
            ->map(fn ($m) => [
                'key' => $m->key,
                'label' => $m->label,
                'instructions' => $m->instructions,
                'account_name' => $m->account_name,
                'account_number' => $m->account_number,
                'image_url' => $m->image_url,
            ]);
    }

    public function store(Request $request)
    {
        $allowed = DepositMethod::where('enabled', true)->pluck('key')->toArray();
        if (empty($allowed)) $allowed = ['bank', 'gcash', 'maya', 'other'];

        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:50'],
            'method' => ['required', 'string', 'in:' . implode(',', $allowed)],
            'reference_number' => ['nullable', 'string', 'max:64'],
            'proof' => ['required', 'image', 'max:5120'],
        ]);

        $path = $request->file('proof')->store('deposits', 'public');

        $deposit = $request->user()->deposits()->create([
            'amount' => $data['amount'],
            'method' => $data['method'],
            'reference_number' => $data['reference_number'] ?? null,
            'proof_path' => $path,
            'status' => 'pending',
        ]);

        return new DepositResource($deposit);
    }

    public function show(Request $request, Deposit $deposit)
    {
        abort_unless($deposit->user_id === $request->user()->id, 404);
        return new DepositResource($deposit);
    }
}
