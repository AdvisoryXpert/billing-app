<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
  public function up(): void {
    Schema::create('tenants', function (Blueprint $t) {
      $t->id();
      $t->string('name');
      $t->string('slug')->unique();   // e.g. "acme"
      $t->string('gstin')->nullable();
      $t->string('home_state')->nullable();
      $t->timestamps();
    });
  }
  public function down(): void { Schema::dropIfExists('tenants'); }
};
