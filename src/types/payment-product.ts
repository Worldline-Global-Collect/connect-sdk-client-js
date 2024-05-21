import type {
  BoletoBancarioRequirednessValidatorJSON,
  EmptyValidatorJSON,
  FixedListValidatorJSON,
  LengthValidatorJSON,
  RangeValidatorJSON,
  RegularExpressionValidatorJSON,
} from './validation';

export type AmountOfMoneyJSON = {
  amount: number;
  currencyCode: string;
};

// @todo: in the end we should get rid of `PaymentProductContext`
// and replace this with `PaymentContext`
export type PaymentContext = {
  amountOfMoney: AmountOfMoneyJSON;
  countryCode: string;
  isRecurring?: boolean;
  locale?: string;
};

// @todo: this type seems redundant with `PaymentContext`= ,
//  except it also contains `isInstallments` and missing `locale`
export type PaymentContextJSON = {
  amountOfMoney: AmountOfMoneyJSON;
  countryCode: string;
  isInstallments?: boolean;
  isRecurring?: boolean;
};

export type PaymentProductContext = {
  totalAmount: number;
  countryCode: string;
  isRecurring: boolean;
  currency: string;
  isInstallments: boolean;
  accountOnFileId?: number;
  environment?: 'TEST' | 'PROD' | (string & Record<never, never>);
  locale?: string;
};

export type MobilePaymentProductSession302SpecificInputJSON = {
  displayName?: string;
  domainName?: string;
  validationUrl?: string;
};

export type MobilePaymentProductSession302SpecificOutputJSON = {
  sessionObject: string;
};

export interface PaymentProductJSON extends BasicPaymentProductJSON {
  fields?: PaymentProductFieldJSON[];
  fieldsWarning?: string;
}

export type PaymentProductDisplayHintsJSON = {
  displayOrder: number;
  label?: string;
  logo: string;
};

export type PaymentProduct302SpecificDataJSON = {
  networks: string[];
};

export type PaymentProduct320SpecificDataJSON = {
  gateway: string;
  networks: string[];
};

export type PaymentProduct863SpecificDataJSON = {
  integrationTypes: string[];
};

export type PaymentProductFieldJSON = {
  dataRestrictions?: PaymentProductFieldDataRestrictionsJSON;
  displayHints?: PaymentProductFieldDisplayHintsJSON;
  id: string;
  type: string;
  usedForLookup?: boolean;
  // added by the SDK
  validators?: string[];
};

export type PaymentProductFieldDataRestrictionsJSON = {
  isRequired: boolean;
  validators: PaymentProductFieldValidatorsJSON;
};

export type PaymentProductFieldDisplayElementJSON = {
  id: string;
  label?: string;
  type: string;
  value: string;
};

export type PaymentProductFieldDisplayHintsJSON = {
  alwaysShow: boolean;
  displayOrder: number;
  formElement: PaymentProductFieldFormElementJSON;
  label?: string;
  link?: string;
  mask?: string;
  obfuscate: boolean;
  placeholderLabel?: string;
  preferredInputType?: string;
  tooltip?: PaymentProductFieldTooltipJSON;
};

export type PaymentProductFieldFormElementJSON = {
  type: string;
  valueMapping?: ValueMappingElementJSON[];
  // added by the SDK
  list?: boolean;
};

export type PaymentProductFieldTooltipJSON = {
  image?: string;
  label?: string;
};

export type PaymentProductFieldValidatorsJSON = {
  boletoBancarioRequiredness?: BoletoBancarioRequirednessValidatorJSON;
  emailAddress?: EmptyValidatorJSON;
  expirationDate?: EmptyValidatorJSON;
  fixedList?: FixedListValidatorJSON;
  iban?: EmptyValidatorJSON;
  length?: LengthValidatorJSON;
  luhn?: EmptyValidatorJSON;
  range?: RangeValidatorJSON;
  regularExpression?: RegularExpressionValidatorJSON;
  residentIdNumber?: EmptyValidatorJSON;
  termsAndConditions?: EmptyValidatorJSON;
};

export type BasicPaymentProductJSON = {
  accountsOnFile?: AccountOnFileJSON[];
  acquirerCountry?: string;
  allowsInstallments: boolean;
  allowsRecurring: boolean;
  allowsTokenization: boolean;
  authenticationIndicator?: AuthenticationIndicatorJSON;
  autoTokenized: boolean;
  canBeIframed?: boolean;
  deviceFingerprintEnabled: boolean;
  displayHints: PaymentProductDisplayHintsJSON;
  id: number;
  isJavaScriptRequired?: boolean;
  maxAmount?: number;
  minAmount?: number;
  mobileIntegrationLevel: string;
  paymentMethod: string;
  paymentProduct302SpecificData?: PaymentProduct302SpecificDataJSON;
  paymentProduct320SpecificData?: PaymentProduct320SpecificDataJSON;
  paymentProduct863SpecificData?: PaymentProduct863SpecificDataJSON;
  paymentProductGroup?: string;
  supportsMandates?: boolean;
  usesRedirectionTo3rdParty: boolean;
  // added by the SDK
  type?: 'product';
};

export type BasicPaymentProductGroupJSON = {
  accountsOnFile?: AccountOnFileJSON[];
  allowsInstallments: boolean;
  deviceFingerprintEnabled: boolean;
  displayHints: PaymentProductDisplayHintsJSON;
  id: string;
  // added by the SDK
  type?: 'group';
};

export type CreatePaymentProductSessionRequestJSON = {
  paymentProductSession302SpecificInput?: MobilePaymentProductSession302SpecificInputJSON;
};

export type CreatePaymentProductSessionResponseJSON = {
  paymentProductSession302SpecificOutput?: MobilePaymentProductSession302SpecificOutputJSON;
};

export interface PaymentProductGroupJSON extends BasicPaymentProductGroupJSON {
  fields: PaymentProductFieldJSON[];
}

export type PaymentProductGroupsJSON = {
  paymentProductGroups: BasicPaymentProductGroupJSON[];
};

export type PaymentProductNetworksResponseJSON = {
  networks: string[];
};

export type PaymentProductsJSON = {
  paymentProducts: BasicPaymentProductJSON[];
};

export type ValueMappingElementJSON = {
  displayElements: PaymentProductFieldDisplayElementJSON[];
  displayName?: string;
  value: string;
};

export type AccountOnFileJSON = {
  attributes: AccountOnFileAttributeJSON[];
  displayHints: AccountOnFileDisplayHintsJSON;
  id: number;
  paymentProductId: number;
};

export interface AccountOnFileAttributeJSON extends KeyValuePairJSON {
  mustWriteReason?: string;
  status: string;
}

export type AccountOnFileDisplayHintsJSON = {
  labelTemplate: LabelTemplateElementJSON[];
  logo: string;
};

export type AuthenticationIndicatorJSON = {
  name: string;
  value: string;
};

export type DirectoryJSON = {
  entries: DirectoryEntryJSON[];
};

export type DirectoryEntryJSON = {
  countryNames?: string[];
  issuerId: string;
  issuerList?: string;
  issuerName: string;
};

export type KeyValuePairJSON = {
  key: string;
  value: string;
};

export type LabelTemplateElementJSON = {
  attributeKey: string;
  mask: string;
};
