<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('partnership:process-payouts')->hourly()->withoutOverlapping();
