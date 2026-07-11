<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bus extends Model
{
    use HasFactory;

    protected $fillable = [
        'placa',
        'modelo',
        'capacidad',
        'estado',
        'ruta_id',
        'conductor_id',
        'latitud_actual',
        'longitud_actual',
        'velocidad_actual',
        'ubicacion_actualizada_en',
    ];

    protected function casts(): array
    {
        return [
            'latitud_actual' => 'decimal:7',
            'longitud_actual' => 'decimal:7',
            'velocidad_actual' => 'decimal:2',
            'ubicacion_actualizada_en' => 'datetime',
        ];
    }

    public function ruta()
    {
        return $this->belongsTo(Ruta::class);
    }

    public function conductor()
    {
        return $this->belongsTo(User::class, 'conductor_id');
    }

    public function ubicaciones()
    {
        return $this->hasMany(UbicacionBus::class)->latest();
    }

    public function reportes()
    {
        return $this->hasMany(Reporte::class);
    }

    /**
     * Un bus se considera "en línea" si reportó ubicación
     * en los últimos 2 minutos.
     */
    public function getEnLineaAttribute(): bool
    {
        return $this->ubicacion_actualizada_en
            && $this->ubicacion_actualizada_en->gt(now()->subMinutes(2));
    }
}
