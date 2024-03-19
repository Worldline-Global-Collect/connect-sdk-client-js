import type {
  ValidationRule,
  PaymentProductJSON,
  PaymentProductFieldJSON,
} from '../../../types';

import { describe, expect, it } from 'vitest';
import { PaymentRequest } from '../../../PaymentRequest';
import { PaymentProduct } from '../../../PaymentProduct';

export interface CreateValidationTestData<T extends ValidationRule> {
  msg: string;
  validateValue?: Array<{
    fieldId: PaymentProductFieldJSON['id'];
    expected: ReturnType<T['validateValue']>;
  }>;
  setValue?: Record<
    'key' | 'value',
    Parameters<PaymentRequest['setValue']>[1]
  >[];
  validate?: {
    args: Parameters<T['validate']>;
    expected: ReturnType<T['validate']>;
  };
}

interface createValidationRuleTestProps<T extends ValidationRule> {
  rule: T;
  data: CreateValidationTestData<T>[];
  paymentProductJson: PaymentProductJSON;
}

function createPaymentRequest(
  paymentProductJson: PaymentProductJSON,
): PaymentRequest {
  const paymentProduct = new PaymentProduct(paymentProductJson);
  const paymentRequest = new PaymentRequest('sessionId');
  paymentRequest.setPaymentProduct(paymentProduct);
  return paymentRequest;
}

/**
 * Create validation rule test
 *
 * This test helper function allows a consistent way of testing
 * validation rules; it takes a validation rule and an array of test data.
 */
export function createValidationRuleTest<T extends ValidationRule>({
  rule,
  data,
  paymentProductJson,
}: createValidationRuleTestProps<T>) {
  describe('`validate` and `validateValue`', () => {
    it.each(data)('$msg', ({ validateValue = [], setValue = [], validate }) => {
      const paymentRequest = createPaymentRequest(paymentProductJson);
      setValue.forEach(({ key, value }) => paymentRequest.setValue(key, value));
      validateValue.map(({ fieldId, expected }) => {
        expect(rule.validateValue(paymentRequest, fieldId)).toBe(expected);
      });
      if (validate !== undefined) {
        const args = validate.args as Parameters<typeof rule.validate>;
        expect(rule.validate(...args)).toBe(validate.expected);
      }
    });
  });
}
