<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ruta_parada', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ruta_id')->constrained('rutas')->cascadeOnDelete();
            $table->foreignId('parada_id')->constrained('paradas')->cascadeOnDelete();
            // orden de la parada dentro del recorrido de la ruta
            $table->unsignedInteger('orden')->default(1);
            $table->timestamps();

            $table->unique(['ruta_id', 'parada_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ruta_parada');
    }
};
