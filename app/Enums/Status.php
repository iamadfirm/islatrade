<?php

namespace App\Enums;

enum Status: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';

    public function label(): string
    {
        return ucfirst($this->value);
    }

    public function color(): string
    {
        return match ($this) {
            self::Pending => 'amber',
            self::Approved => 'emerald',
            self::Rejected => 'rose',
        };
    }

    public function toArray(): array
    {
        return ['value' => $this->value, 'label' => $this->label(), 'color' => $this->color()];
    }
}
