<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\ExpertProfile;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(CategorySeeder::class);

        // Admin
        User::create([
            'name' => 'Admin SKOLZ',
            'email' => 'admin@skolz.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Client de test
        $client = User::create([
            'name' => 'Jean Dupont',
            'email' => 'client@skolz.com',
            'password' => Hash::make('password'),
            'role' => 'client',
        ]);

        $categories = Category::all();

        $experts = [
            [
                'name' => 'Sophie Martin',
                'email' => 'sophie@skolz.com',
                'bio' => 'Coach certifiée avec 10 ans d\'expérience en développement personnel et leadership.',
                'headline' => 'Coach en développement personnel',
                'hourly_rate' => 80,
                'category' => 'Coaching',
                'specializations' => ['Leadership', 'Confiance en soi', 'Gestion du stress'],
                'languages' => ['fr', 'en'],
                'country' => 'FR',
                'rating' => 4.9,
                'sessions' => 142,
            ],
            [
                'name' => 'Karim Benali',
                'email' => 'karim@skolz.com',
                'bio' => 'Expert en marketing digital et growth hacking. J\'ai aidé +50 startups à scaler.',
                'headline' => 'Expert Marketing Digital & Growth',
                'hourly_rate' => 120,
                'category' => 'Marketing',
                'specializations' => ['SEO', 'Growth Hacking', 'Réseaux sociaux'],
                'languages' => ['fr', 'ar', 'en'],
                'country' => 'MA',
                'rating' => 4.8,
                'sessions' => 98,
            ],
            [
                'name' => 'Amina Cherif',
                'email' => 'amina@skolz.com',
                'bio' => 'Avocate spécialisée en droit des affaires et droit international.',
                'headline' => 'Avocate - Droit des affaires',
                'hourly_rate' => 150,
                'category' => 'Droit',
                'specializations' => ['Droit des affaires', 'Contrats', 'Droit international'],
                'languages' => ['fr', 'ar'],
                'country' => 'TN',
                'rating' => 4.7,
                'sessions' => 65,
            ],
            [
                'name' => 'Thomas Bernard',
                'email' => 'thomas@skolz.com',
                'bio' => 'Développeur full-stack senior. Expert React, Node.js et architecture cloud.',
                'headline' => 'Développeur Full-Stack Senior',
                'hourly_rate' => 100,
                'category' => 'Technologie',
                'specializations' => ['React', 'Node.js', 'AWS', 'Architecture'],
                'languages' => ['fr', 'en'],
                'country' => 'FR',
                'rating' => 4.9,
                'sessions' => 210,
            ],
            [
                'name' => 'Fatima Zahra',
                'email' => 'fatima@skolz.com',
                'bio' => 'Nutritionniste et coach bien-être. Spécialisée dans les régimes méditerranéens.',
                'headline' => 'Nutritionniste & Coach Bien-être',
                'hourly_rate' => 60,
                'category' => 'Santé',
                'specializations' => ['Nutrition', 'Bien-être', 'Régime méditerranéen'],
                'languages' => ['fr', 'ar'],
                'country' => 'MA',
                'rating' => 4.8,
                'sessions' => 87,
            ],
            [
                'name' => 'Pierre Leclerc',
                'email' => 'pierre@skolz.com',
                'bio' => 'CFO et consultant financier. 15 ans dans la finance d\'entreprise et le private equity.',
                'headline' => 'Consultant Finance & Investissement',
                'hourly_rate' => 200,
                'category' => 'Finance',
                'specializations' => ['Finance d\'entreprise', 'Investissement', 'M&A'],
                'languages' => ['fr', 'en'],
                'country' => 'FR',
                'rating' => 4.6,
                'sessions' => 54,
            ],
        ];

        foreach ($experts as $data) {
            $category = $categories->firstWhere('name', $data['category'])
                ?? $categories->first();

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make('password'),
                'role' => 'expert',
                'country' => $data['country'],
            ]);

            ExpertProfile::create([
                'user_id' => $user->id,
                'category_id' => $category->id,
                'bio' => $data['bio'],
                'headline' => $data['headline'],
                'hourly_rate' => $data['hourly_rate'],
                'status' => 'approved',
                'languages' => $data['languages'],
                'specializations' => $data['specializations'],
                'featured' => true,
                'view_count' => rand(50, 500),
            ]);
        }
    }
}
