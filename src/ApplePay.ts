import type {
  CreatePaymentProductSessionResponseJSON,
  ApplePayInitResult,
  ApplePayPaymentDetails,
  PaymentProductSessionContext,
} from './types';

import { PaymentProductId } from './constants';
import * as utils from './utils';
import { ApplePayError, ApplePayErrorStatus, ResponseError } from './error';

// This interface is used to break the circular import dependency between ApplePay and C2SCommunicator.
// C2SCommunicator automatically implements it.
// @todo: remove this to types section
interface ApplePayC2SCommunicator {
  createPaymentProductSession(
    paymentProductId: number,
    context: PaymentProductSessionContext,
  ): Promise<CreatePaymentProductSessionResponseJSON>;
}

/**
 * Return `true` if Apple Pay can make payments in the browser
 * Ignore errors being thrown by `ApplePaySession.canMakePayments()`
 */
function canMakePayments(): boolean {
  try {
    return (
      Object.hasOwn(window, 'ApplePaySession') &&
      ApplePaySession.canMakePayments()
    );
  } catch (err) {
    return false;
  }
}

export class ApplePay {
  private _isCancelled: boolean = false;

  isApplePayAvailable(): boolean {
    const isAvailable = canMakePayments();
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
      this._isCancelled = false;
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

      applePaySession.oncancel = () => {
        this._isCancelled = true;
        reject(
          new ApplePayError('Payment cancelled', ApplePayErrorStatus.Cancelled),
        );
      };

      applePaySession.onvalidatemerchant = async (event) => {
        try {
          const sessionContext = {
            displayName: context.displayName,
            validationUrl: event.validationURL,
            domainName: window.location.hostname,
          };

          const { paymentProductSession302SpecificOutput } =
            await c2SCommunicator.createPaymentProductSession(
              PaymentProductId.APPLE_PAY,
              sessionContext,
            );

          const merchantSession = JSON.parse(
            paymentProductSession302SpecificOutput?.sessionObject as string,
          );

          applePaySession.completeMerchantValidation(merchantSession);
        } catch (error) {
          // Prevent throwing an error when the session is cancelled (`oncancel` event).
          // The error is already thrown and the `applePaySession.abort()` is
          // called internally by Apple Pay JS API.
          if (this._isCancelled) return;

          applePaySession.abort();

          if (error instanceof ResponseError) return reject(error);
          if (error instanceof Error) {
            return reject(
              new ApplePayError(
                error.message,
                ApplePayErrorStatus.ValidateMerchant,
              ),
            );
          }
          reject(error);
        }
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
            reject(
              new ApplePayError(
                'Error payment authorization',
                ApplePayErrorStatus.PaymentAuthorized,
              ),
            );
            break;
        }
      };
    });
  }
}
