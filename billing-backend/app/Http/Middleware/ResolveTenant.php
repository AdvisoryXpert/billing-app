<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Tenant;
use App\Support\Tenancy;

class ResolveTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1) Header wins
        $slug = trim((string) $request->header('X-Tenant', ''));

        // 2) Otherwise derive from subdomain like acme.example.com -> "acme"
        if ($slug === '') {
            $host = $request->getHost();               // e.g., acme.localhost or acme.example.com
            $parts = explode('.', $host);
            if (count($parts) >= 3) {                  // crude: subdomain.domain.tld
                $slug = $parts[0];
            } elseif (count($parts) === 2 && $parts[0] !== 'www') {
                $slug = $parts[0];                     // subdomain.local (dev)
            }
        }

        // (POC-friendly) fallback to 'default' if nothing provided
        if ($slug === '') {
            $slug = 'default';
        }

        // Normalize slug a bit
        $slug = strtolower(preg_replace('/[^a-z0-9\-]/', '-', $slug));

        $tenant = Tenant::where('slug', $slug)->first();

        // Store (or null if not found)
        app(Tenancy::class)->set($tenant);

        return $next($request);
    }
}
