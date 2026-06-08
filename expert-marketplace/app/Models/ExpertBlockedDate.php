<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExpertBlockedDate extends Model
{
    protected $fillable = ['expert_profile_id', 'blocked_date', 'reason'];

    protected function casts(): array
    {
        return ['blocked_date' => 'date'];
    }

    public function expertProfile(): BelongsTo
    {
        return $this->belongsTo(ExpertProfile::class);
    }
}
