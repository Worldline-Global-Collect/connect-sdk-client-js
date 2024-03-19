import type { DeviceInformation } from './types';
import type { PublicKeyResponse } from './PublicKeyResponse';
import type { PaymentRequest } from './PaymentRequest';

import { util as forgeUtil, random as forgeRandom } from 'node-forge';
import { JOSEEncryptor } from './JOSEEncryptor';
import * as utils from './utils';
import { EncryptError } from './error';

interface EncryptedCustomerInput {
  clientSessionId: string;
  nonce: string;
  paymentProductId: number;
  accountOnFileId?: number;
  tokenize?: boolean;
  paymentValues: Record<'key' | 'value', string>[];
  collectedDeviceInformation: DeviceInformation;
}

function createEncryptedConsumerInput(
  paymentRequest: PaymentRequest,
): EncryptedCustomerInput {
  const paymentProductId = paymentRequest.getPaymentProduct()?.id;
  if (!paymentProductId) throw new Error('no paymentProduct set');

  const accountOnFile = paymentRequest.getAccountOnFile();
  const paymentValues = Object.entries(paymentRequest.getUnmaskedValues()).map(
    ([key, value]) => ({
      key,
      value,
    }),
  );

  return {
    clientSessionId: paymentRequest.getClientSessionID(),
    nonce: forgeUtil.bytesToHex(forgeRandom.getBytesSync(16)),
    tokenize: paymentRequest.getTokenize(),
    collectedDeviceInformation: utils.client.getDeviceInformation(),
    paymentProductId,
    paymentValues,
    ...(accountOnFile && { accountOnFileId: accountOnFile.id }),
  };
}

export class Encryptor {
  private readonly _publicKeyResponsePromise: Promise<PublicKeyResponse>;

  constructor(publicKeyResponsePromise: Promise<PublicKeyResponse>) {
    this._publicKeyResponsePromise = publicKeyResponsePromise;
  }

  /**
   * Encrypts the given payment request.
   * Calls {@link PaymentRequest.validate}, so it's not necessary to do that first.
   * If validation fails, the returned promise is rejected with the validation errors.
   */
  async encrypt(paymentRequest: PaymentRequest): Promise<string> {
    if (!paymentRequest.getPaymentProduct()) {
      throw new EncryptError('No paymentProduct set');
    }

    const errors = paymentRequest.validate();
    if (errors.length !== 0) {
      throw new EncryptError('Payment request is invalid', errors);
    }

    const publicKeyResponse = await this._publicKeyResponsePromise;
    const joseEncryptor = new JOSEEncryptor();
    return joseEncryptor.encrypt(
      createEncryptedConsumerInput(paymentRequest),
      publicKeyResponse,
    );
  }
}
