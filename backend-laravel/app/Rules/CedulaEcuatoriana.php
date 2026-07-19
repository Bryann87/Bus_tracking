<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\ValidationRule;

class CedulaEcuatoriana implements ValidationRule
{
    public function validate(string $attribute, mixed $value, \Closure $fail): void
    {
        if (!preg_match('/^\d{10}$/', $value)) {
            $fail('La cédula debe tener 10 dígitos numéricos.');
            return;
        }

        $provincia = (int) substr($value, 0, 2);
        if ($provincia < 1 || $provincia > 24) {
            $fail('La cédula no pertenece a una provincia válida.');
            return;
        }

        $tercerDigito = (int) $value[2];
        if ($tercerDigito > 6) {
            $fail('La cédula ingresada no es válida.');
            return;
        }

        // Algoritmo módulo 10 del Registro Civil del Ecuador
        $coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        $suma = 0;
        for ($i = 0; $i < 9; $i++) {
            $valor = (int) $value[$i] * $coeficientes[$i];
            $suma += $valor > 9 ? $valor - 9 : $valor;
        }

        $digitoVerificador = (10 - ($suma % 10)) % 10;

        if ($digitoVerificador !== (int) $value[9]) {
            $fail('La cédula ingresada no es válida.');
        }
    }
}