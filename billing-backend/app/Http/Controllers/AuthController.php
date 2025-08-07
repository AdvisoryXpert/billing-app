<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    // REGISTER
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);

        return response()->json(['message' => 'User registered successfully'], 201);
    }

    // LOGIN
    public function login(Request $request)
{
    Log::info('Login attempt started', ['email' => $request->email]);

    $request->validate([
        'email' => 'required|email',
        'password' => 'required'
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user) {
        Log::warning('Login failed - user not found', ['email' => $request->email]);
        return response()->json(['message' => 'Invalid credentials (user)'], 401);
    }

    // ✅ Clean up old tokens (optional but safer)
    $user->tokens()->delete();

    $token = $user->createToken('auth_token')->plainTextToken;

    Log::info('Login successful', ['user_id' => $user->id]);

    return response()->json([
        'access_token' => $token,
        'token_type' => 'Bearer',
        'user' => $user
        ]);

    if (!Hash::check($request->password, $user->password)) {
        Log::warning('Login failed - wrong password', ['email' => $request->email]);
        return response()->json(['message' => 'Invalid credentials (password)'], 401);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    Log::info('Login successful', ['user_id' => $user->id]);

    return response()->json([
        'access_token' => $token,
        'token_type' => 'Bearer',
        'user' => $user
    ]);
}

    // LOGOUT
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
