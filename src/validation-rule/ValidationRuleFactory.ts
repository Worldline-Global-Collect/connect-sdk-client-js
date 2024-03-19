import type {
  ValidationRule,
  ValidationRuleDefinition,
  ValidationRuleType,
} from '../types';

import * as rules from './rules';

const validationRuleMap = new Map<
  Capitalize<ValidationRuleType>,
  (typeof rules)[keyof typeof rules]
>([
  ['EmailAddress', rules.ValidationRuleEmailAddress],
  ['TermsAndConditions', rules.ValidationRuleTermsAndConditions],
  ['ExpirationDate', rules.ValidationRuleExpirationDate],
  ['FixedList', rules.ValidationRuleFixedList],
  ['Length', rules.ValidationRuleLength],
  ['Luhn', rules.ValidationRuleLuhn],
  ['Range', rules.ValidationRuleRange],
  ['RegularExpression', rules.ValidationRuleRegularExpression],
  [
    'BoletoBancarioRequiredness',
    rules.ValidationRuleBoletoBancarioRequiredness,
  ],
  ['Iban', rules.ValidationRuleIban],
  ['ResidentIdNumber', rules.ValidationRuleResidentIdNumber],
]);

function _capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export class ValidationRuleFactory {
  makeValidator(
    json: ValidationRuleDefinition<unknown>,
  ): ValidationRule | null {
    const ruleKey = _capitalizeFirstLetter(
      json.type,
    ) as Capitalize<ValidationRuleType>;
    const Rule = validationRuleMap.get(ruleKey);

    if (!Rule) {
      console.warn(`no validator for ${ruleKey}`);
      return null;
    }

    return new Rule(json as never);
  }
}
