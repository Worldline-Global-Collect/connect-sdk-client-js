import type { PaymentContextJSON } from './payment-product';

export type GetIINDetailsRequestJSON = {
  bin: string;
  paymentContext?: PaymentContextJSON;
  accountOnFileId?: number;
};

export type GetIINDetailsResponseJSON = {
  paymentProductId: number;
  countryCode: string;
  coBrands?: IinDetailJSON[];
  isAllowedInContext?: boolean;
};

export type IinDetailJSON = {
  isAllowedInContext: boolean;
  paymentProductId: number;
};
