<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    foreach (['clients','invoices','payments'] as $table) {
      if (!Schema::hasColumn($table, 'tenant_id')) {
        Schema::table($table, function (Blueprint $t) {
          $t->unsignedBigInteger('tenant_id')->nullable()->after('id');
          $t->index('tenant_id');
        });
      }
    }
  }
  public function down(): void {
    foreach (['clients','invoices','payments'] as $table) {
      if (Schema::hasColumn($table, 'tenant_id')) {
        Schema::table($table, fn(Blueprint $t) => $t->dropConstrainedForeignId('tenant_id'));
      }
    }
  }
};