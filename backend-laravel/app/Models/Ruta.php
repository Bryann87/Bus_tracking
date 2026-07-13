<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ruta extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'descripcion',
        'origen',
        'destino',
        'tarifa',
        'activo',
        'frecuencia_minutos',
        'hora_inicio',
        'hora_fin',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
            'tarifa' => 'decimal:2',
        ];
    }

    public function paradas()
    {
        // Los nombres de FK y de la columna pivote deben coincidir EXACTO
        // con la migración create_ruta_parada_table: ruta_id, parada_id, orden.
        return $this->belongsToMany(Parada::class, 'ruta_parada', 'ruta_id', 'parada_id')
            ->withPivot('orden')
            ->withTimestamps();
    }

    public function buses()
    {
        return $this->hasMany(Bus::class);
    }
}