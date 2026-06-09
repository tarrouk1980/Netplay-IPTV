<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Gratuit',
                'description' => 'Pour découvrir la plateforme',
                'price' => 0,
                'currency' => 'EUR',
                'interval' => 'month',
                'billing_interval' => 'month',
                'included_sessions_per_month' => 1,
                'is_active' => true,
                'features' => [
                    'Consulter les profils d\'experts',
                    '1 session d\'essai par mois',
                    'Messagerie de base',
                    'Support par email',
                ],
            ],
            [
                'name' => 'Pro',
                'description' => 'Pour les utilisateurs réguliers',
                'price' => 29,
                'currency' => 'EUR',
                'interval' => 'month',
                'billing_interval' => 'month',
                'included_sessions_per_month' => 10,
                'is_active' => true,
                'features' => [
                    'Jusqu\'à 10 sessions par mois',
                    'Accès prioritaire aux experts',
                    'Historique complet des sessions',
                    'Support prioritaire',
                    'Enregistrement des sessions',
                ],
            ],
            [
                'name' => 'Expert',
                'description' => 'Pour les professionnels exigeants',
                'price' => 49,
                'currency' => 'EUR',
                'interval' => 'month',
                'billing_interval' => 'month',
                'included_sessions_per_month' => 999,
                'is_active' => true,
                'features' => [
                    'Sessions illimitées',
                    'Accès aux experts premium certifiés',
                    'Sessions en groupe',
                    'Rapports et suivi personnalisé',
                    'Support dédié 24/7',
                    'Accès anticipé aux nouveautés',
                ],
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(['name' => $plan['name']], $plan);
        }
    }
}
