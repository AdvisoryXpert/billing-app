<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;

##3|Llo2l33cBOOlcOjDTiq7vvtzay7OI07Nc6mmQiJh40a190f9

# php artisan tinker
# Psy Shell v0.12.9 (PHP 8.2.12 — cli) by Justin Hileman
# > $user = App\Models\User::first(); // or find a specific one
# > $token = $user->createToken('TestToken')->plainTextToken;
# = "3|Llo2l33cBOOlcOjDTiq7vvtzay7OI07Nc6mmQiJh40a190f9"


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

Route::get('/ping', function () {
    return response()->json(['message' => 'API is working']);
});
require __DIR__ . '/client.php';
require __DIR__ . '/invoice.php';
require __DIR__ . '/invoice_item.php';
require __DIR__ . '/payment.php';
});
