<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('buses', function (Blueprint $table) {
            $table->id();
            $table->string('placa')->unique();
            $table->string('modelo')->nullable();
            $table->unsignedInteger('capacidad')->default(30);
            $table->enum('estado', ['activo', 'inactivo', 'mantenimiento'])->default('activo');
            $table->foreignId('ruta_id')->nullable()->constrained('rutas')->nullOnDelete();
            $table->foreignId('conductor_id')->nullable()->constrained('users')->nullOnDelete();

            // última posición conocida (para consultas rápidas en el mapa,
            // el historial completo se guarda en ubicaciones_bus)
            $table->decimal('latitud_actual', 10, 7)->nullable();
            $table->decimal('longitud_actual', 10, 7)->nullable();
            $table->decimal('velocidad_actual', 6, 2)->nullable();
            $table->timestamp('ubicacion_actualizada_en')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('buses');
    }
};
