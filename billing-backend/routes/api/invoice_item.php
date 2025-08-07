<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InvoiceItemController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/invoice-items/{invoiceId}', [InvoiceItemController::class, 'index']);
    Route::post('/invoice-items', [InvoiceItemController::class, 'store']);
    Route::put('/invoice-items/{id}', [InvoiceItemController::class, 'update']);
    Route::delete('/invoice-items/{id}', [InvoiceItemController::class, 'destroy']);
});