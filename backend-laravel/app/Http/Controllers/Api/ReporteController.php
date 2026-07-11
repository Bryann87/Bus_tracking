<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reporte;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReporteController extends Controller
{
    public function index(Request $request)
    {
        $query = Reporte::with(['user:id,name', 'bus:id,placa', 'parada:id,nombre']);

        // un pasajero solo ve sus propios reportes; admin ve todos
        if ($request->user()->role === 'pasajero') {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bus_id' => 'nullable|exists:buses,id',
            'parada_id' => 'nullable|exists:paradas,id',
            'tipo' => 'required|in:retraso,averia,seguridad,limpieza,otro',
            'descripcion' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $reporte = Reporte::create([
            ...$validator->validated(),
            'user_id' => $request->user()->id,
            'estado' => 'pendiente',
        ]);

        return response()->json([
            'message' => 'Reporte enviado correctamente.',
            'reporte' => $reporte->load(['bus', 'parada']),
        ], 201);
    }

    public function show(Reporte $reporte)
    {
        return response()->json($reporte->load(['user:id,name', 'bus', 'parada']));
    }

    public function update(Request $request, Reporte $reporte)
    {
        $validator = Validator::make($request->all(), [
            'estado' => 'sometimes|required|in:pendiente,revisado,resuelto',
            'descripcion' => 'sometimes|required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $reporte->update($validator->validated());

        return response()->json([
            'message' => 'Reporte actualizado correctamente.',
            'reporte' => $reporte,
        ]);
    }

    public function destroy(Reporte $reporte)
    {
        $reporte->delete();

        return response()->json([
            'message' => 'Reporte eliminado correctamente.',
        ]);
    }
}
