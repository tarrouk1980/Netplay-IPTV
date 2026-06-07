<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AvailabilitySlot extends Model
{
    protected $fillable = [
        'expert_id', 'day_of_week', 'specific_date', 'start_time',
        'end_time', 'is_recurring', 'timezone',
    ];

    public function expert(): BelongsTo
    {
        return $this->belongsTo(ExpertProfile::class, 'expert_id');
    }
}
