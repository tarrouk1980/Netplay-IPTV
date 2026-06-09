<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->enum('type', ['percent', 'fixed'])->default('percent');
            $table->decimal('value', 8, 2);
            $table->integer('max_uses')->nullable();
            $table->integer('used_count')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->string('coupon_code')->nullable()->after('expert_payout');
            $table->decimal('discount_amount', 8, 2)->default(0)->after('coupon_code');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['coupon_code', 'discount_amount']);
        });
        Schema::dropIfExists('coupons');
    }
};
