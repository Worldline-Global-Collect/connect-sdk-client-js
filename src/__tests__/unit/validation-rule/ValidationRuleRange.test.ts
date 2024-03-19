import type { PaymentProductJSON } from '../../../types';
import type { CreateValidationTestData } from '../helper';

import { createValidationRuleTest } from '../helper';
import { ValidationRuleRange } from '../../../validation-rule';

import { paymentProductJson as _paymentProductJson } from '../../__fixtures__/payment-product-json';
import { paymentProductFieldDummyJson as dummyFieldJson } from '../../__fixtures__/payment-product-field-json';

const rule = new ValidationRuleRange({
  type: 'length',
  attributes: { minValue: 2, maxValue: 5 },
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
    msg: 'should pass validation when value is at minValue',
    setValue: [{ key: dummyFieldJson.id, value: '2' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: true }],
    validate: { args: ['2'], expected: true },
  },
  {
    msg: 'should pass validation when value is at maxValue',
    setValue: [{ key: dummyFieldJson.id, value: '5' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: true }],
    validate: { args: ['5'], expected: true },
  },
  {
    msg: 'should fail validation when value is below minValue',
    setValue: [{ key: dummyFieldJson.id, value: '1' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: false }],
    validate: { args: ['1'], expected: false },
  },
  {
    msg: 'should fail validation when value is above maxValue',
    setValue: [{ key: dummyFieldJson.id, value: '6' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: false }],
    validate: { args: ['6'], expected: false },
  },
];

createValidationRuleTest({ rule, paymentProductJson, data });
