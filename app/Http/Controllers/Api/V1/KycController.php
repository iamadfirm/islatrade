<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\KycStatus;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class KycController extends Controller
{
    public function status(Request $request)
    {
        $latest = $request->user()->kycSubmissions()->first();
        return response()->json([
            'kyc_status' => $request->user()->kyc_status->toArray(),
            'submission' => $latest ? [
                'uuid' => $latest->uuid,
                'status' => $latest->status->toArray(),
                'admin_note' => $latest->admin_note,
                'created_at' => $latest->created_at,
            ] : null,
        ]);
    }

    public function submit(Request $request)
    {
        $data = $request->validate([
            'id_type' => ['required', 'string', 'in:passport,drivers_license,national_id,umid,sss,prc'],
            'id_number' => ['required', 'string', 'max:64'],
            'id_front' => ['required', 'image', 'max:5120'],
            'id_back' => ['nullable', 'image', 'max:5120'],
            'selfie' => ['required', 'image', 'max:5120'],
        ]);

        $front = $request->file('id_front')->store('kyc', 'public');
        $back = $request->file('id_back')?->store('kyc', 'public');
        $selfie = $request->file('selfie')->store('kyc', 'public');

        $user = $request->user();
        $submission = $user->kycSubmissions()->create([
            'id_type' => $data['id_type'],
            'id_number' => $data['id_number'],
            'id_front_path' => $front,
            'id_back_path' => $back,
            'selfie_path' => $selfie,
            'status' => 'pending',
        ]);

        $user->update([
            'kyc_status' => KycStatus::Pending,
            'kyc_submitted_at' => now(),
        ]);

        return response()->json([
            'message' => 'KYC submitted for review.',
            'submission_uuid' => $submission->uuid,
        ]);
    }
}
