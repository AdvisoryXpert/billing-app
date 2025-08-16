<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;

// --- Public ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// --- Protected (auth only). If you globally appended 'tenant' in bootstrap/app.php, it still runs. ---
Route::middleware(['auth:sanctum'])->group(function () {

    // quick health
    Route::get('/ping', fn () => response()->json(['message' => 'API is working']));

    // /api/me  — returns user + current tenant (if resolved) + allowed tenants
Route::get('/me', function (Request $r) {
    $u = $r->user();

    // Defensive: only resolve Tenancy if bound
    $tenancy = app()->bound(\App\Support\Tenancy::class)
        ? app(\App\Support\Tenancy::class)
        : null;
    $t = $tenancy?->tenant();

    // Log small, useful bits (avoid dumping whole models)
    Log::info('ME endpoint', [
        'user_id'      => $u?->id,
        'user_email'   => $u?->email,
        'tenant_id'    => $t?->id,
        'tenant_slug'  => $t?->slug,
    ]);

    return response()->json([
        'user'    => $u ? ['id' => $u->id, 'name' => $u->name, 'email' => $u->email] : null,
        'tenant'  => $t ? ['id' => $t->id, 'name' => $t->name, 'slug' => $t->slug] : null,

        // Fully-qualify columns to avoid "ambiguous column" errors
        'tenants' => $u
            ? $u->tenants()
                ->select([
                    'tenants.id as id',
                    'tenants.name as name',
                    'tenants.slug as slug',
                ])
                ->get()
            : [],
    ]);
});

    // your other protected routes
    require __DIR__ . '/client.php';
    require __DIR__ . '/invoice.php';
    require __DIR__ . '/invoice_item.php';
    require __DIR__ . '/payment.php';

    Route::post('/logout', [AuthController::class, 'logout']);
});
