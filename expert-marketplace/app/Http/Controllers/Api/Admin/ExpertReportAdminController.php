<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExpertReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpertReportAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $reports = ExpertReport::with([
            'expertProfile.user:id,name',
            'reporter:id,name',
        ])->orderByDesc('created_at')->get();

        return response()->json($reports);
    }

    public function update(Request $request, ExpertReport $expertReport): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:pending,reviewed,dismissed']]);
        $expertReport->update($data);
        return response()->json($expertReport);
    }
}
