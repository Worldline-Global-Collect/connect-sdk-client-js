import type { PaymentProductJSON } from '../types';
import { captureStackTrace } from '../utils/captureStackTrace';

export class PaymentProductError extends Error {
  constructor(
    message: string,
    readonly json: PaymentProductJSON,
  ) {
    super(message);
    captureStackTrace(this, PaymentProductError);
  }
}
