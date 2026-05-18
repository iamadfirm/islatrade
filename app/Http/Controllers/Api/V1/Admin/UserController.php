<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\WalletTxType;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function __construct(private WalletService $wallet) {}

    public function index(Request $request)
    {
        $q = User::query();
        if ($s = $request->string('q')->toString()) {
            $q->where(fn ($w) => $w->where('name', 'like', "%$s%")->orWhere('phone', 'like', "%$s%"));
        }
        return UserResource::collection($q->latest()->paginate(20));
    }

    public function show(User $user)
    {
        return new UserResource($user);
    }

    public function adjustBalance(Request $request, User $user)
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'not_in:0'],
            'note' => ['required', 'string', 'max:255'],
        ]);

        try {
            if ($data['amount'] > 0) {
                $this->wallet->credit($user, (float) $data['amount'], WalletTxType::AdminAdjustment, null, $data['note']);
            } else {
                $this->wallet->debit($user, abs((float) $data['amount']), WalletTxType::AdminAdjustment, null, $data['note']);
            }
        } catch (\RuntimeException $e) {
            throw ValidationException::withMessages(['amount' => $e->getMessage()]);
        }

        return new UserResource($user->fresh());
    }
}
