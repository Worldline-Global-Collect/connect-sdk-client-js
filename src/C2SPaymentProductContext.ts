import type { PaymentDetails } from './types';

export class C2SPaymentProductContext {
  readonly totalAmount: number;
  readonly countryCode: string;
  readonly isRecurring: boolean;
  readonly currency: string;
  readonly locale?: string;
  readonly isInstallments: boolean;
  readonly accountOnFileId?: number;
  readonly environment?: string | 'PROD';

  constructor(payload: PaymentDetails) {
    this.totalAmount = payload.totalAmount;
    this.countryCode = payload.countryCode;
    this.isRecurring = payload.isRecurring;
    this.currency = payload.currency;
    this.locale = payload.locale;
    this.isInstallments = payload.isInstallments || false;
    this.accountOnFileId = payload.accountOnFileId;
    this.environment = payload.environment;
  }
}
