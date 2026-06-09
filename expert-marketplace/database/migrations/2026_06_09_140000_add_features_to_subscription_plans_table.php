<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->json('features')->nullable()->after('included_sessions_per_month');
            $table->boolean('is_active')->default(true)->after('features');
            $table->string('description')->nullable()->after('name');
            $table->string('currency', 3)->default('EUR')->after('price');
            $table->string('interval')->default('month')->after('currency');
        });
    }

    public function down(): void
    {
        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->dropColumn(['features', 'is_active', 'description', 'currency', 'interval']);
        });
    }
};
