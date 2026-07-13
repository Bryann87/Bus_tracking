<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ruta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RutaController extends Controller
{
    public function index(Request $request)
    {
        $query = Ruta::withCount(['buses', 'paradas']);

        if ($request->boolean('activo')) {
            $query->where('activo', true);
        }

        if ($request->filled('buscar')) {
            $buscar = $request->input('buscar');
            $query->where(function ($q) use ($buscar) {
                $q->where('nombre', 'like', "%{$buscar}%")
                    ->orWhere('origen', 'like', "%{$buscar}%")
                    ->orWhere('destino', 'like', "%{$buscar}%");
            });
        }

        return response()->json($query->orderBy('nombre')->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'origen' => 'required|string|max:255',
            'destino' => 'required|string|max:255',
            'tarifa' => 'nullable|numeric|min:0',
            'activo' => 'nullable|boolean',
            'frecuencia_minutos' => 'nullable|integer|min:1',
            'hora_inicio' => 'nullable|date_format:H:i',
            'hora_fin' => 'nullable|date_format:H:i',
            'paradas' => 'nullable|array',
            'paradas.*' => 'exists:paradas,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $ruta = Ruta::create($request->only([
            'nombre', 'descripcion', 'origen', 'destino', 'tarifa', 'activo',
            'frecuencia_minutos', 'hora_inicio', 'hora_fin',
        ]));

        if ($request->filled('paradas')) {
            $sync = [];
            foreach ($request->input('paradas') as $index => $paradaId) {
                $sync[$paradaId] = ['orden' => $index + 1];
            }
            $ruta->paradas()->sync($sync);
        }

        return response()->json([
            'message' => 'Ruta creada correctamente.',
            'ruta' => $ruta->load(['paradas' => function ($query) {
                $query->orderBy('ruta_parada.orden', 'asc');
            }]),
        ], 201);
    }

    public function show(Ruta $ruta)
    {
        $ruta->load(['paradas' => function ($query) {
            $query->orderBy('ruta_parada.orden', 'asc');
        }, 'buses.conductor']);

        return response()->json($ruta);
    }

    public function update(Request $request, Ruta $ruta)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'sometimes|required|string|max:255',
            'descripcion' => 'nullable|string',
            'origen' => 'sometimes|required|string|max:255',
            'destino' => 'sometimes|required|string|max:255',
            'tarifa' => 'nullable|numeric|min:0',
            'activo' => 'nullable|boolean',
            'frecuencia_minutos' => 'nullable|integer|min:1',
            'hora_inicio' => 'nullable|date_format:H:i',
            'hora_fin' => 'nullable|date_format:H:i',
            'paradas' => 'nullable|array',
            'paradas.*' => 'exists:paradas,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $ruta->update($request->only([
            'nombre', 'descripcion', 'origen', 'destino', 'tarifa', 'activo',
            'frecuencia_minutos', 'hora_inicio', 'hora_fin',
        ]));

        if ($request->has('paradas')) {
            $sync = [];
            foreach ($request->input('paradas') as $index => $paradaId) {
                $sync[$paradaId] = ['orden' => $index + 1];
            }
            $ruta->paradas()->sync($sync);
        }

        return response()->json([
            'message' => 'Ruta actualizada correctamente.',
            'ruta' => $ruta->load(['paradas' => function ($query) {
                $query->orderBy('ruta_parada.orden', 'asc');
            }]),
        ]);
    }

    public function destroy(Ruta $ruta)
    {
        $ruta->delete();

        return response()->json(['message' => 'Ruta eliminada correctamente.']);
    }

    // Devuelve las paradas asignadas a una ruta en su orden correspondiente
    public function getParadasAsignadas($id)
    {
        $ruta = Ruta::findOrFail($id);

        $paradas = $ruta->paradas()->orderBy('ruta_parada.orden', 'asc')->get();

        $formato = $paradas->map(function ($parada) {
            return [
                'id_parada' => $parada->id,
                'nombre' => $parada->nombre,
                'latitud' => $parada->latitud,
                'longitud' => $parada->longitud,
                'orden' => $parada->pivot->orden,
            ];
        });

        return response()->json($formato);
    }
}