<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ubicaciones_bus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bus_id')->constrained('buses')->cascadeOnDelete();
            $table->decimal('latitud', 10, 7);
            $table->decimal('longitud', 10, 7);
            $table->decimal('velocidad', 6, 2)->nullable();
            $table->decimal('heading', 6, 2)->nullable();
            $table->timestamps();

            $table->index(['bus_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ubicaciones_bus');
    }
};
