<?php

namespace App\Enums;

enum WalletTxType: string
{
    case Deposit = 'deposit';
    case Withdrawal = 'withdrawal';
    case WithdrawalRefund = 'withdrawal_refund';
    case TransferIn = 'transfer_in';
    case TransferOut = 'transfer_out';
    case InvestmentLock = 'investment_lock';
    case InvestmentPayout = 'investment_payout';
    case InvestmentReturn = 'investment_return';
    case AdminAdjustment = 'admin_adjustment';

    public function isCredit(): bool
    {
        return in_array($this, [
            self::Deposit,
            self::WithdrawalRefund,
            self::TransferIn,
            self::InvestmentPayout,
            self::InvestmentReturn,
        ], true);
    }

    public function label(): string
    {
        return str_replace('_', ' ', ucfirst($this->value));
    }
}
