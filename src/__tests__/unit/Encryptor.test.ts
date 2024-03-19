import { beforeEach, describe, expect, it } from 'vitest';

import { PaymentProduct } from '../../PaymentProduct';
import { Encryptor } from '../../Encryptor';
import { PaymentRequest } from '../../PaymentRequest';
import { EncryptError } from '../../error';

import { paymentProductJson } from '../__fixtures__/payment-product-json';
import { publicKeyResponse } from '../__fixtures__/public-key-response';
import { paymentProductFieldCardNumberJson } from '../__fixtures__/payment-product-field-json';

const paymentProduct = new PaymentProduct({
  ...paymentProductJson,
  fields: [paymentProductFieldCardNumberJson],
});

const encryptor = new Encryptor(Promise.resolve(publicKeyResponse));

describe('encrypt', () => {
  let request: PaymentRequest;
  beforeEach(() => {
    request = new PaymentRequest('sessionId');
  });

  it('should reject with correct response when no product is provided', async () => {
    await expect(encryptor.encrypt(request)).rejects.toThrow(EncryptError);
    await expect(encryptor.encrypt(request)).rejects.toThrow(
      'No paymentProduct set',
    );
  });

  it('should reject with correct response when invalid request is provided', async () => {
    request.setPaymentProduct(paymentProduct);
    request.setValue(paymentProductFieldCardNumberJson.id, '4567350000427978');
    await expect(encryptor.encrypt(request)).rejects.toThrow(EncryptError);
    await expect(encryptor.encrypt(request)).rejects.toThrow(
      expect.objectContaining({
        validationErrors: [
          {
            fieldId: paymentProductFieldCardNumberJson.id,
            errorMessageId: 'luhn',
          },
        ],
      }),
    );
  });

  it('should resolve with correct response when valid request is provided', async () => {
    request.setPaymentProduct(paymentProduct);
    request.setValue(paymentProductFieldCardNumberJson.id, '4567350000427977');

    const encryptedString = await encryptor.encrypt(request);
    const parts = encryptedString.split('.');
    expect(parts).toHaveLength(5);

    // the header can be checked at this point, the rest is binary data
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    expect(header).toStrictEqual({
      alg: 'RSA-OAEP',
      enc: 'A256CBC-HS512',
      kid: publicKeyResponse.keyId,
    });
  });
});
