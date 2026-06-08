<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExpertProfile extends Model
{
    protected $fillable = [
        'user_id', 'category_id', 'bio', 'years_experience', 'credential_reference', 'hourly_rate',
        'currency', 'status', 'commission_rate', 'rating_avg', 'total_sessions',
        'stripe_account_id', 'stripe_onboarded', 'languages', 'last_seen_at', 'featured',
    ];

    protected function casts(): array
    {
        return [
            'languages'    => 'array',
            'last_seen_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function availabilitySlots(): HasMany
    {
        return $this->hasMany(AvailabilitySlot::class, 'expert_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'expert_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'expert_id');
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(Payout::class, 'expert_id');
    }

    public function favoritedBy(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function portfolioItems(): HasMany
    {
        return $this->hasMany(ExpertPortfolioItem::class);
    }

    public function blockedDates(): HasMany
    {
        return $this->hasMany(ExpertBlockedDate::class);
    }
}
