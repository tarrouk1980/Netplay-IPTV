<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingStatusChanged extends Notification
{
    use Queueable;

    public function __construct(public readonly Booking $booking, public readonly string $status) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = $this->toDatabase($notifiable)['message'];
        $start = $this->booking->slot_datetime_start->format('d/m/Y H:i');

        return (new MailMessage)
            ->subject('[SKOLZ] ' . match ($this->status) {
                'new' => 'Nouvelle réservation reçue',
                'confirmed' => 'Réservation confirmée',
                'cancelled' => 'Réservation annulée',
                'completed' => 'Session terminée',
                'rescheduled' => 'Réservation reprogrammée',
                default => 'Mise à jour de réservation',
            })
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line($message)
            ->line('Créneau : ' . $start)
            ->action('Voir ma réservation', url('/dashboard/bookings/' . $this->booking->id))
            ->line('Merci d\'utiliser SKOLZ.');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'booking_id' => $this->booking->id,
            'status' => $this->status,
            'message' => match ($this->status) {
                'new' => 'Vous avez reçu une nouvelle réservation.',
                'confirmed' => 'Votre réservation a été confirmée.',
                'cancelled' => 'Une réservation a été annulée.',
                'completed' => 'Une session est terminée. Pensez à laisser un avis.',
                'rescheduled' => 'Une réservation a été reprogrammée.',
                default => 'Le statut de votre réservation a changé : '.$this->status,
            },
        ];
    }
}
