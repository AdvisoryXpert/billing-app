<?php

namespace App\Support;

use App\Models\Tenant;

class Tenancy
{
    public ?Tenant $current = null;

    public function set(?Tenant $t): void { $this->current = $t; }
    public function id(): ?int { return $this->current?->id; }
    public function tenant(): ?Tenant { return $this->current; }
}
