<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expert_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expert_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->string('reason');
            $table->text('details')->nullable();
            $table->enum('status', ['pending', 'reviewed', 'dismissed'])->default('pending');
            $table->timestamps();
            $table->unique(['expert_profile_id', 'reporter_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expert_reports');
    }
};
