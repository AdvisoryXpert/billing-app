<?php

if (!function_exists('tenant')) {
    function tenant(): \App\Support\Tenancy {
        return app(\App\Support\Tenancy::class);
    }
}
