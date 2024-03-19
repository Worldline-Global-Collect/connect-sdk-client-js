import type { PaymentProductJSON } from '../../../types';
import type { CreateValidationTestData } from '../helper';

import { createValidationRuleTest } from '../helper';
import { ValidationRuleTermsAndConditions } from '../../../validation-rule';

import { paymentProductJson as _paymentProductJson } from '../../__fixtures__/payment-product-json';
import { paymentProductFieldDummyJson as dummyFieldJson } from '../../__fixtures__/payment-product-field-json';

const rule = new ValidationRuleTermsAndConditions({
  type: 'termsAndConditions',
  attributes: {},
});

const paymentProductJson: PaymentProductJSON = {
  ..._paymentProductJson,
  fields: [dummyFieldJson],
};

const data: CreateValidationTestData<typeof rule>[] = [
  {
    msg: 'should fail validation when no value is missing',
    validateValue: [{ fieldId: dummyFieldJson.id, expected: false }],
  },
  {
    msg: 'should fail validation when value is empty',
    setValue: [{ key: dummyFieldJson.id, value: '' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: false }],
    validate: { args: [''], expected: false },
  },
  {
    msg: 'should pass validation when value is "true"',
    setValue: [{ key: dummyFieldJson.id, value: 'true' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: true }],
    validate: { args: ['true'], expected: true },
  },
  {
    msg: 'should fail validation when value is "false"',
    setValue: [{ key: dummyFieldJson.id, value: 'false' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: false }],
    validate: { args: ['false'], expected: false },
  },
];

createValidationRuleTest({ rule, paymentProductJson, data });
