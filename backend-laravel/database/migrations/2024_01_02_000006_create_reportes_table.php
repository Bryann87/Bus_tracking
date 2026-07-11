<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reportes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('bus_id')->nullable()->constrained('buses')->nullOnDelete();
            $table->foreignId('parada_id')->nullable()->constrained('paradas')->nullOnDelete();
            $table->enum('tipo', ['retraso', 'averia', 'seguridad', 'limpieza', 'otro']);
            $table->text('descripcion');
            $table->enum('estado', ['pendiente', 'revisado', 'resuelto'])->default('pendiente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reportes');
    }
};
