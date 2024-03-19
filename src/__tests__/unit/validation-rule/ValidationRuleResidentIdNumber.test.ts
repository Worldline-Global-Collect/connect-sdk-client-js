import type { PaymentProductJSON } from '../../../types';
import type { CreateValidationTestData } from '../helper';

import { createValidationRuleTest } from '../helper';
import { ValidationRuleResidentIdNumber } from '../../../validation-rule';

import { paymentProductJson as _paymentProductJson } from '../../__fixtures__/payment-product-json';
import { paymentProductFieldDummyJson as dummyFieldJson } from '../../__fixtures__/payment-product-field-json';

const rule = new ValidationRuleResidentIdNumber({
  type: 'residentIdNumber',
  attributes: {},
});

const paymentProductJson: PaymentProductJSON = {
  ..._paymentProductJson,
  fields: [dummyFieldJson],
};

const validResidentIdNumbers = [
  '123456789012345', // old ID card format contains only 15 digits and no checksum, this is valid
  '110101202002042275',
  '110101202002049979',
  '11010120200211585X',
  '11010120200211585x',
  '11010120200325451X',
  '11010120200325451x',
];

const invalidResidentIdNumbers = [
  '1234567890',
  '12345678901234X',
  '12345678901234x',
  '12345678901234a',
  '110101202002042274',
  '1101012020020227a4',
  'b10101202002049979',
  '15242719920303047X',
  '15242719920303047x',
  '15242719920303047a',
];

type ValidationTestData = CreateValidationTestData<typeof rule>;
const data: ValidationTestData[] = [
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
  ...(validResidentIdNumbers.map((residentIdNumber) => ({
    msg: `should pass validation when value is a valid resident ID number: ${residentIdNumber}`,
    setValue: [{ key: dummyFieldJson.id, value: residentIdNumber }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: true }],
    validate: { args: [residentIdNumber], expected: true },
  })) as ValidationTestData[]),
  ...(invalidResidentIdNumbers.map((residentIdNumber) => ({
    msg: 'should fail validation when value is not a valid resident ID number',
    setValue: [{ key: dummyFieldJson.id, value: residentIdNumber }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: false }],
    validate: { args: [residentIdNumber], expected: false },
  })) as ValidationTestData[]),
];

createValidationRuleTest({ rule, paymentProductJson, data });
