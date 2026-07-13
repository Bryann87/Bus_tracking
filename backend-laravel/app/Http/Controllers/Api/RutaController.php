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
            // Agregamos los nuevos campos de la BD
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
            'frecuencia_minutos', 'hora_inicio', 'hora_fin' // Se agregan aquí también
        ]));

        if ($request->filled('paradas')) {
            $sync = [];
            foreach ($request->input('paradas') as $index => $paradaId) {
                // Usamos 'orden_recorrido' para que coincida con nuestra tabla pivote
                $sync[$paradaId] = ['orden_recorrido' => $index + 1];
            }
            $ruta->paradas()->sync($sync);
        }

        return response()->json([
            'message' => 'Ruta creada correctamente.',
            'ruta' => $ruta->load(['paradas' => function($query) {
                $query->orderBy('ruta_parada.orden_recorrido', 'asc');
            }]),
        ], 201);
    }

    public function show(Ruta $ruta)
    {
        // Forzamos el orden ascendente usando la tabla pivote
        $ruta->load(['paradas' => function($query) {
            $query->orderBy('ruta_parada.orden_recorrido', 'asc');
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
            'frecuencia_minutos', 'hora_inicio', 'hora_fin'
        ]));

        if ($request->has('paradas')) {
            $sync = [];
            foreach ($request->input('paradas') as $index => $paradaId) {
                $sync[$paradaId] = ['orden_recorrido' => $index + 1];
            }
            // Eloquent borra las anteriores y guarda estas nuevas automáticamente
            $ruta->paradas()->sync($sync);
        }

        return response()->json([
            'message' => 'Ruta actualizada correctamente.',
            'ruta' => $ruta->load(['paradas' => function($query) {
                $query->orderBy('ruta_parada.orden_recorrido', 'asc');
            }]),
        ]);
    }

    public function destroy(Ruta $ruta)
    {
        $ruta->delete();

        return response()->json([
            'message' => 'Ruta eliminada correctamente.',
        ]);
    }

    // --- NUEVO MÉTODO PARA LA APP MÓVIL ---
    // Devuelve las paradas asignadas a una ruta en su orden correspondiente
    public function getParadasAsignadas($id)
    {
        $ruta = Ruta::findOrFail($id);
        
        // Obtenemos las paradas ordenadas
        $paradas = $ruta->paradas()->orderBy('ruta_parada.orden_recorrido', 'asc')->get();
        
        // Mapeamos la respuesta para enviar solo los IDs y el orden a React Native
        $formato = $paradas->map(function($parada) {
            return [
                'id_parada' => $parada->id,
                'orden' => $parada->pivot->orden_recorrido
            ];
        });

        return response()->json($formato);
    }
}