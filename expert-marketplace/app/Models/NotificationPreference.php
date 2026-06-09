<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    protected $fillable = ['user_id', 'booking_updates', 'new_messages', 'review_notifications', 'promotions'];

    protected $casts = [
        'booking_updates' => 'boolean',
        'new_messages' => 'boolean',
        'review_notifications' => 'boolean',
        'promotions' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
