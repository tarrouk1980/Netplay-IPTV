<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('availability_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expert_id')->constrained('expert_profiles')->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week')->nullable();
            $table->date('specific_date')->nullable();
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_recurring')->default(true);
            $table->string('timezone')->default('Africa/Tunis');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('availability_slots');
    }
};
