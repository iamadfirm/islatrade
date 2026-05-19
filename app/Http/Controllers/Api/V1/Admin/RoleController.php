<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Support\AdminCapabilities;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    protected const PROTECTED = ['admin', 'user'];

    public function index()
    {
        return Role::with('permissions')->orderBy('name')->get()->map(fn ($r) => $this->present($r));
    }

    public function capabilities()
    {
        return collect(AdminCapabilities::ALL)->map(fn ($label, $key) => [
            'key' => $key,
            'label' => $label,
        ])->values();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:64', 'unique:roles,name'],
            'permissions' => ['array'],
            'permissions.*' => ['string', Rule::in(AdminCapabilities::names())],
        ]);

        $role = Role::create(['name' => $data['name'], 'guard_name' => 'web']);
        $role->syncPermissions($data['permissions'] ?? []);

        return $this->present($role->load('permissions'));
    }

    public function update(Request $request, Role $role)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:64', Rule::unique('roles', 'name')->ignore($role->id)],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['string', Rule::in(AdminCapabilities::names())],
        ]);

        // Don't allow renaming protected roles, but their permissions can be edited freely.
        if (in_array($role->name, self::PROTECTED, true) && isset($data['name']) && $data['name'] !== $role->name) {
            throw ValidationException::withMessages(['name' => "Cannot rename the '{$role->name}' role."]);
        }

        if (isset($data['name'])) {
            $role->name = $data['name'];
            $role->save();
        }

        if (array_key_exists('permissions', $data)) {
            // Guard: admin role must keep all capabilities so the platform stays manageable.
            if ($role->name === 'admin') {
                $role->syncPermissions(AdminCapabilities::names());
            } else {
                $role->syncPermissions($data['permissions']);
            }
        }

        return $this->present($role->fresh('permissions'));
    }

    public function destroy(Role $role)
    {
        if (in_array($role->name, self::PROTECTED, true)) {
            throw ValidationException::withMessages([
                'role' => "Cannot delete the '{$role->name}' role.",
            ]);
        }

        if ($role->users()->exists()) {
            throw ValidationException::withMessages([
                'role' => 'This role is assigned to one or more users. Reassign them first.',
            ]);
        }

        $role->delete();
        return response()->json(['message' => 'Role deleted.']);
    }

    private function present(Role $role): array
    {
        return [
            'id' => $role->id,
            'name' => $role->name,
            'protected' => in_array($role->name, self::PROTECTED, true),
            'permissions' => $role->permissions->pluck('name')->values(),
            'users_count' => $role->users()->count(),
        ];
    }
}
