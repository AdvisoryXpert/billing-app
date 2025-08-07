<?php
namespace App\Http\Controllers;

use App\Models\InvoiceItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class InvoiceItemController extends Controller
{
    public function index($invoiceId)
    {
        return InvoiceItem::where('invoice_id', $invoiceId)->get();
    }

 public function store(Request $request)
{
    try {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'description' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
            'tax_percentage' => 'nullable|numeric|min:0|max:100',
        ]);

        // Calculations
        $total = $validated['quantity'] * $validated['unit_price'];
        $tax_amount = ($validated['tax_percentage'] ?? 0) / 100 * $total;
        $total_with_tax = $total + $tax_amount;

        Log::info('Pre-create values:', [
            'total' => $total,
            'tax_amount' => $tax_amount,
            'total_with_tax' => $total_with_tax
        ]);

        $item = InvoiceItem::create([
            'invoice_id' => $validated['invoice_id'],
            'description' => $validated['description'],
            'quantity' => $validated['quantity'],
            'unit_price' => $validated['unit_price'],
            'total' => $total,
            'tax_percentage' => $validated['tax_percentage'] ?? 0,
            'tax_amount' => $tax_amount,
            'total_with_tax' => $total_with_tax,
        ]);

        Log::info('Post-create values:', $item->toArray());
        
        return response()->json($item, 201);
    } catch (\Exception $e) {
        Log::error('InvoiceItem creation failed: '.$e->getMessage());
        throw $e; // Re-throw to see the error in your API response
    }
}
   public function update(Request $request, $id)
{
    $item = InvoiceItem::findOrFail($id);

    $validated = $request->validate([
        'description' => 'sometimes|required|string|max:255',
        'quantity' => 'sometimes|required|integer|min:1',
        'unit_price' => 'sometimes|required|numeric|min:0',
        'tax_percentage' => 'sometimes|nullable|numeric|min:0|max:100',
    ]);

    // Recalculate whenever quantity, unit_price, or tax_percentage changes
    if (isset($validated['quantity']) || isset($validated['unit_price']) || isset($validated['tax_percentage'])) {
        $quantity = $validated['quantity'] ?? $item->quantity;
        $unit_price = $validated['unit_price'] ?? $item->unit_price;
        $tax_percentage = $validated['tax_percentage'] ?? $item->tax_percentage;
        
        $validated['total'] = $quantity * $unit_price;
        $validated['tax_amount'] = ($tax_percentage / 100) * $validated['total'];
        $validated['total_with_tax'] = $validated['total'] + $validated['tax_amount'];
    }

    $item->update($validated);

    return response()->json($item);
}

    public function destroy($id)
    {
        InvoiceItem::destroy($id);
        return response()->json(['message' => 'Invoice item deleted']);
    }
}
