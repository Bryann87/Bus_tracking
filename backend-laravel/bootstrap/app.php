<?php
/*
|--------------------------------------------------------------------------
| CONFIGURACIÓN NECESARIA EN bootstrap/app.php
|--------------------------------------------------------------------------
| Este archivo NO se copia tal cual: abre tu bootstrap/app.php (generado
| por `composer create-project laravel/laravel backend`) y agrega lo
| siguiente dentro de ->withMiddleware() y ->withRouting().
*/

use App\Http\Middleware\CheckRole;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php', // <-- asegúrate que esta línea exista
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Registra el alias 'role' usado en routes/api.php
        $middleware->alias([
            'role' => CheckRole::class,
        ]);

        // Habilita Sanctum para las rutas API (peticiones desde React Native)
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
