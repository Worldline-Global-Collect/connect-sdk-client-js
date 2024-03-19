import type { PaymentProductJSON } from '../../../types';
import type { CreateValidationTestData } from '../helper';

import { createValidationRuleTest } from '../helper';
import { ValidationRuleLuhn } from '../../../validation-rule';

import { paymentProductJson as _paymentProductJson } from '../../__fixtures__/payment-product-json';
import { paymentProductFieldDummyJson as dummyFieldJson } from '../../__fixtures__/payment-product-field-json';

const rule = new ValidationRuleLuhn({ type: 'luhn', attributes: {} });

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
    msg: 'should pass validation when value is a valid Luhn number',
    setValue: [{ key: dummyFieldJson.id, value: '79927398713' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: true }],
    validate: { args: ['79927398713'], expected: true },
  },
  {
    msg: 'should fail validation when value is not a valid Luhn number',
    setValue: [{ key: dummyFieldJson.id, value: '79927398712' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: false }],
    validate: { args: ['79927398712'], expected: false },
  },
];

createValidationRuleTest({ rule, paymentProductJson, data });
