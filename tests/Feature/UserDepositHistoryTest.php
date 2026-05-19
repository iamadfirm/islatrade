<?php

namespace Tests\Feature;

use App\Models\Deposit;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserDepositHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_deposit_history_includes_rejected(): void
    {
        $this->seed(RoleSeeder::class);
        $user = User::factory()->create();
        $user->assignRole('user');

        Deposit::create(['user_id'=>$user->id,'amount'=>100,'method'=>'bank','proof_path'=>'a','status'=>'pending']);
        $rejected = Deposit::create(['user_id'=>$user->id,'amount'=>200,'method'=>'gcash','proof_path'=>'b','status'=>'rejected','admin_note'=>'bad proof']);
        Deposit::create(['user_id'=>$user->id,'amount'=>300,'method'=>'maya','proof_path'=>'c','status'=>'approved']);

        $resp = $this->actingAs($user)->getJson('/api/v1/deposits')->assertOk();
        $statuses = collect($resp->json('data'))->pluck('status.value')->all();

        $this->assertContains('rejected', $statuses, 'rejected deposit missing from user history');
        $this->assertContains('pending', $statuses);
        $this->assertContains('approved', $statuses);

        $this->assertEquals(
            'bad proof',
            collect($resp->json('data'))->firstWhere('uuid', $rejected->uuid)['admin_note']
        );
    }
}
