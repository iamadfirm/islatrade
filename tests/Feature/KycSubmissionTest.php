<?php

namespace Tests\Feature;

use App\Enums\KycStatus;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Models\KycSubmission;
use Tests\TestCase;

class KycSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_approve_flips_user_kyc_status(): void
    {
        $this->seed(RoleSeeder::class);
        $admin = User::factory()->create(); $admin->assignRole('admin');
        $user = User::factory()->create();  $user->assignRole('user');
        $user->forceFill(['kyc_status' => KycStatus::Pending->value])->save();

        $sub = KycSubmission::create([
            'user_id' => $user->id, 'id_type' => 'national_id', 'id_number' => 'X',
            'id_front_path' => 'a', 'selfie_path' => 'b', 'status' => 'pending',
        ]);

        $this->actingAs($admin)
            ->postJson('/api/v1/admin/kyc/'.$sub->uuid.'/approve')
            ->assertOk();

        $this->assertEquals(KycStatus::Approved, $user->fresh()->kyc_status);
    }

    public function test_admin_reject_flips_user_kyc_status(): void
    {
        $this->seed(RoleSeeder::class);
        $admin = User::factory()->create(); $admin->assignRole('admin');
        $user = User::factory()->create();  $user->assignRole('user');
        $user->forceFill(['kyc_status' => KycStatus::Pending->value])->save();

        $sub = KycSubmission::create([
            'user_id' => $user->id, 'id_type' => 'national_id', 'id_number' => 'X',
            'id_front_path' => 'a', 'selfie_path' => 'b', 'status' => 'pending',
        ]);

        $this->actingAs($admin)
            ->postJson('/api/v1/admin/kyc/'.$sub->uuid.'/reject', ['admin_note' => 'blurry'])
            ->assertOk();

        $this->assertEquals(KycStatus::Rejected, $user->fresh()->kyc_status);
    }

    public function test_kyc_submission_updates_user_status_to_pending(): void
    {
        Storage::fake('public');
        $this->seed(RoleSeeder::class);
        $user = User::factory()->create();
        $user->assignRole('user');

        $this->assertEquals(KycStatus::None, $user->fresh()->kyc_status);

        $resp = $this->actingAs($user)->postJson('/api/v1/kyc', [
            'id_type' => 'national_id',
            'id_number' => 'PSN-123456',
            'id_front' => UploadedFile::fake()->image('front.jpg'),
            'selfie' => UploadedFile::fake()->image('selfie.jpg'),
        ]);
        $resp->assertOk();

        $fresh = $user->fresh();
        $this->assertEquals(KycStatus::Pending, $fresh->kyc_status, 'user.kyc_status should be pending after submit');
        $this->assertNotNull($fresh->kyc_submitted_at, 'kyc_submitted_at should be set');
        $this->assertEquals(1, $fresh->kycSubmissions()->count());

        // GET /kyc should show the submission with status pending
        $status = $this->getJson('/api/v1/kyc')->assertOk()->json();
        $this->assertEquals('pending', $status['kyc_status']['value']);
        $this->assertNotNull($status['submission']);
        $this->assertEquals('pending', $status['submission']['status']['value']);
    }
}
