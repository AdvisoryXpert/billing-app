<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class InvoiceController extends Controller
{
    // List all invoices for the logged-in user
    public function index()
    {
        $invoices = Invoice::with('client')->where('user_id', Auth::id())->get();
        return response()->json($invoices);
    }

    // Store a new invoice
    public function store(Request $request)
    {
        Log::info('Auth ID: ' . Auth::id());
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:invoice_date',
            'total' => 'required|numeric|min:0',
            'status' => 'nullable|in:draft,sent,paid',
        ]);


        $invoice = Invoice::create([
            'client_id' => $validated['client_id'],
            'user_id' => Auth::id(),
            'invoice_number' => 'INV-' . strtoupper(Str::random(8)),
            'invoice_date' => $validated['invoice_date'],
            'due_date' => $validated['due_date'],
            'total' => $validated['total'],
            'status' => $validated['status'] ?? 'draft',
        ]);

        return response()->json($invoice, 201);
    }

    // Show single invoice
    public function show($id)
    {
        $invoice = Invoice::with('client')->where('user_id', Auth::id())->findOrFail($id);
        return response()->json($invoice);
    }

    // Update an invoice
    public function update(Request $request, $id)
    {
        $invoice = Invoice::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'invoice_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:invoice_date',
            'total' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:draft,sent,paid',
        ]);

        $invoice->update($validated);
        return response()->json($invoice);
    }

    // Delete invoice
    public function destroy($id)
    {
        $invoice = Invoice::where('user_id', Auth::id())->findOrFail($id);
        $invoice->delete();

        return response()->json(['message' => 'Invoice deleted']);
    }
}
