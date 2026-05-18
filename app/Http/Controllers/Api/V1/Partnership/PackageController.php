<?php

namespace App\Http\Controllers\Api\V1\Partnership;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvestmentPackageResource;
use App\Models\InvestmentPackage;

class PackageController extends Controller
{
    public function index()
    {
        return InvestmentPackageResource::collection(
            InvestmentPackage::where('is_active', true)->orderBy('min_amount')->get()
        );
    }

    public function show(InvestmentPackage $package)
    {
        return new InvestmentPackageResource($package);
    }
}
