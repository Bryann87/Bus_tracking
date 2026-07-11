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
        return $this->belongsToMany(Parada::class, 'ruta_parada')
            ->withPivot('orden')
            ->orderBy('ruta_parada.orden');
    }

    public function buses()
    {
        return $this->hasMany(Bus::class);
    }
}
