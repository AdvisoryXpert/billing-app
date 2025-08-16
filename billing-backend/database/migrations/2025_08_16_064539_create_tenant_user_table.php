<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('tenant_user', function (Blueprint $t) {
      $t->id();
      $t->foreignId('tenant_id')->constrained()->cascadeOnDelete();
      $t->foreignId('user_id')->constrained()->cascadeOnDelete();
      $t->string('role')->default('admin'); // admin|staff
      $t->timestamps();
      $t->unique(['tenant_id','user_id']);
    });
  }
  public function down(): void { Schema::dropIfExists('tenant_user'); }
};
