<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expert_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained();
            $table->text('bio')->nullable();
            $table->unsignedSmallInteger('years_experience')->nullable();
            $table->decimal('hourly_rate', 10, 2);
            $table->string('currency', 3)->default('TND');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->decimal('commission_rate', 5, 2)->default(15.00);
            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->unsignedInteger('total_sessions')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expert_profiles');
    }
};
