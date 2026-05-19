<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Referral;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:32', 'unique:users,phone'],
            'email' => ['nullable', 'email', 'max:120', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'referral_code' => ['nullable', 'string', 'max:16'],
        ]);

        $referrer = null;
        if (! empty($data['referral_code'])) {
            $referrer = User::where('referral_code', strtoupper(trim($data['referral_code'])))->first();
            if (! $referrer) {
                throw ValidationException::withMessages([
                    'referral_code' => 'Invalid referral code.',
                ]);
            }
        }

        $user = DB::transaction(function () use ($data, $referrer) {
            $u = User::create([
                'name' => $data['name'],
                'phone' => $data['phone'],
                'email' => $data['email'] ?? null,
                'password' => Hash::make($data['password']),
                'referred_by_user_id' => $referrer?->id,
            ]);
            $u->assignRole('user');

            if ($referrer) {
                Referral::create([
                    'referrer_id' => $referrer->id,
                    'referee_id' => $u->id,
                    'bonus_amount' => 0,
                ]);
            }
            return $u;
        });

        Auth::login($user);
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return new UserResource($user);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'phone' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt(['phone' => $data['phone'], 'password' => $data['password']])) {
            throw ValidationException::withMessages(['phone' => 'Invalid credentials.']);
        }

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }
        return new UserResource($request->user());
    }

    public function me(Request $request)
    {
        return new UserResource($request->user());
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }
        return response()->json(['message' => 'Logged out.']);
    }
}
