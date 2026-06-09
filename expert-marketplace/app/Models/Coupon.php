<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = ['code', 'type', 'value', 'max_uses', 'used_count', 'expires_at', 'active'];

    protected $casts = ['expires_at' => 'datetime', 'active' => 'boolean'];

    public function isValid(): bool
    {
        if (!$this->active) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) return false;
        return true;
    }

    public function applyTo(float $price): float
    {
        if ($this->type === 'percent') {
            return round($price * $this->value / 100, 2);
        }
        return min($this->value, $price);
    }
}
