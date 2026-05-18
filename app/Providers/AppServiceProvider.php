<?php

namespace App\Providers;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Allow same-host SPA requests to be treated as stateful by Sanctum
        // regardless of the host they came in on (LAN IPs, ngrok, etc.).
        // Adds the current request's host to the configured stateful domains.
        if ($this->app->runningInConsole()) {
            return;
        }

        $request = $this->app['request'];
        $host = $request->getHttpHost();
        if (! $host) {
            return;
        }

        $existing = Config::get('sanctum.stateful', []);
        if (! in_array($host, $existing, true)) {
            Config::set('sanctum.stateful', array_values(array_unique([...$existing, $host])));
        }
    }
}
