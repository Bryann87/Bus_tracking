<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BusController;
use App\Http\Controllers\Api\ParadaController;
use App\Http\Controllers\Api\ReporteController;
use App\Http\Controllers\Api\RutaController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PasswordResetController;

/*
|--------------------------------------------------------------------------
| API Routes - App de Transporte Urbano
|--------------------------------------------------------------------------
*/

// Autenticación pública
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [PasswordResetController::class, 'enviarCodigo']);
Route::post('/reset-password', [PasswordResetController::class, 'restablecer']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // ----- Rutas (lectura para todos los autenticados, escritura solo admin) -----
    Route::get('/rutas', [RutaController::class, 'index']);
    Route::get('/rutas/{ruta}', [RutaController::class, 'show']);
    Route::get('/rutas/{id}/paradas', [RutaController::class, 'getParadasAsignadas']);

    Route::middleware('role:admin')->group(function () {
        Route::post('/rutas', [RutaController::class, 'store']);
        Route::post('/rutas/{id}/paradas', [RutaController::class, 'asignarParadas']);
        Route::put('/rutas/{ruta}', [RutaController::class, 'update']);
        Route::delete('/rutas/{ruta}', [RutaController::class, 'destroy']);
    });

    // ----- Paradas -----
    Route::get('/paradas', [ParadaController::class, 'index']);
    Route::get('/paradas/{parada}', [ParadaController::class, 'show']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/paradas', [ParadaController::class, 'store']);
        Route::put('/paradas/{parada}', [ParadaController::class, 'update']);
        Route::delete('/paradas/{parada}', [ParadaController::class, 'destroy']);
    });

    // ----- Buses -----
    Route::get('/buses', [BusController::class, 'index']);
    Route::get('/buses/activos', [BusController::class, 'activos']);
    Route::get('/buses/{bus}', [BusController::class, 'show']);
    Route::get('/buses/{bus}/ubicaciones', [BusController::class, 'historialUbicaciones']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/buses', [BusController::class, 'store']);
        Route::put('/buses/{bus}', [BusController::class, 'update']);
        Route::delete('/buses/{bus}', [BusController::class, 'destroy']);
    });

    // el conductor (o el admin) reporta la ubicación en tiempo real
    Route::middleware('role:admin,conductor')->group(function () {
        Route::post('/buses/{bus}/ubicacion', [BusController::class, 'actualizarUbicacion']);
    });

    // ----- Reportes (pasajeros crean, admin gestiona) -----
    Route::get('/reportes', [ReporteController::class, 'index']);
    Route::post('/reportes', [ReporteController::class, 'store']);
    Route::get('/reportes/{reporte}', [ReporteController::class, 'show']);
    Route::middleware('role:admin')->group(function () {
        Route::put('/reportes/{reporte}', [ReporteController::class, 'update']);
        Route::delete('/reportes/{reporte}', [ReporteController::class, 'destroy']);
    });

    // ----- Usuarios / Conductores (solo admin) -----
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });
});