<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    // Admin-only. Filtra por rol: /users?role=conductor
    public function index(Request $request)
{
    $query = User::query()
        ->select('id', 'name', 'email', 'role', 'telefono')
        ->withCount('busAsignado');   // <- ahora el select() no lo pisa

    if ($request->filled('role')) {
        $query->where('role', $request->input('role'));
    }

    return response()->json($query->orderBy('name')->get());
}

    // Admin-only. Crea cuentas de conductor (o admin) directamente,
    // sin pasar por el registro público que solo permite 'pasajero'.
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,conductor',
            'telefono' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'telefono' => $request->telefono,
        ]);

        return response()->json([
            'message' => 'Usuario creado correctamente.',
            'user' => $user,
        ], 201);
    }

    public function destroy(User $user)
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'No se puede eliminar una cuenta de administrador.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Usuario eliminado correctamente.']);
    }
}