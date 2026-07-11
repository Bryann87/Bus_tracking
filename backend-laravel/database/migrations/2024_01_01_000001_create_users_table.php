<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            // admin: administra rutas/buses/paradas
            // conductor: reporta la ubicación de su bus
            // pasajero: consulta rutas/buses y crea reportes
            $table->enum('role', ['admin', 'conductor', 'pasajero'])->default('pasajero');
            $table->string('telefono')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
