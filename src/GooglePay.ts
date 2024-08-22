import type {
  PaymentProduct320SpecificDataJSON,
  PaymentProductSpecificInputs,
  PaymentProductContext,
} from './types';

import { PaymentProductId } from './constants';
import * as utils from './utils';

export class GooglePay {
  private _paymentProductSpecificInputs: PaymentProductSpecificInputs = {};
  private _context?: PaymentProductContext;
  private _networks: google.payments.api.CardNetwork[] = [];
  private _paymentsClient?: google.payments.api.PaymentsClient;
  private _gateway = '';

  async isGooglePayAvailable(
    context: PaymentProductContext,
    paymentProductSpecificInputs: PaymentProductSpecificInputs,
    googlePayData: PaymentProduct320SpecificDataJSON,
  ): Promise<boolean> {
    this._context = context;
    this._paymentProductSpecificInputs = paymentProductSpecificInputs;
    this._gateway = googlePayData.gateway;
    this._networks =
      googlePayData.networks as google.payments.api.CardNetwork[];

    const setNotSupported = () => {
      utils.client.unsupportedPaymentProductsInBrowser.add(
        PaymentProductId.GOOGLE_PAY,
      );
    };

    if (!this._networks?.length) {
      setNotSupported();
      throw new Error('There are no product networks available');
    }

    const paymentsClient = this._getGooglePaymentsClient();
    if (!paymentsClient) {
      setNotSupported();
      throw new Error(
        'The Google Pay API script was not loaded https://developers.google.com/pay/api/web/guides/tutorial#js-load',
      );
    }

    try {
      this._prefetchGooglePaymentData();
      const { result } = await paymentsClient.isReadyToPay(
        this._getGooglePaymentDataRequest(),
      );
      return result;
    } catch (err) {
      setNotSupported();
      throw err;
    }
  }

  isMerchantIdProvided(
    paymentProductSpecificInputs?: PaymentProductSpecificInputs,
  ): boolean {
    const _isMerchantIdProvided =
      !!paymentProductSpecificInputs?.googlePay?.merchantId;

    if (!_isMerchantIdProvided) {
      utils.client.unsupportedPaymentProductsInBrowser.add(
        PaymentProductId.GOOGLE_PAY,
      );
    }

    return _isMerchantIdProvided;
  }

  /**
   * Only base is needed to trigger isReadyToPay
   */
  private _getBaseCardPaymentMethod(): google.payments.api.IsReadyToPayPaymentMethodSpecification {
    return {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: this._networks,
      },
    };
  }

  private _getTokenizationSpecification(): google.payments.api.PaymentGatewayTokenizationSpecification {
    const gatewayMerchantId =
      this._paymentProductSpecificInputs.googlePay?.gatewayMerchantId;

    if (!gatewayMerchantId) {
      throw new Error('Gateway merchant ID is required for tokenization');
    }

    return {
      type: 'PAYMENT_GATEWAY',
      parameters: { gatewayMerchantId, gateway: this._gateway },
    };
  }

  /**
   * To prefetch payment data we need base + tokenizationSpecification
   */
  private _getCardPaymentMethod(): google.payments.api.PaymentMethodSpecification {
    return Object.assign({}, this._getBaseCardPaymentMethod(), {
      tokenizationSpecification: this._getTokenizationSpecification(),
    });
  }

  private _getTransactionInfo(): google.payments.api.TransactionInfo {
    return {
      totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
      currencyCode: this._context?.currency,
    } as google.payments.api.TransactionInfo;
    // Note that the cast is necessary, because the TypeScript definition makes totalPrice required even though it isn't
  }

  private _getMerchantInfo(): google.payments.api.MerchantInfo {
    return {
      merchantName: this._paymentProductSpecificInputs.googlePay?.merchantName,
    } as google.payments.api.MerchantInfo;
    // Note that the cast is necessary, because the TypeScript definition makes merchantId required even though it isn't
  }

  private _getGooglePaymentDataRequest(): google.payments.api.IsReadyToPayRequest {
    return {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [this._getBaseCardPaymentMethod()],
    };
  }

  private _getGooglePaymentDataRequestForPrefetch(): google.payments.api.PaymentDataRequest {
    // transactionInfo must be set but does not affect cache
    return {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [this._getCardPaymentMethod()],
      transactionInfo: this._getTransactionInfo(),
      merchantInfo: this._getMerchantInfo(),
    };
  }

  private _getGooglePaymentsClient():
    | google.payments.api.PaymentsClient
    | undefined {
    if (this._paymentsClient) return this._paymentsClient;

    if (!window.google) {
      console.error(
        'The Google Pay API script was not loaded https://developers.google.com/pay/api/web/guides/tutorial#js-load',
      );
      return;
    }

    this._paymentsClient = new google.payments.api.PaymentsClient({
      environment:
        this._context?.environment === 'PROD' ? 'PRODUCTION' : 'TEST',
    });

    return this._paymentsClient;
  }

  /**
   * Prefetch payment data to improve performance
   * @see {@link https://developers.google.com/pay/api/web/reference/client#prefetchPaymentData|prefetchPaymentData()}
   */
  private _prefetchGooglePaymentData() {
    const paymentDataRequest = this._getGooglePaymentDataRequestForPrefetch();
    const paymentsClient = this._getGooglePaymentsClient();

    const { gatewayMerchantId, merchantName } =
      this._paymentProductSpecificInputs.googlePay || {};

    // Prefetching is only effective when all information is provided
    if (!(paymentsClient && gatewayMerchantId && merchantName)) {
      console.warn(
        `Prefetching payment data was not triggered because of missing information. gatewayMerchantId: ${gatewayMerchantId}, merchantName: ${merchantName}`,
      );
      return;
    }

    paymentsClient.prefetchPaymentData(paymentDataRequest);
  }
}
