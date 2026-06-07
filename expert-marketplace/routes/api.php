<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AvailabilitySlotController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ExpertProfileController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\StripeConnectController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\SubscriptionPlanController;
use App\Http\Controllers\Api\StripeWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/experts', [ExpertProfileController::class, 'index']);
Route::get('/experts/{expertProfile}', [ExpertProfileController::class, 'show']);
Route::get('/availability-slots', [AvailabilitySlotController::class, 'index']);
Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/subscription-plans', [SubscriptionPlanController::class, 'index']);

Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::post('/experts', [ExpertProfileController::class, 'store']);
    Route::patch('/experts/{expertProfile}', [ExpertProfileController::class, 'update']);

    Route::middleware('role:expert')->group(function () {
        Route::post('/availability-slots', [AvailabilitySlotController::class, 'store']);
        Route::delete('/availability-slots/{availabilitySlot}', [AvailabilitySlotController::class, 'destroy']);
        Route::post('/stripe/connect/onboard', [StripeConnectController::class, 'onboard']);
        Route::get('/stripe/connect/status', [StripeConnectController::class, 'status']);
    });

    Route::post('/bookings/{booking}/checkout', [PaymentController::class, 'checkout']);
    Route::post('/bookings/{booking}/review', [ReviewController::class, 'store']);

    Route::get('/subscriptions', [SubscriptionController::class, 'index']);
    Route::post('/subscriptions/checkout', [SubscriptionController::class, 'checkout']);
    Route::post('/subscriptions/{subscription}/cancel', [SubscriptionController::class, 'cancel']);

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
});
