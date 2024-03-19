export const IinDetailsStatus = {
  SUPPORTED: 'SUPPORTED',
  EXISTING_BUT_NOT_ALLOWED: 'EXISTING_BUT_NOT_ALLOWED',
  UNSUPPORTED: 'UNSUPPORTED',
  UNKNOWN: 'UNKNOWN',
  NOT_ENOUGH_DIGITS: 'NOT_ENOUGH_DIGITS',
} as const;

export type IinDetailsStatus =
  (typeof IinDetailsStatus)[keyof typeof IinDetailsStatus];

export type ConvertAmountJSON = {
  convertedAmount: number;
};

export type ThirdPartyStatusResponseJSON = {
  thirdPartyStatus: string;
};

export type GetPrivacyPolicyResponseJSON = {
  htmlContent: string;
};

export type GetPrivacyPolicyOptions = {
  locale?: string;
  paymentProductId?: number;
};
