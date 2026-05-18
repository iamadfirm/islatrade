<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\KycStatus;
use App\Enums\Status;
use App\Http\Controllers\Controller;
use App\Models\KycSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class KycController extends Controller
{
    public function index(Request $request)
    {
        $q = KycSubmission::with('user')->latest();
        if ($status = $request->string('status')->toString()) {
            $q->where('status', $status);
        }
        return response()->json([
            'data' => $q->paginate(20)->through(fn (KycSubmission $s) => [
                'uuid' => $s->uuid,
                'id_type' => $s->id_type,
                'id_number' => $s->id_number,
                'id_front_url' => Storage::url($s->id_front_path),
                'id_back_url' => $s->id_back_path ? Storage::url($s->id_back_path) : null,
                'selfie_url' => Storage::url($s->selfie_path),
                'status' => $s->status->toArray(),
                'admin_note' => $s->admin_note,
                'created_at' => $s->created_at,
                'user' => ['uuid' => $s->user->uuid, 'name' => $s->user->name, 'phone' => $s->user->phone],
            ]),
        ]);
    }

    public function approve(Request $request, KycSubmission $submission)
    {
        abort_unless($submission->status === Status::Pending, 422, 'Already reviewed.');
        DB::transaction(function () use ($submission, $request) {
            $submission->update([
                'status' => Status::Approved,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);
            $submission->user->update(['kyc_status' => KycStatus::Approved]);
        });
        return response()->json(['message' => 'Approved.']);
    }

    public function reject(Request $request, KycSubmission $submission)
    {
        abort_unless($submission->status === Status::Pending, 422, 'Already reviewed.');
        $data = $request->validate(['admin_note' => ['required', 'string', 'max:255']]);
        DB::transaction(function () use ($submission, $request, $data) {
            $submission->update([
                'status' => Status::Rejected,
                'admin_note' => $data['admin_note'],
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);
            $submission->user->update(['kyc_status' => KycStatus::Rejected]);
        });
        return response()->json(['message' => 'Rejected.']);
    }
}
