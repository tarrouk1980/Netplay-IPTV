<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GiftCode extends Model
{
    protected $fillable = [
        'code', 'purchaser_id', 'expert_profile_id', 'amount', 'currency',
        'recipient_email', 'recipient_name', 'message', 'redeemed', 'redeemed_by', 'redeemed_at', 'expires_at',
    ];

    protected $casts = [
        'redeemed' => 'boolean',
        'redeemed_at' => 'datetime',
        'expires_at' => 'datetime',
    ];
}
