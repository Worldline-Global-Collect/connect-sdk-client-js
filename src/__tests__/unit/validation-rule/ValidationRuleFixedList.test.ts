import type { PaymentProductJSON } from '../../../types';
import type { CreateValidationTestData } from '../helper';

import { createValidationRuleTest } from '../helper';
import { ValidationRuleFixedList } from '../../../validation-rule';

import { paymentProductJson as _paymentProductJson } from '../../__fixtures__/payment-product-json';
import { paymentProductFieldDummyJson as dummyFieldJson } from '../../__fixtures__/payment-product-field-json';

const rule = new ValidationRuleFixedList({
  type: 'fixedList',
  attributes: { allowedValues: ['a', 'b', 'c'] },
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
    msg: 'should pass validation when value is in allowed values',
    setValue: [{ key: dummyFieldJson.id, value: 'a' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: true }],
    validate: { args: ['a'], expected: true },
  },
  {
    msg: 'should fail validation when value is not in allowed values',
    setValue: [{ key: dummyFieldJson.id, value: 'd' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: false }],
    validate: { args: ['d'], expected: false },
  },
];

createValidationRuleTest({ rule, paymentProductJson, data });
