<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('waitlist', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('expert_profile_id')->constrained()->cascadeOnDelete();
            $table->date('preferred_date')->nullable();
            $table->boolean('notified')->default(false);
            $table->timestamps();
            $table->unique(['user_id', 'expert_profile_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waitlist');
    }
};
