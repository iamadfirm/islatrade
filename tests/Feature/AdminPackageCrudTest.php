<?php

namespace Tests\Feature;

use App\Models\InvestmentPackage;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPackageCrudTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $this->seed(RoleSeeder::class);
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        return $admin;
    }

    public function test_admin_can_list_packages(): void
    {
        $admin = $this->admin();
        InvestmentPackage::create([
            'name' => 'Starter', 'min_amount' => 100, 'interest_rate' => 1.5,
            'frequency' => 'daily', 'term_days' => 30, 'is_active' => true,
        ]);
        $this->actingAs($admin)
            ->getJson('/api/v1/admin/packages')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Starter');
    }

    public function test_admin_can_create_package(): void
    {
        $admin = $this->admin();
        $this->actingAs($admin)
            ->postJson('/api/v1/admin/packages', [
                'name' => 'Gold Plan',
                'description' => 'Top tier',
                'min_amount' => '500',
                'max_amount' => '10000',
                'interest_rate' => '2.5',
                'frequency' => 'daily',
                'term_days' => '60',
                'is_active' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Gold Plan')
            ->assertJsonPath('data.frequency.value', 'daily');

        $this->assertDatabaseHas('investment_packages', ['name' => 'Gold Plan']);
    }

    public function test_create_validates_required_fields(): void
    {
        $admin = $this->admin();
        $this->actingAs($admin)
            ->postJson('/api/v1/admin/packages', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'min_amount', 'interest_rate', 'frequency', 'term_days']);
    }

    public function test_admin_can_show_package_by_uuid(): void
    {
        $admin = $this->admin();
        $pkg = InvestmentPackage::create([
            'name' => 'Show', 'min_amount' => 100, 'interest_rate' => 1,
            'frequency' => 'weekly', 'term_days' => 7, 'is_active' => true,
        ]);
        $this->actingAs($admin)
            ->getJson('/api/v1/admin/packages/'.$pkg->uuid)
            ->assertOk()
            ->assertJsonPath('data.uuid', $pkg->uuid);
    }

    public function test_admin_can_update_package(): void
    {
        $admin = $this->admin();
        $pkg = InvestmentPackage::create([
            'name' => 'Old', 'min_amount' => 100, 'interest_rate' => 1,
            'frequency' => 'daily', 'term_days' => 10, 'is_active' => true,
        ]);
        $this->actingAs($admin)
            ->putJson('/api/v1/admin/packages/'.$pkg->uuid, [
                'name' => 'New Name', 'interest_rate' => '3.0', 'is_active' => false,
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'New Name')
            ->assertJsonPath('data.is_active', false);
    }

    public function test_admin_can_delete_package(): void
    {
        $admin = $this->admin();
        $pkg = InvestmentPackage::create([
            'name' => 'Doomed', 'min_amount' => 100, 'interest_rate' => 1,
            'frequency' => 'daily', 'term_days' => 10, 'is_active' => true,
        ]);
        $this->actingAs($admin)
            ->deleteJson('/api/v1/admin/packages/'.$pkg->uuid)
            ->assertOk();

        $this->assertSoftDeleted('investment_packages', ['id' => $pkg->id]);
    }

    public function test_non_admin_cannot_manage_packages(): void
    {
        $this->seed(RoleSeeder::class);
        $user = User::factory()->create();
        $user->assignRole('user');
        $this->actingAs($user)
            ->postJson('/api/v1/admin/packages', [
                'name' => 'X', 'min_amount' => 1, 'interest_rate' => 1,
                'frequency' => 'daily', 'term_days' => 1,
            ])
            ->assertForbidden();
    }
}
