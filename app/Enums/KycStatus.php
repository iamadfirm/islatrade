<?php

namespace App\Enums;

enum KycStatus: string
{
    case None = 'none';
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::None => 'Not Submitted',
            default => ucfirst($this->value),
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::None => 'slate',
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
