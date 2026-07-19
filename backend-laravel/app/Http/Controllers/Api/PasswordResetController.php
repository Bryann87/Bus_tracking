<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class PasswordResetController extends Controller
{
    // Paso 1: el usuario pide el código
    public function enviarCodigo(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        // Respuesta genérica siempre (no revelamos si el correo existe o no,
        // para no facilitar que alguien "escanee" correos registrados)
        $mensajeGenerico = ['message' => 'Si el correo existe, te enviamos un código de recuperación.'];

        if (!$user) {
            return response()->json($mensajeGenerico);
        }

        $codigo = (string) random_int(100000, 999999);

        DB::table('password_reset_codes')->updateOrInsert(
            ['email' => $user->email],
            ['code' => Hash::make($codigo), 'created_at' => now()]
        );

        Mail::raw(
            "Tu código para restablecer tu contraseña en Transporte Urbano es: {$codigo}\n\nEste código vence en 15 minutos. Si no lo solicitaste, ignora este correo.",
            function ($message) use ($user) {
                $message->to($user->email)->subject('Código de recuperación - Transporte Urbano');
            }
        );

        return response()->json($mensajeGenerico);
    }

    // Paso 2: el usuario manda el código + su nueva contraseña
    public function restablecer(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Datos inválidos.', 'errors' => $validator->errors()], 422);
        }

        $registro = DB::table('password_reset_codes')->where('email', $request->email)->first();

        if (!$registro || !Hash::check($request->code, $registro->code)) {
            return response()->json(['message' => 'El código es incorrecto.'], 422);
        }

        if (now()->diffInMinutes($registro->created_at) > 15) {
            return response()->json(['message' => 'El código ha expirado. Solicita uno nuevo.'], 422);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $user->update(['password' => Hash::make($request->password)]);

        DB::table('password_reset_codes')->where('email', $request->email)->delete();

        // Por seguridad, invalida todas las sesiones activas de esta cuenta
        $user->tokens()->delete();

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }
}