<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\UbicacionBus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BusController extends Controller
{
    public function index()
    {
        return Bus::with(['ruta', 'conductor'])->get();
    }

    // El endpoint que usa el Dashboard para ver los buses moviéndose
    public function activos()
    {
        return Bus::where('estado', 'activo')
            ->where('ubicacion_actualizada_en', '>=', now()->subMinutes(2))
            ->select('id', 'placa', 'latitud_actual as lat', 'longitud_actual as lng', 'ruta_id')
            ->get();
    }

    public function show(Bus $bus)
    {
        return response()->json($bus->load(['ruta', 'conductor']));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'placa' => 'required|string|max:20|unique:buses,placa',
            'modelo' => 'nullable|string|max:255',
            'capacidad' => 'nullable|integer|min:1',
            'estado' => 'nullable|in:activo,inactivo,mantenimiento',
            'ruta_id' => 'nullable|exists:rutas,id',
            'conductor_id' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $bus = Bus::create($validator->validated());

        return response()->json([
            'message' => 'Bus registrado correctamente.',
            'bus' => $bus->load(['ruta', 'conductor']),
        ], 201);
    }

    public function update(Request $request, Bus $bus)
    {
        $validator = Validator::make($request->all(), [
            'placa' => 'sometimes|required|string|max:20|unique:buses,placa,' . $bus->id,
            'modelo' => 'nullable|string|max:255',
            'capacidad' => 'nullable|integer|min:1',
            'estado' => 'nullable|in:activo,inactivo,mantenimiento',
            'ruta_id' => 'nullable|exists:rutas,id',
            'conductor_id' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $bus->update($validator->validated());

        return response()->json([
            'message' => 'Bus actualizado correctamente.',
            'bus' => $bus->load(['ruta', 'conductor']),
        ]);
    }

    public function destroy(Bus $bus)
    {
        $bus->delete();

        return response()->json(['message' => 'Bus eliminado correctamente.']);
    }

    // El conductor (o el admin) actualiza la posición en vivo
    public function actualizarUbicacion(Request $request, $bus_id)
    {
        $request->validate([
            'latitud' => 'required|numeric|between:-90,90',
            'longitud' => 'required|numeric|between:-180,180',
            'velocidad' => 'nullable|numeric',
            'heading' => 'nullable|numeric',
        ]);

        $bus = Bus::findOrFail($bus_id);
        $bus->update([
            'latitud_actual' => $request->latitud,
            'longitud_actual' => $request->longitud,
            'velocidad_actual' => $request->velocidad,
            'ubicacion_actualizada_en' => now(),
        ]);

        // Guarda también el historial (la tabla ya existía pero nunca se usaba)
        UbicacionBus::create([
            'bus_id' => $bus->id,
            'latitud' => $request->latitud,
            'longitud' => $request->longitud,
            'velocidad' => $request->velocidad,
            'heading' => $request->heading,
        ]);

        return response()->json(['message' => 'Ubicación actualizada con éxito']);
    }

    // Historial de recorrido de un bus (últimas 100 posiciones)
    public function historialUbicaciones(Bus $bus)
    {
        return response()->json(
            $bus->ubicaciones()->limit(100)->get()
        );
    }
}