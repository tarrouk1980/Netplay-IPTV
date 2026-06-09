<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gift_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 16)->unique();
            $table->foreignId('purchaser_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('expert_profile_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 8, 2);
            $table->string('currency', 3)->default('EUR');
            $table->string('recipient_email')->nullable();
            $table->string('recipient_name')->nullable();
            $table->string('message')->nullable();
            $table->boolean('redeemed')->default(false);
            $table->foreignId('redeemed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('redeemed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gift_codes');
    }
};
