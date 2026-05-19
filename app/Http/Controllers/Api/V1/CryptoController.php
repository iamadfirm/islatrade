<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class CryptoController extends Controller
{
    private const BASE = 'https://api.coingecko.com/api/v3';

    public function prices(Request $request)
    {
        $ids = $this->cleanIds($request->string('ids')->toString());
        if (! $ids) {
            return response()->json(['message' => 'ids required'], 422);
        }

        $key = "crypto:prices:{$ids}";

        $data = Cache::remember($key, now()->addSeconds(45), function () use ($ids) {
            $res = Http::timeout(8)->retry(1, 250)->get(self::BASE.'/simple/price', [
                'ids' => $ids,
                'vs_currencies' => 'usd',
                'include_24hr_change' => 'true',
                'include_market_cap' => 'true',
            ]);
            return $res->successful() ? $res->json() : null;
        });

        if ($data === null) {
            return response()->json(['message' => 'Market data unavailable.'], 503);
        }

        return response()->json($data);
    }

    public function chart(Request $request, string $coin)
    {
        $coin = preg_replace('/[^a-z0-9-]/', '', strtolower($coin));
        $days = (int) $request->integer('days', 7);
        $days = max(1, min(365, $days));

        $key = "crypto:chart:{$coin}:{$days}";

        $data = Cache::remember($key, now()->addSeconds(90), function () use ($coin, $days) {
            $res = Http::timeout(10)->retry(1, 250)->get(self::BASE."/coins/{$coin}/market_chart", [
                'vs_currency' => 'usd',
                'days' => $days,
            ]);
            return $res->successful() ? $res->json() : null;
        });

        if ($data === null) {
            return response()->json(['message' => 'Market data unavailable.'], 503);
        }

        return response()->json($data);
    }

    private function cleanIds(string $raw): string
    {
        $parts = array_filter(array_map(
            fn ($s) => preg_replace('/[^a-z0-9-]/', '', strtolower(trim($s))),
            explode(',', $raw)
        ));
        // cap to 10 ids to keep cache keys bounded
        return implode(',', array_slice(array_unique($parts), 0, 10));
    }
}
