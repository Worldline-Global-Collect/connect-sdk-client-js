import type { PaymentDetails } from '../types';

export interface ApplePayPaymentDetails extends PaymentDetails {
  displayName: string;
  acquirerCountry?: string;
  networks: string[];
}

export type ApplePayInitResult = {
  message: string;
  data: ApplePayJS.ApplePayPaymentToken;
};
