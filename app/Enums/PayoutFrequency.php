<?php

namespace App\Enums;

enum PayoutFrequency: string
{
    case Daily = 'daily';
    case Weekly = 'weekly';
    case Monthly = 'monthly';

    public function intervalDays(): int
    {
        return match ($this) {
            self::Daily => 1,
            self::Weekly => 7,
            self::Monthly => 30,
        };
    }

    public function label(): string
    {
        return ucfirst($this->value);
    }
}
