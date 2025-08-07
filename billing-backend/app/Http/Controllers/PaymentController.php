<?php

namespace App\Http\Controllers;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    // List all payments created by the authenticated user
    public function index()
    {
        $payments = Payment::with('invoice')
            ->where('user_id', Auth::id())
            ->get();

        return response()->json($payments);
    }

    // Store a new payment
    public function store(Request $request)
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string|max:255',
            'note' => 'nullable|string',
        ]);

        Log::info('Storing new payment', [
            'user_id' => Auth::id(),
            'payload' => $validated
        ]);

        $payment = Payment::create([
            'invoice_id' => $validated['invoice_id'],
            'amount' => $validated['amount'],
            'payment_date' => $validated['payment_date'],
            'payment_method' => $validated['payment_method'],
            'note' => $validated['note'] ?? null,
            'user_id' => Auth::id(),
        ]);

        return response()->json($payment, 201);
    }

    // Show a single payment
    public function show($id)
    {
        $payment = Payment::with('invoice')
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        return response()->json($payment);
    }

    // Update an existing payment
    public function update(Request $request, $id)
    {
        $payment = Payment::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'amount' => 'nullable|numeric|min:0',
            'payment_date' => 'nullable|date',
            'payment_method' => 'nullable|string|max:255',
            'note' => 'nullable|string',
        ]);

        $payment->update($validated);

        return response()->json($payment);
    }

    // Delete a payment
    public function destroy($id)
    {
        $payment = Payment::where('user_id', Auth::id())->findOrFail($id);
        $payment->delete();

        return response()->json(['message' => 'Payment deleted successfully']);
    }
}
