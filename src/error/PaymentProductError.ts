import type { PaymentProductJSON } from '../types';

export class PaymentProductError extends Error {
  constructor(
    message: string,
    readonly json: PaymentProductJSON,
  ) {
    super(message);
  }
}
