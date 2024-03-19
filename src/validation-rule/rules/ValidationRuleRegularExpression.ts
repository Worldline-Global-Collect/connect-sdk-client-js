import type {
  RegularExpressionValidatorJSON,
  ValidationRule,
  ValidationRuleDefinition,
} from '../../types';
import type { PaymentRequest } from '../../PaymentRequest';

export class ValidationRuleRegularExpression implements ValidationRule {
  readonly type: string;
  readonly errorMessageId: string;
  readonly regularExpression: string;

  constructor(
    readonly json: ValidationRuleDefinition<RegularExpressionValidatorJSON>,
  ) {
    this.type = json.type;
    this.errorMessageId = json.type;
    this.regularExpression = json.attributes.regularExpression;
  }

  validate(value: string): boolean {
    const regexp = new RegExp(this.regularExpression);
    return regexp.test(value);
  }

  validateValue(request: PaymentRequest, fieldId: string): boolean {
    const value = request.getUnmaskedValue(fieldId);
    return !!value && this.validate(value);
  }
}
