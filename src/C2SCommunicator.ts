import type {
  AccountOnFileJSON,
  BasicPaymentProductGroupJSON,
  BasicPaymentProductJSON,
  ConvertAmountJSON,
  CreatePaymentProductSessionRequestJSON,
  CreatePaymentProductSessionResponseJSON,
  DirectoryJSON,
  ErrorResponseJSON,
  GetIINDetailsRequestJSON,
  GetIINDetailsResponseJSON,
  PaymentProductGroupJSON,
  PaymentProductGroupsJSON,
  PaymentProductJSON,
  PaymentProductNetworksResponseJSON,
  PaymentProductsJSON,
  PublicKeyJSON,
  ThirdPartyStatusResponseJSON,
  ApplePayInitResult,
  ApplePayPaymentDetails,
  ApplePaySpecificInput,
  PaymentDetails,
  PaymentProductSessionContext,
  PaymentProductSpecificInputs,
  PaymentProductContext,
  SdkResponse,
  GetPrivacyPolicyOptions,
  GetPrivacyPolicyResponseJSON,
} from './types';

import { ApplePay } from './ApplePay';
import { C2SCommunicatorConfiguration } from './C2SCommunicatorConfiguration';
import { GooglePay } from './GooglePay';
import { IinDetailsResponse } from './IinDetailsResponse';
import { PublicKeyResponse } from './PublicKeyResponse';
import {
  IinDetailsResponseError,
  PaymentProductError,
  ResponseError,
  ResponseJsonError,
} from './error';
import { Net } from './Net';
import { PaymentProductId } from './constants';
import * as utils from './utils';
import { IinDetailsStatus } from './types';

const _mapType = new Map([
  ['expirydate', 'tel'],
  ['string', 'text'],
  ['numericstring', 'tel'],
  ['integer', 'number'],
  ['expirationDate', 'tel'],
]);

export class C2SCommunicator<
  PaymentProduct extends PaymentProductJSON | PaymentProductGroupJSON =
    | PaymentProductJSON
    | PaymentProductGroupJSON,
> {
  readonly _c2SCommunicatorConfiguration: C2SCommunicatorConfiguration;
  readonly _cache: Map<string, unknown>;
  readonly _googlePay: GooglePay;
  readonly _applePay: ApplePay;

  constructor(
    c2SCommunicatorConfiguration: C2SCommunicatorConfiguration,
    readonly _providedPaymentProduct?: PaymentProduct,
  ) {
    this._c2SCommunicatorConfiguration = c2SCommunicatorConfiguration;
    this._cache = new Map();
    this._googlePay = new GooglePay();
    this._applePay = new ApplePay();

    if (_providedPaymentProduct) {
      this._providedPaymentProduct = this._sanitizePaymentProductJSON(
        _providedPaymentProduct,
      );
    }
  }

  private _createCacheKeyFromContext({
    prefix,
    suffix,
    context,
    includeLocale,
  }: {
    context: PaymentProductContext;
    prefix: string;
    suffix?: string;
    includeLocale?: boolean;
  }) {
    const { locale, countryCode, isRecurring, totalAmount, currency } = context;

    const cacheKeyLocale = includeLocale ? locale : '';
    return `${prefix}-${[
      totalAmount,
      countryCode,
      cacheKeyLocale,
      isRecurring,
      currency,
      suffix,
    ]
      .filter(Boolean)
      .join('_')}`;
  }

  private _getBasePath(path: string): string {
    const { clientApiUrl, customerId } = this._c2SCommunicatorConfiguration;
    return utils.url.segmentsToPath([clientApiUrl, customerId, path]);
  }

  private _getUrlFromContext({
    path,
    context: { countryCode, totalAmount, currency, locale, isRecurring },
    includeLocale = true,
    queryParams = {},
    useCacheBuster = false,
  }: {
    path: string;
    context: PaymentProductContext;
    includeLocale?: boolean;
    queryParams?: Record<string, string | number | undefined | boolean>;
    useCacheBuster?: boolean;
  }) {
    return utils.url.urlWithQueryString(this._getBasePath(path), {
      countryCode,
      isRecurring: isRecurring?.toString(),
      amount: totalAmount.toString(),
      currencyCode: currency,
      locale: includeLocale ? locale : undefined,
      cacheBust: useCacheBuster ? new Date().getTime().toString() : undefined,
      ...queryParams,
    });
  }

  private _getRequestHeaders() {
    const metadata = utils.client.getMetadata();
    return {
      'X-GCS-ClientMetaInfo': window.btoa(JSON.stringify(metadata)),
      Authorization: `GCS v1Client:${this._c2SCommunicatorConfiguration.clientSessionId}`,
    };
  }

  async getBasicPaymentProducts(
    context: PaymentProductContext,
    paymentProductSpecificInputs: PaymentProductSpecificInputs = {},
  ): Promise<PaymentProductsJSON> {
    const cacheKey = this._createCacheKeyFromContext({
      context,
      prefix: 'getPaymentProducts',
      includeLocale: true,
      suffix: JSON.stringify(paymentProductSpecificInputs),
    });

    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey) as PaymentProductsJSON;
    }

    const url = this._getUrlFromContext({
      path: '/products',
      context,
      useCacheBuster: true,
      queryParams: { hide: 'fields' },
    });

    const response = await Net.get<PaymentProductsJSON>(url, {
      headers: this._getRequestHeaders(),
    });

    if (!response.success) {
      throw new ResponseError(
        'failed to retrieve Basic Payment Products',
        response,
      );
    }

    const json = { ...response.data };
    json.paymentProducts = this._sanitizeBasicPaymentProductsJson(
      json.paymentProducts,
    );

    // report Apple Pay availability for current APPLE_PAY_PAYMENT_PRODUCT_ID
    if (
      json.paymentProducts.some(({ id }) => id === PaymentProductId.APPLE_PAY)
    ) {
      this._applePay.isApplePayAvailable();
    }

    // initialize Google Pay when `paymentProducts` contains GOOGLE_PAY_PAYMENT_PRODUCT_ID
    if (
      json.paymentProducts.some(
        ({ id }) => id === PaymentProductId.GOOGLE_PAY,
      ) &&
      this._googlePay.isMerchantIdProvided(paymentProductSpecificInputs)
    ) {
      const googlePayData = json.paymentProducts.find(
        ({ id }) => id === PaymentProductId.GOOGLE_PAY,
      )?.paymentProduct320SpecificData;

      try {
        if (googlePayData) {
          await this._googlePay.isGooglePayAvailable(
            context,
            paymentProductSpecificInputs,
            googlePayData,
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        /* do nothing */
      }
    }

    // remove unsupported payment products in browser
    json.paymentProducts = json.paymentProducts.filter(
      ({ id }) => !utils.client.unsupportedPaymentProductsInBrowser.has(id),
    );

    if (!json.paymentProducts.length) {
      throw new ResponseError('No payment products available', response);
    }

    this._cache.set(cacheKey, json);
    return json;
  }

  async getBasicPaymentProductGroups(
    context: PaymentProductContext,
  ): Promise<PaymentProductGroupsJSON> {
    const cacheKey = this._createCacheKeyFromContext({
      context,
      prefix: 'getPaymentProductGroups',
      includeLocale: true,
    });

    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey) as PaymentProductGroupsJSON;
    }

    const url = this._getUrlFromContext({
      path: '/productgroups',
      context,
      useCacheBuster: true,
      queryParams: { hide: 'fields' },
    });

    const response = await Net.get<PaymentProductGroupsJSON>(url, {
      headers: this._getRequestHeaders(),
    });

    if (!response.success) {
      throw new ResponseError(
        'failed to retrieve Basic Payment Products Groups',
        response,
      );
    }

    const json = response.data;
    json.paymentProductGroups = this._sanitizeBasicPaymentProductsJson(
      json.paymentProductGroups,
    );

    this._cache.set(cacheKey, json);
    return json;
  }

  async getPaymentProduct(
    paymentProductId: number,
    context: PaymentProductContext,
    paymentProductSpecificInputs: PaymentProductSpecificInputs = {},
  ): Promise<PaymentProductJSON> {
    if (
      utils.client.unsupportedPaymentProductsInBrowser.has(paymentProductId)
    ) {
      throw new ResponseJsonError('Unsupported payment product', {
        errorId: '48b78d2d-1b35-4f8b-92cb-57cc2638e901',
        errors: [
          {
            code: '1007',
            propertyName: 'productId',
            message: 'UNKNOWN_PRODUCT_ID',
            httpStatusCode: 404,
          },
        ],
      });
    }

    const cacheKey = this._createCacheKeyFromContext({
      context,
      prefix: `getPaymentProduct-${paymentProductId}`,
      includeLocale: true,
      suffix: JSON.stringify(paymentProductSpecificInputs),
    });

    // check if payment product is provided by the constructor
    if (this._providedPaymentProduct?.id === paymentProductId) {
      if (!this._cache.has(cacheKey)) {
        this._cache.set(cacheKey, this._providedPaymentProduct);
      }
      return this._providedPaymentProduct as PaymentProductJSON;
    }

    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey) as PaymentProductJSON;
    }

    const forceBasicFlow =
      paymentProductSpecificInputs?.bancontact?.forceBasicFlow;

    const url = this._getUrlFromContext({
      path: `products/${paymentProductId}`,
      context,
      useCacheBuster: true,
      queryParams: {
        // Add query parameter to products call to force basic flow for BanContact
        ...(paymentProductId === PaymentProductId.BANCONTACT &&
          forceBasicFlow && { forceBasicFlow }),
      },
    });

    const response = await Net.get<
      PaymentProductJSON & Partial<PaymentProductJSON>
    >(url, { headers: this._getRequestHeaders() });

    if (!response.success) {
      throw new ResponseError('failed to retrieve Payment Product', response);
    }

    const json = this._sanitizePaymentProductJSON(response.data);
    this._cache.set(cacheKey, json);

    // throw an error when Apple Pay is available in the payment context,
    // but the client does not support it
    if (
      paymentProductId === PaymentProductId.APPLE_PAY &&
      !this._applePay.isApplePayAvailable()
    ) {
      throw new PaymentProductError(
        'Apple Pay is not available in the client',
        json,
      );
    }

    // when Google Pay is available in the payment context,
    // validate if Google Pay is available in the client with given data
    if (
      paymentProductId === PaymentProductId.GOOGLE_PAY &&
      this._googlePay.isMerchantIdProvided(paymentProductSpecificInputs)
    ) {
      if (!json.paymentProduct320SpecificData) {
        throw new PaymentProductError(
          'Google Pay data is not available, missing `paymentProduct320SpecificData`',
          json,
        );
      }

      let isGooglePayAvailable = false;
      try {
        isGooglePayAvailable = await this._googlePay.isGooglePayAvailable(
          context,
          paymentProductSpecificInputs,
          json.paymentProduct320SpecificData,
        );
      } catch (err) {
        throw new PaymentProductError(
          utils.getErrorMessage(err) ??
            'Google Pay is not available in the client',
          json,
        );
      }

      if (!isGooglePayAvailable) {
        throw new PaymentProductError(
          'Google Pay is not available in the client',
          json,
        );
      }
    }

    return json;
  }

  async getPaymentProductGroup(
    paymentProductGroupId: string,
    context: PaymentProductContext,
  ): Promise<PaymentProductGroupJSON> {
    const cacheKey = this._createCacheKeyFromContext({
      prefix: `getPaymentProductGroup-${paymentProductGroupId}`,
      context,
      includeLocale: true,
    });

    // check if payment product is provided by the constructor
    if (this._providedPaymentProduct?.id === paymentProductGroupId) {
      if (!this._cache.has(cacheKey)) {
        this._cache.set(cacheKey, this._providedPaymentProduct);
      }
      return this._providedPaymentProduct as PaymentProductGroupJSON;
    }

    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey) as PaymentProductGroupJSON;
    }

    const url = this._getUrlFromContext({
      path: `/productgroups/${paymentProductGroupId}`,
      context,
      useCacheBuster: true,
    });

    const response = await Net.get<PaymentProductGroupJSON>(url, {
      headers: this._getRequestHeaders(),
    });

    if (!response.success) {
      throw new ResponseError(
        'failed to retrieve Payment Product Group',
        response,
      );
    }

    const json = this._sanitizePaymentProductJSON(response.data);
    this._cache.set(cacheKey, json);
    return json;
  }

  async getPaymentProductIdByCreditCardNumber(
    partialCreditCardNumber: string,
    context: PaymentProductContext,
  ): Promise<IinDetailsResponse> {
    const cacheKey = `getPaymentProductIdByCreditCardNumber-${partialCreditCardNumber}`;

    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey) as IinDetailsResponse;
    }

    // validate if credit card number has enough digits
    if (partialCreditCardNumber.length < 6) {
      throw new IinDetailsResponseError(IinDetailsStatus.NOT_ENOUGH_DIGITS);
    }

    const response = await Net.post<
      GetIINDetailsResponseJSON | ErrorResponseJSON
    >(this._getBasePath('/services/getIINdetails'), {
      headers: this._getRequestHeaders(),
      body: JSON.stringify(
        this.convertContextToIinDetailsContext(
          partialCreditCardNumber,
          context,
        ),
      ),
    });

    if (!response.success) {
      throw new ResponseError(
        IinDetailsStatus.UNKNOWN,
        response as SdkResponse<ErrorResponseJSON>,
      );
    }

    const json = { ...response.data } as GetIINDetailsResponseJSON;

    // check if this card is supported
    if (Object.hasOwn(json, 'isAllowedInContext')) {
      const iinDetailsResponse = new IinDetailsResponse(
        json.isAllowedInContext !== false
          ? IinDetailsStatus.SUPPORTED
          : IinDetailsStatus.EXISTING_BUT_NOT_ALLOWED,
        json,
      );
      this._cache.set(cacheKey, iinDetailsResponse);
      return iinDetailsResponse;
    }

    // if `isAllowedInContext` is not available, get the payment product
    // again to determine status
    try {
      const paymentProduct = await this.getPaymentProduct(
        json.paymentProductId,
        context,
      );
      const iinDetailsResponse = new IinDetailsResponse(
        paymentProduct
          ? IinDetailsStatus.SUPPORTED
          : IinDetailsStatus.UNSUPPORTED,
        json,
      );
      this._cache.set(cacheKey, iinDetailsResponse);
      return iinDetailsResponse;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new IinDetailsResponseError(IinDetailsStatus.UNKNOWN, json);
    }
  }

  convertContextToIinDetailsContext(
    partialCreditCardNumber: string,
    context: PaymentProductContext,
  ): GetIINDetailsRequestJSON {
    const paymentContext = {
      countryCode: context.countryCode,
      isRecurring: context.isRecurring,
      isInstallments: context.isInstallments,
      amountOfMoney: {
        amount: context.totalAmount,
        currencyCode: context.currency,
      },
    };

    // @todo: convert `PaymentProductContext` into `PaymentContext`? If so,
    //  then we can use `paymentContext: context` instead
    const payload: GetIINDetailsRequestJSON = {
      bin: partialCreditCardNumber,
      paymentContext,
    };

    // Account on file id is needed only in case when the merchant
    // uses multiple payment platforms at the same time.
    if (context.accountOnFileId !== undefined) {
      payload.accountOnFileId = context.accountOnFileId;
    }

    return payload;
  }

  async getPublicKey(): Promise<PublicKeyResponse> {
    const cacheKey = 'publicKey';
    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey) as PublicKeyResponse;
    }

    const response = await Net.get<PublicKeyJSON>(
      this._getBasePath('/crypto/publickey'),
      { headers: this._getRequestHeaders() },
    );

    if (!response.success) {
      throw new ResponseError('failed to retrieve public key', response);
    }

    const publicKeyResponse = new PublicKeyResponse(response.data);
    this._cache.set(cacheKey, publicKeyResponse);
    return publicKeyResponse;
  }

  async getPaymentProductNetworks(
    paymentProductId: number,
    context: PaymentProductContext,
  ): Promise<PaymentProductNetworksResponseJSON> {
    const cacheKey = this._createCacheKeyFromContext({
      prefix: `paymentProductNetworks-${paymentProductId}`,
      context,
    });

    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey) as PaymentProductNetworksResponseJSON;
    }

    const response = await Net.get<PaymentProductNetworksResponseJSON>(
      this._getUrlFromContext({
        path: `/products/${paymentProductId}/networks`,
        context,
      }),
      { headers: this._getRequestHeaders() },
    );

    if (!response.success) {
      throw new ResponseError(
        'failed to retrieve Payment Product Networks',
        response,
      );
    }

    const json = response.data;
    this._cache.set(cacheKey, json);
    return json;
  }

  async getPaymentProductDirectory(
    paymentProductId: number,
    currencyCode: string,
    countryCode: string,
  ): Promise<DirectoryJSON> {
    const cacheKey = `getPaymentProductDirectory-${paymentProductId}_${currencyCode}_${countryCode}`;

    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey) as DirectoryJSON;
    }

    const url = utils.url.urlWithQueryString(
      this._getBasePath(`/products/${paymentProductId}/directory`),
      { countryCode, currencyCode },
    );

    const response = await Net.get<DirectoryJSON>(url, {
      headers: this._getRequestHeaders(),
    });

    if (!response.success) {
      throw new ResponseError(
        'failed to retrieve Payment Product Directory',
        response,
      );
    }

    const json = response.data;
    this._cache.set(cacheKey, json);
    return json;
  }

  async convertAmount(
    amount: number,
    source: string,
    target: string,
  ): Promise<ConvertAmountJSON> {
    const cacheKey = `convertAmount-${amount}_${source}_${target}`;

    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey) as ConvertAmountJSON;
    }

    const response = await Net.get<ConvertAmountJSON>(
      utils.url.urlWithQueryString(
        this._getBasePath('/services/convert/amount'),
        { source, target, amount },
      ),
      { headers: this._getRequestHeaders() },
    );

    if (!response.success) {
      throw new ResponseError('failed to convert amount', response);
    }

    const json = response.data;
    this._cache.set(cacheKey, json);
    return json;
  }

  async getThirdPartyPaymentStatus(
    paymentId: string,
  ): Promise<ThirdPartyStatusResponseJSON> {
    const response = await Net.get<ThirdPartyStatusResponseJSON>(
      this._getBasePath(`/payments/${paymentId}/thirdpartystatus`),
      { headers: this._getRequestHeaders() },
    );

    if (!response.success) {
      throw new ResponseError(
        'failed to retrieve third party payment status',
        response,
      );
    }

    return response.data;
  }

  async createPaymentProductSession(
    paymentProductId: BasicPaymentProductJSON['id'],
    context: PaymentProductSessionContext,
  ): Promise<CreatePaymentProductSessionResponseJSON> {
    const { validationUrl, domainName, displayName } = context;
    const cacheKey = `createPaymentProductSession_${paymentProductId}_${validationUrl}_${domainName}_${displayName}`;

    if (this._cache.has(cacheKey)) {
      return this._cache.get(
        cacheKey,
      ) as CreatePaymentProductSessionResponseJSON;
    }

    const requestParameters: CreatePaymentProductSessionRequestJSON = {
      paymentProductSession302SpecificInput: context,
    };

    const response = await Net.post<CreatePaymentProductSessionResponseJSON>(
      this._getBasePath(`/products/${paymentProductId}/sessions`),
      {
        headers: this._getRequestHeaders(),
        body: JSON.stringify(requestParameters),
      },
    );

    if (!response.success) {
      throw new ResponseError(
        'failed to create payment product session',
        response,
      );
    }

    const json = response.data;
    this._cache.set(cacheKey, json);
    return json;
  }

  async initApplePayPayment(
    context: PaymentDetails,
    paymentProductSpecificInput: ApplePaySpecificInput,
    networks: string[],
  ): Promise<ApplePayInitResult> {
    const payload: ApplePayPaymentDetails = {
      ...context,
      displayName: paymentProductSpecificInput.merchantName,
      networks,
      ...(paymentProductSpecificInput.acquirerCountry
        ? { acquirerCountry: paymentProductSpecificInput.acquirerCountry }
        : {}),
    };

    return this._applePay.initPayment(payload, this);
  }

  async getPrivacyPolicy({
    paymentProductId,
    locale,
  }: GetPrivacyPolicyOptions): Promise<GetPrivacyPolicyResponseJSON> {
    const response = await Net.get<GetPrivacyPolicyResponseJSON>(
      utils.url.urlWithQueryString(
        this._getBasePath('/services/privacypolicy'),
        { paymentProductId, locale },
      ),
      { headers: this._getRequestHeaders() },
    );

    if (!response.success) {
      throw new ResponseError('failed to fetch privacy policy', response);
    }

    return response.data;
  }

  /**
   * Sanitize basic payment products
   *
   * - Format displayHints logo image url
   * - Sort by display order
   */
  private _sanitizeBasicPaymentProductsJson<
    T extends BasicPaymentProductJSON | BasicPaymentProductGroupJSON,
  >(paymentProducts: T[]): T[] {
    const assetUrl = this._c2SCommunicatorConfiguration.assetUrl;
    const formatDisplayHintsLogo = <Obj extends T | AccountOnFileJSON>(
      obj: Obj,
    ): Obj => ({
      ...obj,
      displayHints: {
        ...obj.displayHints,
        logo: utils.url.formatImageUrl(assetUrl, obj.displayHints.logo),
      },
    });

    return paymentProducts
      .map((product) => {
        const _product = formatDisplayHintsLogo(product);
        return Object.assign(
          _product,
          _product.accountsOnFile && {
            accountsOnFile: _product.accountsOnFile.map(formatDisplayHintsLogo),
          },
        );
      })
      .sort(
        (a, b) => a.displayHints.displayOrder - b.displayHints.displayOrder,
      );
  }

  /**
   * Returns a copied sanitized payment product (group) json response,
   * so it matches the result of `getPaymentProduct` and `getPaymentProductGroup`
   *
   * - add validators to fields
   * - Sort fields by display order
   * - format image urls (convert to absolute urls)
   */
  private _sanitizePaymentProductJSON = <
    T extends PaymentProductJSON | PaymentProductGroupJSON,
  >(
    json: T,
  ): T => {
    const assetUrl = this._c2SCommunicatorConfiguration.assetUrl;
    const fi = utils.url.formatImageUrl;

    const fields = json.fields
      ?.map((field) => {
        const validators = [
          ...(field.validators || []),
          ...Object.keys(field.dataRestrictions?.validators ?? {}),
        ];

        const displayHints = field.displayHints
          ? {
              ...field.displayHints,
              tooltip: field.displayHints.tooltip
                ? {
                    ...field.displayHints.tooltip,
                    image: field.displayHints.tooltip.image
                      ? utils.url.formatImageUrl(
                          assetUrl,
                          field.displayHints.tooltip.image,
                        )
                      : field.displayHints.tooltip.image,
                  }
                : field.displayHints.tooltip,
            }
          : field.displayHints;

        const type = field.displayHints?.obfuscate
          ? 'password'
          : _mapType.get(field.type) || 'text';

        return { ...field, type, validators, displayHints };
      })
      .sort(
        (a, b) =>
          (a.displayHints?.displayOrder ?? 0) -
          (b.displayHints?.displayOrder ?? 0),
      );

    const displayHints = {
      ...json.displayHints,
      ...(json.displayHints?.logo
        ? { logo: fi(assetUrl, json.displayHints.logo) }
        : {}),
    };

    const accountsOnFile = json.accountsOnFile?.map((aof) => ({
      ...aof,
      displayHints: {
        ...aof.displayHints,
        logo: fi(assetUrl, aof.displayHints.logo),
      },
    }));

    return Object.assign(
      {},
      json,
      fields && { fields },
      displayHints && { displayHints },
      accountsOnFile && { accountsOnFile },
    );
  };
}
