import type { PaymentRequest } from '../PaymentRequest';
import type { PaymentProductFieldValidatorsJSON } from './payment-product';

export type ValidationError = {
  fieldId: string;
  errorMessageId: string;
};

export type ValidationRule = {
  readonly json: ValidationRuleDefinition<unknown>;
  readonly type: ValidationRuleType | string;
  readonly errorMessageId: string;

  validate(value: string): boolean;
  validateValue(request: PaymentRequest, fieldId: string): boolean;
};

export type ValidationRuleType = keyof PaymentProductFieldValidatorsJSON;

export type ValidationRuleDefinition<T> = {
  readonly type: string;
  readonly attributes: T;
};

export type BoletoBancarioRequirednessValidatorJSON = {
  fiscalNumberLength: number;
};

export type EmptyValidatorJSON = Record<string, never>;

export type FixedListValidatorJSON = {
  allowedValues: string[];
};

export type LengthValidatorJSON = {
  minLength: number;
  maxLength: number;
};

export type RangeValidatorJSON = {
  minValue: number;
  maxValue: number;
};

export type RegularExpressionValidatorJSON = {
  regularExpression: string;
};
