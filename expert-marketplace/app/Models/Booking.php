<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    protected $fillable = [
        'client_id', 'expert_id', 'slot_datetime_start', 'slot_datetime_end',
        'status', 'cancellation_reason', 'price', 'commission_amount', 'expert_payout', 'meeting_link',
        'coupon_code', 'discount_amount',
    ];

    protected function casts(): array
    {
        return [
            'slot_datetime_start' => 'datetime',
            'slot_datetime_end' => 'datetime',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function expert(): BelongsTo
    {
        return $this->belongsTo(ExpertProfile::class, 'expert_id');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function messages(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Message::class);
    }
}
