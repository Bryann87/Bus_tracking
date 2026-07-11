<?php

namespace Database\Seeders;

use App\Models\Bus;
use App\Models\Parada;
use App\Models\Ruta;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ----- Usuarios de prueba -----
        $admin = User::create([
            'name' => 'Administrador',
            'email' => 'admin@transporte.test',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $conductor1 = User::create([
            'name' => 'Carlos Zambrano',
            'email' => 'conductor1@transporte.test',
            'password' => Hash::make('password'),
            'role' => 'conductor',
            'telefono' => '0991234567',
        ]);

        $conductor2 = User::create([
            'name' => 'Maria Loor',
            'email' => 'conductor2@transporte.test',
            'password' => Hash::make('password'),
            'role' => 'conductor',
            'telefono' => '0987654321',
        ]);

        User::create([
            'name' => 'Pasajero Demo',
            'email' => 'pasajero@transporte.test',
            'password' => Hash::make('password'),
            'role' => 'pasajero',
        ]);

        // ----- Rutas (Portoviejo, Ecuador) -----
        $ruta1 = Ruta::create([
            'nombre' => 'Ruta 1 - Centro / Andrés de Vera',
            'descripcion' => 'Recorrido desde el centro de la ciudad hasta la ciudadela Andrés de Vera.',
            'origen' => 'Parque Central',
            'destino' => 'Andrés de Vera',
            'tarifa' => 0.35,
            'activo' => true,
        ]);

        $ruta2 = Ruta::create([
            'nombre' => 'Ruta 2 - Terminal / Universidad',
            'descripcion' => 'Conecta el Terminal Terrestre con la zona universitaria.',
            'origen' => 'Terminal Terrestre',
            'destino' => 'Universidad Técnica de Manabí',
            'tarifa' => 0.35,
            'activo' => true,
        ]);

        // ----- Paradas -----
        $paradasRuta1 = [
            Parada::create(['nombre' => 'Parque Central', 'direccion' => 'Av. 3 y Calle 10', 'latitud' => -1.0546, 'longitud' => -80.4547]),
            Parada::create(['nombre' => 'Mercado Central', 'direccion' => 'Calle 12', 'latitud' => -1.0520, 'longitud' => -80.4530]),
            Parada::create(['nombre' => 'Andrés de Vera', 'direccion' => 'Av. Universitaria', 'latitud' => -1.0480, 'longitud' => -80.4490]),
        ];

        $paradasRuta2 = [
            Parada::create(['nombre' => 'Terminal Terrestre', 'direccion' => 'Vía Manta', 'latitud' => -1.0700, 'longitud' => -80.4650]),
            Parada::create(['nombre' => 'Coliseo Manabí', 'direccion' => 'Av. Metropolitana', 'latitud' => -1.0600, 'longitud' => -80.4600]),
            Parada::create(['nombre' => 'UTM', 'direccion' => 'Av. Urbina', 'latitud' => -1.0500, 'longitud' => -80.4550]),
        ];

        foreach ($paradasRuta1 as $i => $parada) {
            $ruta1->paradas()->attach($parada->id, ['orden' => $i + 1]);
        }

        foreach ($paradasRuta2 as $i => $parada) {
            $ruta2->paradas()->attach($parada->id, ['orden' => $i + 1]);
        }

        // ----- Buses -----
        Bus::create([
            'placa' => 'ABC-1234',
            'modelo' => 'Hino AK8',
            'capacidad' => 35,
            'estado' => 'activo',
            'ruta_id' => $ruta1->id,
            'conductor_id' => $conductor1->id,
            'latitud_actual' => -1.0546,
            'longitud_actual' => -80.4547,
            'velocidad_actual' => 20,
            'ubicacion_actualizada_en' => now(),
        ]);

        Bus::create([
            'placa' => 'XYZ-5678',
            'modelo' => 'Mercedes Benz OF-1721',
            'capacidad' => 40,
            'estado' => 'activo',
            'ruta_id' => $ruta2->id,
            'conductor_id' => $conductor2->id,
            'latitud_actual' => -1.0700,
            'longitud_actual' => -80.4650,
            'velocidad_actual' => 15,
            'ubicacion_actualizada_en' => now(),
        ]);

        $this->command->info('Datos de prueba creados. Usuarios (password: "password"):');
        $this->command->info('  admin@transporte.test / conductor1@transporte.test / conductor2@transporte.test / pasajero@transporte.test');
    }
}
