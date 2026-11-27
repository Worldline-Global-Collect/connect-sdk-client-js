import type { PaymentDetails } from '../types';

export interface ApplePayPaymentDetails extends PaymentDetails {
  displayName: string;
  acquirerCountry?: string;
  networks: string[];
  recurringPaymentRequest?: ApplePayJS.ApplePayRecurringPaymentRequest;
}

export type ApplePayInitResult = {
  message: string;
  data: ApplePayJS.ApplePayPaymentToken;
};
