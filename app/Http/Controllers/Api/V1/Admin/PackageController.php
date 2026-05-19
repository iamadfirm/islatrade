<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvestmentPackageResource;
use App\Models\InvestmentPackage;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function index()
    {
        return InvestmentPackageResource::collection(InvestmentPackage::orderBy('min_amount')->get());
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        return new InvestmentPackageResource(InvestmentPackage::create($data));
    }

    public function show(InvestmentPackage $package)
    {
        return new InvestmentPackageResource($package);
    }

    public function update(Request $request, InvestmentPackage $package)
    {
        $data = $this->validateData($request, updating: true);
        $package->update($data);
        return new InvestmentPackageResource($package);
    }

    public function destroy(InvestmentPackage $package)
    {
        $package->delete();
        return response()->json(['message' => 'Deleted.']);
    }

    private function validateData(Request $request, bool $updating = false): array
    {
        $req = $updating ? 'sometimes' : 'required';
        return $request->validate([
            'name' => [$req, 'string', 'max:120'],
            'description' => ['nullable', 'string'],
            'min_amount' => [$req, 'numeric', 'min:1'],
            'max_amount' => ['nullable', 'numeric', 'gte:min_amount'],
            'interest_rate' => [$req, 'numeric', 'min:0'],
            'frequency' => [$req, 'string', 'in:hourly,daily,weekly,monthly'],
            'term_days' => [$req, 'integer', 'min:1'],
            'is_active' => ['boolean'],
            'return_capital' => ['boolean'],
        ]);
    }
}
