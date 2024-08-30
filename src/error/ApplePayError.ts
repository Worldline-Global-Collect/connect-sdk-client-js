export const ApplePayErrorStatus = {
  Cancelled: 'cancelled',
  ValidateMerchant: 'validateMerchant',
  PaymentAuthorized: 'paymentAuthorized',
} as const;
export type ApplePayErrorStatus =
  (typeof ApplePayErrorStatus)[keyof typeof ApplePayErrorStatus];

export class ApplePayError extends Error {
  constructor(
    readonly message: string,
    readonly status: ApplePayErrorStatus,
  ) {
    super(message);
    Error.captureStackTrace(this, ApplePayError);
  }
}
