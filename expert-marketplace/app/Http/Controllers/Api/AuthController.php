<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password as PasswordBroker;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', 'in:client,expert'],
            'phone' => ['nullable', 'string', 'max:30'],
            'country' => ['nullable', 'string', 'max:100'],
            'language' => ['nullable', 'string', 'max:10'],
            'referral_code' => ['nullable', 'string', 'max:12'],
        ]);

        $referredBy = null;
        if (!empty($data['referral_code'])) {
            $referrer = User::where('referral_code', strtoupper($data['referral_code']))->first();
            $referredBy = $referrer?->id;
        }

        $user = User::create([
            ...$data,
            'password' => Hash::make($data['password']),
            'referral_code' => strtoupper(substr(md5(uniqid()), 0, 8)),
            'referred_by' => $referredBy,
        ]);

        return response()->json([
            'user' => $user,
            'token' => $user->createToken('api')->plainTextToken,
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials)) {
            return response()->json(['message' => 'Identifiants invalides.'], 401);
        }

        $user = User::where('email', $credentials['email'])->firstOrFail();

        if ($user->banned_at !== null) {
            Auth::logout();
            return response()->json(['message' => 'Votre compte a été suspendu. Contactez le support.'], 403);
        }

        return response()->json([
            'user' => $user,
            'token' => $user->createToken('api')->plainTextToken,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('expertProfile'));
    }

    public function referrals(Request $request)
    {
        $user = $request->user();
        $referred = User::where('referred_by', $user->id)
            ->select('id', 'name', 'created_at')
            ->get();

        return response()->json([
            'referral_code' => $user->referral_code,
            'referral_url' => config('app.frontend_url', 'http://localhost:3010') . '/register?ref=' . $user->referral_code,
            'referred_users' => $referred,
            'total_referrals' => $referred->count(),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name'       => ['sometimes', 'string', 'max:255'],
            'avatar_url' => ['sometimes', 'nullable', 'string', 'url', 'max:2048'],
            'phone'      => ['sometimes', 'nullable', 'string', 'max:30'],
        ]);

        $user->update($data);

        return response()->json($user);
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if (! Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'current_password_incorrect'], 422);
        }

        $user->forceFill(['password' => Hash::make($data['password'])])->save();

        return response()->json(['message' => 'password_changed']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        $status = PasswordBroker::sendResetLink($request->only('email'));

        if ($status !== PasswordBroker::RESET_LINK_SENT) {
            return response()->json(['message' => __($status)], 422);
        }

        return response()->json(['message' => __($status)]);
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $status = PasswordBroker::reset($data, function (User $user, string $password) {
            $user->forceFill(['password' => Hash::make($password)])->save();
        });

        if ($status !== PasswordBroker::PASSWORD_RESET) {
            return response()->json(['message' => __($status)], 422);
        }

        return response()->json(['message' => __($status)]);
    }
}
