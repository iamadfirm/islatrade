<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    private function user(array $attrs = []): User
    {
        $this->seed(RoleSeeder::class);
        $u = User::factory()->create($attrs + ['password' => Hash::make('oldpass1!')]);
        $u->assignRole('user');
        return $u;
    }

    public function test_update_profile_fields(): void
    {
        $u = $this->user(['name' => 'Old', 'email' => 'old@x.com', 'phone' => '09111111111']);

        $this->actingAs($u)
            ->putJson('/api/v1/profile', [
                'name' => 'New Name',
                'email' => 'new@x.com',
                'phone' => '09222222222',
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'New Name')
            ->assertJsonPath('data.email', 'new@x.com')
            ->assertJsonPath('data.phone', '09222222222');
    }

    public function test_phone_uniqueness_excludes_self(): void
    {
        $u = $this->user(['phone' => '09111111111']);
        $other = $this->user(['phone' => '09222222222']);

        $this->actingAs($u)
            ->putJson('/api/v1/profile', ['name' => 'X', 'phone' => '09111111111'])
            ->assertOk();

        $this->actingAs($u)
            ->putJson('/api/v1/profile', ['name' => 'X', 'phone' => '09222222222'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    public function test_change_password_requires_current(): void
    {
        $u = $this->user();

        $this->actingAs($u)
            ->putJson('/api/v1/profile/password', [
                'current_password' => 'wrong',
                'password' => 'newpass1!',
                'password_confirmation' => 'newpass1!',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);

        $this->actingAs($u)
            ->putJson('/api/v1/profile/password', [
                'current_password' => 'oldpass1!',
                'password' => 'newpass1!',
                'password_confirmation' => 'newpass1!',
            ])
            ->assertOk();

        $this->assertTrue(Hash::check('newpass1!', $u->fresh()->password));
    }

    public function test_upload_avatar(): void
    {
        Storage::fake('public');
        $u = $this->user();

        $this->actingAs($u)
            ->postJson('/api/v1/profile/avatar', [
                'avatar' => UploadedFile::fake()->image('me.jpg'),
            ])
            ->assertOk()
            ->assertJsonPath('data.avatar_url', fn ($v) => is_string($v) && str_contains($v, '/storage/avatars/'));

        $this->assertNotNull($u->fresh()->avatar_path);
        Storage::disk('public')->assertExists($u->fresh()->avatar_path);
    }

    public function test_upload_avatar_replaces_old_file(): void
    {
        Storage::fake('public');
        $u = $this->user();

        $this->actingAs($u)->postJson('/api/v1/profile/avatar', [
            'avatar' => UploadedFile::fake()->image('a.jpg'),
        ])->assertOk();
        $first = $u->fresh()->avatar_path;

        $this->actingAs($u)->postJson('/api/v1/profile/avatar', [
            'avatar' => UploadedFile::fake()->image('b.jpg'),
        ])->assertOk();
        $second = $u->fresh()->avatar_path;

        $this->assertNotEquals($first, $second);
        Storage::disk('public')->assertMissing($first);
        Storage::disk('public')->assertExists($second);
    }

    public function test_delete_avatar(): void
    {
        Storage::fake('public');
        $u = $this->user();

        $this->actingAs($u)->postJson('/api/v1/profile/avatar', [
            'avatar' => UploadedFile::fake()->image('me.jpg'),
        ])->assertOk();
        $path = $u->fresh()->avatar_path;

        $this->actingAs($u)->deleteJson('/api/v1/profile/avatar')
            ->assertOk()
            ->assertJsonPath('data.avatar_url', null);

        $this->assertNull($u->fresh()->avatar_path);
        Storage::disk('public')->assertMissing($path);
    }
}
