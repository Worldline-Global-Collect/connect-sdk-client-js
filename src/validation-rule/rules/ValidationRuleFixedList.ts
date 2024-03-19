import type {
  FixedListValidatorJSON,
  ValidationRule,
  ValidationRuleDefinition,
} from '../../types';
import type { PaymentRequest } from '../../PaymentRequest';

export class ValidationRuleFixedList implements ValidationRule {
  readonly type: string;
  readonly errorMessageId: string;
  readonly allowedValues: string[];

  constructor(readonly json: ValidationRuleDefinition<FixedListValidatorJSON>) {
    this.type = json.type;
    this.errorMessageId = json.type;
    this.allowedValues = json.attributes.allowedValues;
  }

  validate(value: string): boolean {
    return this.allowedValues.includes(value);
  }

  validateValue(request: PaymentRequest, fieldId: string): boolean {
    const value = request.getUnmaskedValue(fieldId);
    return !!value && this.validate(value);
  }
}
