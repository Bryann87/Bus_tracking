<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // Admin-only (ver routes/api.php). Filtra por rol: /users?role=conductor
    public function index(Request $request)
    {
        $query = User::query()->select('id', 'name', 'email', 'role', 'telefono');

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        return response()->json($query->orderBy('name')->get());
    }
}