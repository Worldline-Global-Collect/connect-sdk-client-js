import type {
  ValidationRule,
  ValidationRuleDefinition,
  RangeValidatorJSON,
} from '../../types';
import type { PaymentRequest } from '../../PaymentRequest';

export class ValidationRuleRange implements ValidationRule {
  readonly type: string;
  readonly errorMessageId: string;
  readonly minValue: number;
  readonly maxValue: number;

  constructor(readonly json: ValidationRuleDefinition<RangeValidatorJSON>) {
    this.type = json.type;
    this.errorMessageId = json.type;
    this.minValue = json.attributes.minValue;
    this.maxValue = json.attributes.maxValue;
  }

  validate(value: string | number): boolean {
    const intValue = +value;
    return isNaN(intValue)
      ? false
      : this.minValue <= intValue && intValue <= this.maxValue;
  }

  validateValue(request: PaymentRequest, fieldId: string): boolean {
    const value = request.getUnmaskedValue(fieldId);
    return !!value && this.validate(value);
  }
}
