<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('expert_id')->constrained('expert_profiles')->cascadeOnDelete();
            $table->dateTime('slot_datetime_start');
            $table->dateTime('slot_datetime_end');
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'])->default('pending');
            $table->decimal('price', 10, 2);
            $table->decimal('commission_amount', 10, 2);
            $table->decimal('expert_payout', 10, 2);
            $table->string('meeting_link')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
