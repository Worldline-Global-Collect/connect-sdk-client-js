import type {
  EmptyValidatorJSON,
  ValidationRule,
  ValidationRuleDefinition,
} from '../../types';
import type { PaymentRequest } from '../../PaymentRequest';

export class ValidationRuleEmailAddress implements ValidationRule {
  readonly type: string;
  readonly errorMessageId: string;

  constructor(readonly json: ValidationRuleDefinition<EmptyValidatorJSON>) {
    this.type = json.type;
    this.errorMessageId = json.type;
  }

  validate(value: string): boolean {
    const regexp = new RegExp(
      /^[^@.]+(\.[^@.]+)*@([^@.]+\.)*[^@.]+\.[^@.][^@.]+$/i,
    );
    return regexp.test(value);
  }

  validateValue(request: PaymentRequest, fieldId: string): boolean {
    const value = request.getUnmaskedValue(fieldId);
    return !!value && this.validate(value);
  }
}
