<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SessionReminder extends Notification
{
    use Queueable;

    public function __construct(public readonly Booking $booking) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $start = $this->booking->slot_datetime_start->format('d/m/Y à H:i');
        $expert = $this->booking->expert?->user?->name ?? 'votre expert';

        return (new MailMessage)
            ->subject('[SKOLZ] Rappel : session dans 24h')
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line('Votre session avec ' . $expert . ' est dans 24 heures.')
            ->line('📅 ' . $start)
            ->when($this->booking->meeting_link, fn ($m) => $m->line('🔗 ' . $this->booking->meeting_link))
            ->action('Voir ma réservation', url('/dashboard/bookings/' . $this->booking->id))
            ->line('À demain sur SKOLZ !');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'booking_id' => $this->booking->id,
            'status' => 'reminder',
            'message' => 'Rappel : votre session est dans 24 heures.',
        ];
    }
}
