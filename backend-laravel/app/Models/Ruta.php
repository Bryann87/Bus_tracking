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
    // Asegúrate de tener ->withPivot('orden_recorrido') al final
    return $this->belongsToMany(Parada::class, 'ruta_parada', 'id_ruta', 'id_parada')
                ->withPivot('orden_recorrido', 'tiempo_promedio_llegada');
}

    public function buses()
    {
        return $this->hasMany(Bus::class);
    }
}
