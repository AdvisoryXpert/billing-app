<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up()
{
    Schema::table('invoice_items', function (Blueprint $table) {
        $table->decimal('tax_percentage', 5, 2)->default(0);
        $table->decimal('tax_amount', 10, 2)->default(0);
        $table->decimal('total_with_tax', 10, 2)->default(0);
    });
}

public function down()
{
    Schema::table('invoice_items', function (Blueprint $table) {
        $table->dropColumn(['tax_percentage', 'tax_amount', 'total_with_tax']);
    });
}
};
