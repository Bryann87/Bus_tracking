<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use Illuminate\Http\Request;

class BusController extends Controller
{
    // Listado general
    public function index() {
        return Bus::all();
    }

    // El endpoint que usa tu Dashboard para ver los buses moviéndose
    public function activos() {
        return Bus::where('estado', 'activo')
            ->where('ubicacion_actualizada_en', '>=', now()->subMinutes(2))
            ->select('id', 'latitud_actual as lat', 'longitud_actual as lng', 'ruta_id')
            ->get();
    }

    // El endpoint que usa el chofer (o el admin) para actualizar la posición
    public function actualizarUbicacion(Request $request, $bus_id) {
        $request->validate([
            'latitud' => 'required|numeric',
            'longitud' => 'required|numeric',
        ]);

        $bus = Bus::findOrFail($bus_id);
        $bus->update([
            'latitud_actual' => $request->latitud,
            'longitud_actual' => $request->longitud,
            'ubicacion_actualizada_en' => now(),
        ]);

        return response()->json(['message' => 'Ubicación actualizada con éxito']);
    }
}