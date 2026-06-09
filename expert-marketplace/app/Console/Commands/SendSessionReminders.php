<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Notifications\SessionReminder;
use Illuminate\Console\Command;

class SendSessionReminders extends Command
{
    protected $signature = 'skolz:send-reminders';
    protected $description = 'Send 24h session reminder emails to clients and experts';

    public function handle(): void
    {
        $bookings = Booking::where('status', 'confirmed')
            ->whereBetween('slot_datetime_start', [now()->addHours(23), now()->addHours(25)])
            ->with(['client', 'expert.user'])
            ->get();

        foreach ($bookings as $booking) {
            $booking->client?->notify(new SessionReminder($booking));
            $booking->expert?->user?->notify(new SessionReminder($booking));
            $this->line("Reminder sent for booking #{$booking->id}");
        }

        $this->info("Sent {$bookings->count()} reminder pairs.");
    }
}
