export type PaymentProductSessionContext = {
  displayName: string;
  domainName: string;
  validationURL: string;
};

export type PaymentProductSpecificInputs = {
  bancontact?: BancontactSpecificInput;
  applePay?: ApplePaySpecificInput;
  googlePay?: GooglePaySpecificInput;
};

export type BancontactSpecificInput = {
  forceBasicFlow: boolean;
};

export type ApplePaySpecificInput = {
  merchantName: string;
  acquirerCountry?: string;
};

export type GooglePaySpecificInput = {
  merchantId: string;
  gatewayMerchantId: string;
  merchantName?: string;
};

export type PaymentDetails = {
  totalAmount: number;
  countryCode: string;
  isRecurring: boolean;
  currency: string;
  locale?: string;
  isInstallments?: boolean;
  accountOnFileId?: number;
  environment?: string | 'PROD';
};

export type SessionDetails = {
  clientSessionId: string;
  assetUrl: string;
  clientApiUrl: string;
  customerId: string;
};
