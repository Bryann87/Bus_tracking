<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UbicacionBus extends Model
{
    use HasFactory;

    protected $table = 'ubicaciones_bus';

    protected $fillable = [
        'bus_id',
        'latitud',
        'longitud',
        'velocidad',
        'heading',
    ];

    protected function casts(): array
    {
        return [
            'latitud' => 'decimal:7',
            'longitud' => 'decimal:7',
            'velocidad' => 'decimal:2',
            'heading' => 'decimal:2',
        ];
    }

    public function bus()
    {
        return $this->belongsTo(Bus::class);
    }
}
