<?php

namespace App\Enums;

use Illuminate\Support\Carbon;

enum PayoutFrequency: string
{
    case Hourly = 'hourly';
    case Daily = 'daily';
    case Weekly = 'weekly';
    case Monthly = 'monthly';

    /**
     * Approximate interval in days (used for scheduling preview & legacy callers).
     * For sub-day frequencies, returns a fractional-rounded value of 0 — callers
     * advancing the schedule should prefer addInterval().
     */
    public function intervalDays(): int
    {
        return match ($this) {
            self::Hourly => 0,
            self::Daily => 1,
            self::Weekly => 7,
            self::Monthly => 30,
        };
    }

    public function addInterval(Carbon $at): Carbon
    {
        return match ($this) {
            self::Hourly => $at->copy()->addHour(),
            self::Daily => $at->copy()->addDay(),
            self::Weekly => $at->copy()->addWeek(),
            self::Monthly => $at->copy()->addMonth(),
        };
    }

    public function label(): string
    {
        return ucfirst($this->value);
    }
}
