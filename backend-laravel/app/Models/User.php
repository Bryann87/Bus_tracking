<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'telefono',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function busAsignado()
    {
        return $this->hasOne(Bus::class, 'conductor_id');
    }

    public function reportes()
    {
        return $this->hasMany(Reporte::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isConductor(): bool
    {
        return $this->role === 'conductor';
    }
}
