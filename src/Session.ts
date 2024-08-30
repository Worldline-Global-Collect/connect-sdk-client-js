import type {
  ConvertAmountJSON,
  CreatePaymentProductSessionResponseJSON,
  DirectoryJSON,
  PaymentProductGroupJSON,
  PaymentProductJSON,
  PaymentProductNetworksResponseJSON,
  ThirdPartyStatusResponseJSON,
  ApplePayInitResult,
  ApplePaySpecificInput,
  PaymentDetails,
  PaymentProductSessionContext,
  PaymentProductSpecificInputs,
  SessionDetails,
  GetPrivacyPolicyResponseJSON,
  GetPrivacyPolicyOptions,
} from './types';
import type { IinDetailsResponse } from './IinDetailsResponse';
import type { PublicKeyResponse } from './PublicKeyResponse';

import { BasicPaymentItems } from './BasicPaymentItems';
import { BasicPaymentProductGroups } from './BasicPaymentProductGroups';
import { BasicPaymentProducts } from './BasicPaymentProducts';
import { C2SCommunicator } from './C2SCommunicator';
import { C2SCommunicatorConfiguration } from './C2SCommunicatorConfiguration';
import { C2SPaymentProductContext } from './C2SPaymentProductContext';
import { Encryptor } from './Encryptor';
import { PaymentProduct } from './PaymentProduct';
import { PaymentProductGroup } from './PaymentProductGroup';
import { PaymentRequest } from './PaymentRequest';

const API_VERSION = 'client/v1';

export class Session {
  readonly clientApiUrl: C2SCommunicatorConfiguration['clientApiUrl'];
  readonly assetUrl: C2SCommunicatorConfiguration['assetUrl'];
  private readonly _c2SCommunicatorConfiguration: C2SCommunicatorConfiguration;
  private readonly _c2sCommunicator: C2SCommunicator;
  private readonly _paymentRequest: PaymentRequest;
  private _paymentDetails?: PaymentDetails;

  constructor(
    sessionDetails: SessionDetails,
    paymentProduct?: PaymentProductJSON | PaymentProductGroupJSON,
  ) {
    this._c2SCommunicatorConfiguration = new C2SCommunicatorConfiguration(
      sessionDetails,
      API_VERSION,
    );
    this._c2sCommunicator = new C2SCommunicator(
      this._c2SCommunicatorConfiguration,
      paymentProduct,
    );
    this._paymentRequest = new PaymentRequest(
      this._c2SCommunicatorConfiguration.clientSessionId,
    );
    this.clientApiUrl = this._c2SCommunicatorConfiguration.clientApiUrl;
    this.assetUrl = this._c2SCommunicatorConfiguration.assetUrl;
  }

  /**
   * Returns an instance of `BasicPaymentProducts`.
   * This instance allows you to reference any basic payment product and
   * account on file that are configured for your account.
   */
  async getBasicPaymentProducts(
    paymentDetails: PaymentDetails,
    paymentProductSpecificInputs?: PaymentProductSpecificInputs,
  ): Promise<BasicPaymentProducts> {
    const c2SPaymentProductContext = new C2SPaymentProductContext(
      paymentDetails,
    );
    const json = await this._c2sCommunicator.getBasicPaymentProducts(
      c2SPaymentProductContext,
      paymentProductSpecificInputs,
    );
    this._paymentDetails = paymentDetails;
    return new BasicPaymentProducts(json);
  }

  /**
   * Returns an instance of `BasicPaymentProductGroups`.
   * This instance allows you to reference any basic payment product group and
   * account on file that are configured for your account.
   */
  async getBasicPaymentProductGroups(
    paymentDetails: PaymentDetails,
  ): Promise<BasicPaymentProductGroups> {
    const c2SPaymentProductContext = new C2SPaymentProductContext(
      paymentDetails,
    );
    const json = await this._c2sCommunicator.getBasicPaymentProductGroups(
      c2SPaymentProductContext,
    );
    this._paymentDetails = paymentDetails;
    return new BasicPaymentProductGroups(json);
  }

  /**
   * Retrieve details of the payment products that are
   * configured for your account.
   */
  async getBasicPaymentItems(
    paymentDetails: PaymentDetails,
    useGroups: boolean,
    paymentProductSpecificInputs?: PaymentProductSpecificInputs,
  ): Promise<BasicPaymentItems> {
    const products = await this.getBasicPaymentProducts(
      paymentDetails,
      paymentProductSpecificInputs,
    );
    if (useGroups) {
      const groups = await this.getBasicPaymentProductGroups(paymentDetails);
      return new BasicPaymentItems(products, groups);
    }
    return new BasicPaymentItems(products, null);
  }

  /**
   * Retrieve details of the payment product that is
   * configured for your account.
   */
  async getPaymentProduct(
    paymentProductId: number,
    paymentDetails?: PaymentDetails,
    paymentProductSpecificInputs?: PaymentProductSpecificInputs,
  ): Promise<PaymentProduct> {
    const _paymentDetails = paymentDetails || this._paymentDetails;
    if (!_paymentDetails) {
      throw new Error('PaymentDetails is not provided');
    }
    const c2SPaymentProductContext = new C2SPaymentProductContext(
      _paymentDetails,
    );

    const json = await this._c2sCommunicator.getPaymentProduct(
      paymentProductId,
      c2SPaymentProductContext,
      paymentProductSpecificInputs,
    );

    return new PaymentProduct(json);
  }

  /**
   * Retrieve details of the payment product group that is
   * configured for your account.
   */
  async getPaymentProductGroup(
    paymentProductGroupId: string,
    paymentDetails?: PaymentDetails,
  ): Promise<PaymentProductGroup> {
    const _paymentDetails = paymentDetails || this._paymentDetails;
    if (!_paymentDetails) {
      throw new Error('PaymentDetails is not provided');
    }
    const c2SPaymentProductContext = new C2SPaymentProductContext(
      _paymentDetails,
    );

    const json = await this._c2sCommunicator.getPaymentProductGroup(
      paymentProductGroupId,
      c2SPaymentProductContext,
    );

    return new PaymentProductGroup(json);
  }

  /**
   * Returns verified data that we can process a card from a certain Issuer
   * (by looking up the first six or more digits) and what the
   * best card type would be, based on your configuration
   */
  async getIinDetails(
    partialCreditCardNumber: string,
    paymentDetails?: PaymentDetails | null,
  ): Promise<IinDetailsResponse> {
    const _paymentDetails = paymentDetails || this._paymentDetails;
    if (!_paymentDetails) {
      throw new Error('PaymentDetails is not provided');
    }

    const removeSpaces = (str: string) => str.replace(/\s/g, '');
    const toFixedLength = (str: string) =>
      str.length >= 8 ? str.substring(0, 8) : str.substring(0, 6);

    const c2SPaymentProductContext = new C2SPaymentProductContext(
      _paymentDetails,
    );
    return this._c2sCommunicator.getPaymentProductIdByCreditCardNumber(
      toFixedLength(removeSpaces(partialCreditCardNumber)),
      c2SPaymentProductContext,
    );
  }

  /**
   * The crypto API allows you to retrieve a transaction specific public key
   * from our server that should be used to encrypt sensitive data, like card details.
   */
  async getPublicKey(): Promise<PublicKeyResponse> {
    return this._c2sCommunicator.getPublicKey();
  }

  /**
   * Returns a lists of all the networks that can be used in
   * the current payment context for given payment product
   */
  async getPaymentProductNetworks(
    paymentProductId: number,
    paymentDetails: PaymentDetails,
  ): Promise<PaymentProductNetworksResponseJSON> {
    const c2SPaymentProductContext = new C2SPaymentProductContext(
      paymentDetails,
    );
    const paymentProductNetworks =
      await this._c2sCommunicator.getPaymentProductNetworks(
        paymentProductId,
        c2SPaymentProductContext,
      );
    this._paymentDetails = paymentDetails;
    return paymentProductNetworks;
  }

  /**
   * Returns a list of directory entries that can be used to populate the
   * GUI elements that allows the consumer to make the selection.
   */
  async getPaymentProductDirectory(
    paymentProductId: number,
    currencyCode: string,
    countryCode: string,
  ): Promise<DirectoryJSON> {
    return this._c2sCommunicator.getPaymentProductDirectory(
      paymentProductId,
      currencyCode,
      countryCode,
    );
  }

  async convertAmount(
    amount: number,
    source: string,
    target: string,
  ): Promise<ConvertAmountJSON> {
    return this._c2sCommunicator.convertAmount(amount, source, target);
  }

  /**
   * Retrieve the current payment request which is defined by the constructor.
   */
  getPaymentRequest(): PaymentRequest {
    return this._paymentRequest;
  }

  /**
   * Returns the encryptor instance to encrypt data
   * with the public key and session id
   */
  getEncryptor(): Encryptor {
    return new Encryptor(this._c2sCommunicator.getPublicKey());
  }

  /**
   * Returns the current third party status.
   */
  async getThirdPartyPaymentStatus(
    paymentId: string,
  ): Promise<ThirdPartyStatusResponseJSON> {
    return this._c2sCommunicator.getThirdPartyPaymentStatus(paymentId);
  }

  /**
   * Returns the privacy policy html for a specific or all payment products in your account
   * @see https://apireference.connect.worldline-solutions.com/c2sapi/v1/en_US/javascript/services/privacypolicy.html
   */
  async getPrivacyPolicy(
    options: GetPrivacyPolicyOptions = {},
  ): Promise<GetPrivacyPolicyResponseJSON> {
    return this._c2sCommunicator.getPrivacyPolicy(options);
  }

  /**
   * Creates a payment product session for the payment product.
   * Retrieve details of the payment products that are configured for your account.
   */
  async createPaymentProductSession(
    paymentProductId: number,
    context: PaymentProductSessionContext,
  ): Promise<CreatePaymentProductSessionResponseJSON> {
    return this._c2sCommunicator.createPaymentProductSession(
      paymentProductId,
      context,
    );
  }

  /**
   * Initialize Apple Pay payment
   */
  async createApplePayPayment(
    context: PaymentDetails,
    applePaySpecificInput: ApplePaySpecificInput,
    networks: string[],
  ): Promise<ApplePayInitResult> {
    return this._c2sCommunicator.initApplePayPayment(
      context,
      applePaySpecificInput,
      networks,
    );
  }
}
