import type {
  PaymentProductFieldDataRestrictionsJSON,
  ValidationRule,
  ValidationRuleType,
} from './types';

import { ValidationRuleFactory } from './validation-rule';

export class DataRestrictions {
  readonly isRequired: boolean;
  readonly validationRules: ValidationRule[];
  private readonly _validationRuleMap: Map<
    ValidationRule['type'],
    ValidationRule
  >;

  constructor(readonly json: PaymentProductFieldDataRestrictionsJSON) {
    this.isRequired = json.isRequired;
    const validationRuleFactory = new ValidationRuleFactory();
    this._validationRuleMap = new Map(
      Object.entries(json.validators || {}).reduce<
        Array<[ValidationRule['type'], ValidationRule]>
      >((acc, [type, attributes]) => {
        const validationRule = validationRuleFactory.makeValidator({
          type,
          attributes,
        });
        return validationRule
          ? [...acc, [validationRule.type, validationRule]]
          : acc;
      }, []),
    );
    this.validationRules = Array.from(this._validationRuleMap.values());
  }

  /**
   * Get validation rule by type
   * @param type - The type name of the validation rule
   */
  getValidationRule(
    type: ValidationRuleType | Capitalize<ValidationRuleType> | string,
  ): ReturnType<ValidationRuleFactory['makeValidator']> | undefined {
    return this._validationRuleMap.get(type);
  }
}
