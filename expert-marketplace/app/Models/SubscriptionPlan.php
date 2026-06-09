<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    protected $fillable = ['name', 'description', 'price', 'currency', 'interval', 'billing_interval', 'stripe_price_id', 'included_sessions_per_month', 'features', 'is_active'];

    protected $casts = ['features' => 'array', 'is_active' => 'boolean'];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class, 'plan_id');
    }
}
