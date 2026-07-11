<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reporte extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bus_id',
        'parada_id',
        'tipo',
        'descripcion',
        'estado',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bus()
    {
        return $this->belongsTo(Bus::class);
    }

    public function parada()
    {
        return $this->belongsTo(Parada::class);
    }
}
