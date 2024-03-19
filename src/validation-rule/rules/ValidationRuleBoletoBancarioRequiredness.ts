import type {
  BoletoBancarioRequirednessValidatorJSON,
  ValidationRule,
  ValidationRuleDefinition,
} from '../../types';
import type { PaymentRequest } from '../../PaymentRequest';

export class ValidationRuleBoletoBancarioRequiredness
  implements ValidationRule
{
  readonly type: string;
  readonly errorMessageId: string;
  readonly fiscalNumberLength: number;

  constructor(
    readonly json: ValidationRuleDefinition<BoletoBancarioRequirednessValidatorJSON>,
  ) {
    this.type = json.type;
    this.errorMessageId = json.type;
    this.fiscalNumberLength = json.attributes.fiscalNumberLength;
  }

  validate(value: string, fiscalNumberValue = ''): boolean {
    return (
      (fiscalNumberValue.length === this.fiscalNumberLength &&
        value.length > 0) ||
      fiscalNumberValue.length !== this.fiscalNumberLength
    );
  }

  validateValue(request: PaymentRequest, fieldId: string): boolean {
    const fiscalNumber = request.getUnmaskedValue('fiscalNumber');
    const fiscalNumberLength = fiscalNumber?.length || 0;
    return fiscalNumberLength !== this.fiscalNumberLength
      ? true // The field is not required for Boleto; allow anything
      : !!request.getValue(fieldId);
  }
}
