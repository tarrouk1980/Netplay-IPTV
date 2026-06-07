<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BookingStatusChanged extends Notification
{
    use Queueable;

    public function __construct(public readonly Booking $booking, public readonly string $status) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'booking_id' => $this->booking->id,
            'status' => $this->status,
            'message' => match ($this->status) {
                'confirmed' => 'Votre réservation a été confirmée.',
                'cancelled' => 'Une réservation a été annulée.',
                'completed' => 'Une session est terminée. Pensez à laisser un avis.',
                default => 'Le statut de votre réservation a changé : '.$this->status,
            },
        ];
    }
}
