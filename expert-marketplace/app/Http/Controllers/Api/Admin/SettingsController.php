<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SettingsController extends Controller
{
    private const SETTINGS_KEY = 'platform_settings';

    public function index()
    {
        return response()->json($this->getSettings());
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'default_commission_rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'maintenance_mode'        => ['sometimes', 'boolean'],
            'registration_enabled'    => ['sometimes', 'boolean'],
            'min_payout_amount'       => ['sometimes', 'numeric', 'min:0'],
            'platform_email'          => ['sometimes', 'email'],
        ]);

        $settings = array_merge($this->getSettings(), $data);
        Cache::forever(self::SETTINGS_KEY, $settings);

        return response()->json($settings);
    }

    private function getSettings(): array
    {
        return Cache::get(self::SETTINGS_KEY, [
            'default_commission_rate' => config('marketplace.default_commission_rate', 18),
            'maintenance_mode'        => false,
            'registration_enabled'    => true,
            'min_payout_amount'       => 50,
            'platform_email'          => 'support@skolz.app',
        ]);
    }
}
