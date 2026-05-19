<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\KycStatus;
use App\Enums\WalletTxType;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Resources\WalletTransactionResource;
use App\Models\User;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function __construct(private WalletService $wallet) {}

    public function index(Request $request)
    {
        $q = User::query()->withTrashed();

        if ($s = $request->string('q')->toString()) {
            $q->where(fn ($w) => $w->where('name', 'like', "%$s%")->orWhere('phone', 'like', "%$s%"));
        }

        if ($request->boolean('frozen_only')) {
            $q->whereNotNull('frozen_at');
        }
        if ($request->boolean('trashed_only')) {
            $q->whereNotNull('deleted_at');
        }

        return UserResource::collection($q->latest()->paginate(20));
    }

    public function show(User $user)
    {
        return new UserResource($user);
    }

    public function adjustBalance(Request $request, User $user)
    {
        $this->guardSelf($request, $user);

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

    public function walletTransactions(Request $request, User $user)
    {
        return WalletTransactionResource::collection(
            $user->walletTransactions()->paginate(25)
        );
    }

    public function freeze(Request $request, User $user)
    {
        $this->guardSelf($request, $user);
        $this->guardAdmin($user);

        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $user->forceFill([
            'frozen_at' => now(),
            'frozen_reason' => $data['reason'] ?? null,
        ])->save();

        // Optional: revoke any sanctum tokens
        $user->tokens()->delete();

        return new UserResource($user->fresh());
    }

    public function unfreeze(Request $request, User $user)
    {
        $user->forceFill(['frozen_at' => null, 'frozen_reason' => null])->save();
        return new UserResource($user->fresh());
    }

    public function resetPassword(Request $request, User $user)
    {
        $this->guardSelf($request, $user);

        $data = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user->forceFill(['password' => Hash::make($data['password'])])->save();
        $user->tokens()->delete();

        return response()->json(['message' => 'Password updated.']);
    }

    public function resetKyc(Request $request, User $user)
    {
        $this->guardSelf($request, $user);

        $user->forceFill([
            'kyc_status' => KycStatus::None->value,
            'kyc_submitted_at' => null,
        ])->save();

        return new UserResource($user->fresh());
    }

    public function toggleAdmin(Request $request, User $user)
    {
        $this->guardSelf($request, $user);

        if ($user->hasRole('admin')) {
            $user->removeRole('admin');
            $user->assignRole('user');
        } else {
            $user->assignRole('admin');
        }

        return new UserResource($user->fresh());
    }

    public function assignRoles(Request $request, User $user)
    {
        $this->guardSelf($request, $user);

        $data = $request->validate([
            'roles' => ['required', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        // Always keep at least the base 'user' role so feature gates still apply.
        $roles = collect($data['roles'])->unique()->values()->all();
        if (! in_array('user', $roles, true)) {
            $roles[] = 'user';
        }

        $user->syncRoles($roles);

        return new UserResource($user->fresh());
    }

    public function destroy(Request $request, User $user)
    {
        $this->guardSelf($request, $user);
        $this->guardAdmin($user);

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'User soft-deleted.']);
    }

    public function restore(Request $request, string $uuid)
    {
        $user = User::withTrashed()->where('uuid', $uuid)->firstOrFail();
        $user->restore();
        return new UserResource($user->fresh());
    }

    private function guardSelf(Request $request, User $user): void
    {
        if ($request->user()?->id === $user->id) {
            throw ValidationException::withMessages([
                'user' => 'You cannot perform this action on your own account.',
            ]);
        }
    }

    private function guardAdmin(User $user): void
    {
        if ($user->hasRole('admin')) {
            throw ValidationException::withMessages([
                'user' => 'Cannot perform this action on another admin. Demote them first.',
            ]);
        }
    }
}
