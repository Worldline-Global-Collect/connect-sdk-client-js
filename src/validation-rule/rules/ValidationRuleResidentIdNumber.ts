import type {
  EmptyValidatorJSON,
  ValidationRule,
  ValidationRuleDefinition,
} from '../../types';
import type { PaymentRequest } from '../../PaymentRequest';

// https://en.wikipedia.org/wiki/Resident_Identity_Card
// storing weights in the reverse order so that we can begin
// from the 0th position of ID while calculating checksum
const weights = Array.from({ length: 18 })
  .map((_, i) => Math.pow(2, i) % 11)
  .reverse();

export class ValidationRuleResidentIdNumber implements ValidationRule {
  readonly type: string;
  readonly errorMessageId: string;

  constructor(readonly json: ValidationRuleDefinition<EmptyValidatorJSON>) {
    this.type = json.type;
    this.errorMessageId = json.type;
  }

  validate(value: string): boolean {
    if (value.length === 15) return /^\d{15}$/.test(value);
    if (value.length !== 18) return false;

    let sum = 0;
    for (let i = 0; i < value.length - 1; i++) {
      sum += Number(value.charAt(i)) * weights[i];
    }

    const checkSum = (12 - (sum % 11)) % 11;
    const csChar = value.charAt(17);

    // check only values
    if (checkSum < 10) return checkSum === Number(csChar);

    // check the type as well
    return !!csChar && csChar.toUpperCase() === 'X';
  }

  validateValue(request: PaymentRequest, fieldId: string): boolean {
    const value = request.getUnmaskedValue(fieldId);
    return !!value && this.validate(value);
  }
}
