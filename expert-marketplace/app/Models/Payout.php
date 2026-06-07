<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payout extends Model
{
    protected $fillable = ['expert_id', 'amount', 'period_start', 'period_end', 'status', 'paid_at'];

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'paid_at' => 'datetime',
        ];
    }

    public function expert(): BelongsTo
    {
        return $this->belongsTo(ExpertProfile::class, 'expert_id');
    }
}
