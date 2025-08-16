<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class InvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'description',
        'quantity',
        'unit_price',
        'total',
        'tax_percentage',
        'tax_amount',
        'total_with_tax'
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}