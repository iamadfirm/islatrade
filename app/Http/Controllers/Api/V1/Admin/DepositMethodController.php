<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\DepositMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DepositMethodController extends Controller
{
    public function index()
    {
        return DepositMethod::orderBy('sort')->get()->map(fn ($m) => $this->present($m));
    }

    public function update(Request $request, DepositMethod $depositMethod)
    {
        $data = $request->validate([
            'label' => ['sometimes', 'string', 'max:64'],
            'enabled' => ['sometimes', 'boolean'],
            'instructions' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'account_name' => ['sometimes', 'nullable', 'string', 'max:128'],
            'account_number' => ['sometimes', 'nullable', 'string', 'max:64'],
            'sort' => ['sometimes', 'integer', 'min:0', 'max:65000'],
            'image' => ['sometimes', 'image', 'max:5120'],
            'remove_image' => ['sometimes', 'boolean'],
        ]);

        if ($request->boolean('remove_image') && $depositMethod->image_path) {
            Storage::disk('public')->delete($depositMethod->image_path);
            $data['image_path'] = null;
        }

        if ($request->hasFile('image')) {
            if ($depositMethod->image_path) {
                Storage::disk('public')->delete($depositMethod->image_path);
            }
            $data['image_path'] = $request->file('image')->store('deposit-methods', 'public');
        }

        unset($data['image'], $data['remove_image']);

        // Laravel's form-data coerces booleans/integers to strings; cast.
        if (array_key_exists('enabled', $data)) {
            $data['enabled'] = filter_var($data['enabled'], FILTER_VALIDATE_BOOLEAN);
        }

        $depositMethod->update($data);

        return $this->present($depositMethod->fresh());
    }

    private function present(DepositMethod $m): array
    {
        return [
            'id' => $m->id,
            'key' => $m->key,
            'label' => $m->label,
            'enabled' => $m->enabled,
            'instructions' => $m->instructions,
            'account_name' => $m->account_name,
            'account_number' => $m->account_number,
            'image_url' => $m->image_url,
            'sort' => $m->sort,
        ];
    }
}
