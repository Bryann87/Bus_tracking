<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Parada;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ParadaController extends Controller
{
    public function index(Request $request)
    {
        $query = Parada::withCount('rutas');

        if ($request->filled('buscar')) {
            $query->where('nombre', 'like', '%'.$request->input('buscar').'%');
        }

        if ($request->filled('ruta_id')) {
            $query->whereHas('rutas', function ($q) use ($request) {
                $q->where('rutas.id', $request->input('ruta_id'));
            });
        }

        return response()->json($query->orderBy('nombre')->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'direccion' => 'nullable|string|max:255',
            'latitud' => 'required|numeric|between:-90,90',
            'longitud' => 'required|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $parada = Parada::create($validator->validated());

        return response()->json([
            'message' => 'Parada registrada correctamente.',
            'parada' => $parada,
        ], 201);
    }

    public function show(Parada $parada)
    {
        return response()->json($parada->load('rutas'));
    }

    public function update(Request $request, Parada $parada)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'sometimes|required|string|max:255',
            'direccion' => 'nullable|string|max:255',
            'latitud' => 'sometimes|required|numeric|between:-90,90',
            'longitud' => 'sometimes|required|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $parada->update($validator->validated());

        return response()->json([
            'message' => 'Parada actualizada correctamente.',
            'parada' => $parada,
        ]);
    }

    public function destroy(Parada $parada)
    {
        $parada->delete();

        return response()->json([
            'message' => 'Parada eliminada correctamente.',
        ]);
    }
}
