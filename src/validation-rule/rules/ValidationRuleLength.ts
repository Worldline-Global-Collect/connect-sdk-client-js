import type {
  LengthValidatorJSON,
  ValidationRule,
  ValidationRuleDefinition,
} from '../../types';
import type { PaymentRequest } from '../../PaymentRequest';

export class ValidationRuleLength implements ValidationRule {
  readonly type: string;
  readonly errorMessageId: string;
  readonly minLength: number;
  readonly maxLength: number;

  constructor(readonly json: ValidationRuleDefinition<LengthValidatorJSON>) {
    this.type = json.type;
    this.errorMessageId = json.type;
    this.minLength = json.attributes.minLength;
    this.maxLength = json.attributes.maxLength;
  }

  validate(value: string): boolean {
    return this.minLength <= value.length && value.length <= this.maxLength;
  }

  validateValue(request: PaymentRequest, fieldId: string): boolean {
    const value = request.getUnmaskedValue(fieldId);

    // Empty values are allowed if the minimal required length is 0
    return !value ? this.minLength === 0 : this.validate(value);
  }
}
