import type {
  CreatePaymentProductSessionResponseJSON,
  ApplePayInitResult,
  ApplePayPaymentDetails,
  PaymentProductSessionContext,
} from './types';

import { PaymentProductId } from './constants';
import * as utils from './utils';

// This interface is used to break the circular import dependency between ApplePay and C2SCommunicator.
// C2SCommunicator automatically implements it.
// @todo: remove this to types section
interface ApplePayC2SCommunicator {
  createPaymentProductSession(
    paymentProductId: number,
    context: PaymentProductSessionContext,
  ): Promise<CreatePaymentProductSessionResponseJSON>;
}

export class ApplePay {
  isApplePayAvailable(): boolean {
    const isAvailable =
      Object.hasOwn(window, 'ApplePaySession') &&
      ApplePaySession.canMakePayments();

    if (!isAvailable) {
      utils.client.unsupportedPaymentProductsInBrowser.add(
        PaymentProductId.APPLE_PAY,
      );
    }

    return isAvailable;
  }

  initPayment(
    context: ApplePayPaymentDetails,
    c2SCommunicator: ApplePayC2SCommunicator,
  ): Promise<ApplePayInitResult> {
    return new Promise<ApplePayInitResult>((resolve, reject) => {
      const countryCode = context.acquirerCountry
        ? context.acquirerCountry
        : context.countryCode;

      const payment: ApplePayJS.ApplePayPaymentRequest = {
        currencyCode: context.currency,
        countryCode: countryCode,
        total: {
          label: context.displayName,
          amount: (context.totalAmount / 100).toString(),
        },
        supportedNetworks: context.networks,
        merchantCapabilities: ['supports3DS'],
      };

      const applePaySession = new ApplePaySession(1, payment);
      applePaySession.begin();

      const onError = (error: unknown) => {
        reject(error);
        applePaySession.abort();
      };

      applePaySession.onvalidatemerchant = (event) => {
        const sessionContext = {
          displayName: context.displayName,
          validationURL: event.validationURL,
          domainName: window.location.hostname,
        };
        c2SCommunicator
          .createPaymentProductSession(
            PaymentProductId.APPLE_PAY,
            sessionContext,
          )
          .then(({ paymentProductSession302SpecificOutput }) => {
            try {
              const merchantSession = JSON.parse(
                paymentProductSession302SpecificOutput?.sessionObject as string,
              );
              applePaySession.completeMerchantValidation(merchantSession);
            } catch (e) {
              onError(e);
            }
          })
          .catch(onError);
      };

      applePaySession.onpaymentauthorized = (event) => {
        const token = event.payment.token;
        const status = token
          ? ApplePaySession.STATUS_SUCCESS
          : ApplePaySession.STATUS_FAILURE;

        applePaySession.completePayment(status);

        switch (status) {
          case ApplePaySession.STATUS_SUCCESS:
            resolve({ message: 'Payment authorized', data: token });
            break;
          case ApplePaySession.STATUS_FAILURE:
            reject(new Error('Error payment authorization'));
            break;
        }
      };
    });
  }
}
