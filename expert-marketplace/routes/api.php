<?php

use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\ExpertProfileModerationController;
use App\Http\Controllers\Api\Admin\SubscriptionPlanController as AdminSubscriptionPlanController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AvailabilitySlotController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ExpertProfileController;
use App\Http\Controllers\Api\ExpertBlockedDateController;
use App\Http\Controllers\Api\ExpertPortfolioItemController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\StripeConnectController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\ExpertReportController;
use App\Http\Controllers\Api\SubscriptionPlanController;
use App\Http\Controllers\Api\StripeWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/experts', [ExpertProfileController::class, 'index']);
Route::get('/experts/{expertProfile}', [ExpertProfileController::class, 'show']);
Route::get('/experts/{expertProfile}/portfolio', [ExpertPortfolioItemController::class, 'index']);
Route::get('/experts/{expertProfile}/similar', [ExpertProfileController::class, 'similar']);
Route::get('/experts/{expertProfile}/blocked-dates', [ExpertBlockedDateController::class, 'index']);
Route::get('/availability-slots', [AvailabilitySlotController::class, 'index']);
Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/subscription-plans', [SubscriptionPlanController::class, 'index']);

Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);
Route::post('/coupons/validate', [CouponController::class, 'validate']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/me', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    Route::post('/experts', [ExpertProfileController::class, 'store']);
    Route::patch('/experts/{expertProfile}', [ExpertProfileController::class, 'update']);

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/experts/{expertProfile}/favorite', [FavoriteController::class, 'store']);
    Route::delete('/experts/{expertProfile}/favorite', [FavoriteController::class, 'destroy']);

    Route::middleware('role:expert')->group(function () {
        Route::post('/availability-slots', [AvailabilitySlotController::class, 'store']);
        Route::delete('/availability-slots/{availabilitySlot}', [AvailabilitySlotController::class, 'destroy']);
        Route::post('/stripe/connect/onboard', [StripeConnectController::class, 'onboard']);
        Route::get('/stripe/connect/status', [StripeConnectController::class, 'status']);
        Route::get('/expert/stats', [ExpertProfileController::class, 'stats']);
        Route::get('/expert/earnings', [ExpertProfileController::class, 'earnings']);
        Route::post('/expert/portfolio', [ExpertPortfolioItemController::class, 'store']);
        Route::delete('/expert/portfolio/{expertPortfolioItem}', [ExpertPortfolioItemController::class, 'destroy']);
        Route::post('/expert/blocked-dates', [ExpertBlockedDateController::class, 'store']);
        Route::delete('/expert/blocked-dates/{expertBlockedDate}', [ExpertBlockedDateController::class, 'destroy']);
    });

    Route::post('/bookings/{booking}/checkout', [PaymentController::class, 'checkout']);
    Route::post('/bookings/{booking}/review', [ReviewController::class, 'store']);
    Route::post('/reviews/{review}/reply', [ReviewController::class, 'reply']);
    Route::post('/bookings/{booking}/complete', [BookingController::class, 'complete']);
    Route::patch('/bookings/{booking}/meeting-link', [BookingController::class, 'setMeetingLink']);

    Route::get('/bookings/{booking}/messages', [MessageController::class, 'index']);
    Route::post('/bookings/{booking}/messages', [MessageController::class, 'store']);

    Route::post('/experts/{expertProfile}/report', [ExpertReportController::class, 'store']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);

    Route::get('/subscriptions', [SubscriptionController::class, 'index']);
    Route::post('/subscriptions/checkout', [SubscriptionController::class, 'checkout']);
    Route::post('/subscriptions/{subscription}/cancel', [SubscriptionController::class, 'cancel']);

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::get('/bookings/{booking}/ics', [BookingController::class, 'downloadIcs']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    Route::post('/bookings/{booking}/reschedule', [BookingController::class, 'reschedule']);

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\Api\Admin\StatsController::class, 'index']);

        Route::get('/expert-profiles', [ExpertProfileModerationController::class, 'index']);
        Route::patch('/expert-profiles/{expertProfile}', [ExpertProfileModerationController::class, 'update']);

        Route::post('/categories', [AdminCategoryController::class, 'store']);
        Route::patch('/categories/{category}', [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);

        Route::get('/coupons', [\App\Http\Controllers\Api\Admin\CouponAdminController::class, 'index']);
        Route::post('/coupons', [\App\Http\Controllers\Api\Admin\CouponAdminController::class, 'store']);
        Route::delete('/coupons/{coupon}', [\App\Http\Controllers\Api\Admin\CouponAdminController::class, 'destroy']);

        Route::post('/subscription-plans', [AdminSubscriptionPlanController::class, 'store']);
        Route::patch('/subscription-plans/{subscriptionPlan}', [AdminSubscriptionPlanController::class, 'update']);
        Route::delete('/subscription-plans/{subscriptionPlan}', [AdminSubscriptionPlanController::class, 'destroy']);
    });
});
