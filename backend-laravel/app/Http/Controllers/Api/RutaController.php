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
        ]));

        if ($request->filled('paradas')) {
            $sync = [];
            foreach ($request->input('paradas') as $orden => $paradaId) {
                $sync[$paradaId] = ['orden' => $orden + 1];
            }
            $ruta->paradas()->sync($sync);
        }

        return response()->json([
            'message' => 'Ruta creada correctamente.',
            'ruta' => $ruta->load('paradas'),
        ], 201);
    }

    public function show(Ruta $ruta)
    {
        return response()->json($ruta->load(['paradas', 'buses.conductor']));
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
        ]));

        if ($request->has('paradas')) {
            $sync = [];
            foreach ($request->input('paradas') as $orden => $paradaId) {
                $sync[$paradaId] = ['orden' => $orden + 1];
            }
            $ruta->paradas()->sync($sync);
        }

        return response()->json([
            'message' => 'Ruta actualizada correctamente.',
            'ruta' => $ruta->load('paradas'),
        ]);
    }

    public function destroy(Ruta $ruta)
    {
        $ruta->delete();

        return response()->json([
            'message' => 'Ruta eliminada correctamente.',
        ]);
    }
}
