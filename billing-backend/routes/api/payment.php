<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments', [PaymentController::class, 'store']);
});