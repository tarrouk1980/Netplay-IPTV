<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingInviteSent extends Notification
{
    use Queueable;

    public function __construct(public readonly Booking $booking) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $expert = $this->booking->expert;
        $start = $this->booking->slot_datetime_start->format('d/m/Y à H:i');

        return (new MailMessage)
            ->subject('[SKOLZ] Invitation de session — ' . $expert?->user?->name)
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line($expert?->user?->name . ' vous a envoyé une invitation pour votre session.')
            ->line('📅 ' . $start)
            ->when($this->booking->meeting_link, fn ($m) => $m->line('🔗 Lien de réunion : ' . $this->booking->meeting_link))
            ->action('Voir ma réservation', url('/dashboard/bookings/' . $this->booking->id))
            ->line('Merci d\'utiliser SKOLZ.');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'booking_id' => $this->booking->id,
            'status' => 'invite_sent',
            'message' => 'Un expert vous a envoyé une invitation de session.',
        ];
    }
}
