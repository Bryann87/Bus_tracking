<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Parada extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'direccion',
        'latitud',
        'longitud',
    ];

    protected function casts(): array
    {
        return [
            'latitud' => 'decimal:7',
            'longitud' => 'decimal:7',
        ];
    }

    public function rutas()
    {
        return $this->belongsToMany(Ruta::class, 'ruta_parada')
            ->withPivot('orden');
    }

    public function reportes()
    {
        return $this->hasMany(Reporte::class);
    }
}
