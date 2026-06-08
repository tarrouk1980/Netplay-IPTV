<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expert_blocked_dates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expert_profile_id')->constrained()->cascadeOnDelete();
            $table->date('blocked_date');
            $table->string('reason')->nullable();
            $table->timestamps();
            $table->unique(['expert_profile_id', 'blocked_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expert_blocked_dates');
    }
};
