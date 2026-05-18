<?php

namespace App\Enums;

enum InvestmentStatus: string
{
    case Active = 'active';
    case Matured = 'matured';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return ucfirst($this->value);
    }

    public function color(): string
    {
        return match ($this) {
            self::Active => 'sky',
            self::Matured => 'emerald',
            self::Cancelled => 'rose',
        };
    }

    public function toArray(): array
    {
        return ['value' => $this->value, 'label' => $this->label(), 'color' => $this->color()];
    }
}
