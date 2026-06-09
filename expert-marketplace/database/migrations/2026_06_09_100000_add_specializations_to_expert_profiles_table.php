<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expert_profiles', function (Blueprint $table) {
            $table->json('specializations')->nullable()->after('languages');
            $table->string('headline')->nullable()->after('bio');
            $table->string('website_url')->nullable()->after('headline');
            $table->string('linkedin_url')->nullable()->after('website_url');
        });
    }

    public function down(): void
    {
        Schema::table('expert_profiles', function (Blueprint $table) {
            $table->dropColumn(['specializations', 'headline', 'website_url', 'linkedin_url']);
        });
    }
};
