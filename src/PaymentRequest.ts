import type { PaymentProductFieldJSON, ValidationError } from './types';

import { AccountOnFile } from './AccountOnFile';
import { PaymentProduct } from './PaymentProduct';

export class PaymentRequest {
  private readonly _fieldValues: Map<string, string | undefined>;
  private readonly _clientSessionID: string;
  private _paymentProduct?: PaymentProduct;
  private _accountOnFile?: AccountOnFile;
  private _tokenize: boolean;

  constructor(clientSessionID: string) {
    this._clientSessionID = clientSessionID;
    this._fieldValues = new Map();
    this._tokenize = false;
  }

  private _getPaymentProductFieldById(paymentProductFieldId: string) {
    return this.getPaymentProduct()?.getPaymentProductField(
      paymentProductFieldId,
    );
  }

  setValue(
    paymentProductFieldId: PaymentProductFieldJSON['id'],
    value: string,
  ) {
    this._fieldValues.set(paymentProductFieldId, value);
  }

  setTokenize(tokenize: boolean) {
    this._tokenize = tokenize;
  }

  getTokenize(): boolean {
    return this._tokenize;
  }

  /**
   * @deprecated  This function does not return for which field the errors are.
   *              Use {@link PaymentRequest.validate} instead.
   */
  getErrorMessageIds(): string[] {
    return this.validate().map((error) => error.errorMessageId);
  }

  getValue(paymentProductFieldId: string): string | undefined {
    return this._fieldValues.get(paymentProductFieldId);
  }

  getValues(): Record<string, string | undefined> {
    return Object.fromEntries(this._fieldValues.entries());
  }

  getMaskedValue(paymentProductFieldId: string): string | undefined {
    const field = this._getPaymentProductFieldById(paymentProductFieldId);
    if (!field) return;

    const value = this.getValue(paymentProductFieldId);
    if (value === undefined) return;

    return field.applyMask(value).formattedValue;
  }

  getMaskedValues(): Record<string, string | undefined> {
    return Object.fromEntries(
      Array.from(this._fieldValues).map(([id]) => [
        id,
        this.getMaskedValue(id),
      ]),
    );
  }

  getUnmaskedValue(paymentProductFieldId: string): string | undefined {
    const field = this._getPaymentProductFieldById(paymentProductFieldId);
    if (!field) return;

    const value = this.getValue(paymentProductFieldId);
    if (value === undefined) return;

    return field.removeMask(field.applyMask(value)?.formattedValue);
  }

  getUnmaskedValues(): Record<string, string> {
    return Object.fromEntries(
      Array.from(this._fieldValues)
        .map(([id]) => [id, this.getUnmaskedValue(id)])
        .filter(([, value]) => value !== undefined),
    );
  }

  setPaymentProduct(paymentProduct: PaymentProduct) {
    this._paymentProduct = paymentProduct;
  }

  getPaymentProduct(): PaymentProduct | undefined {
    return this._paymentProduct;
  }

  setAccountOnFile(accountOnFile?: AccountOnFile | null) {
    if (!accountOnFile) return;
    accountOnFile.attributes.forEach(({ status, key }) => {
      if (status === 'MUST_WRITE') return;
      this._fieldValues.delete(key);
    });
    this._accountOnFile = accountOnFile;
  }

  getAccountOnFile(): AccountOnFile | undefined {
    return this._accountOnFile;
  }

  getClientSessionID(): string {
    return this._clientSessionID;
  }

  isValid(): boolean {
    return !!this.getPaymentProduct() && this.validate().length === 0;
  }

  /**
   * Validates that the necessary fields are set with correct values.
   * @throws If the payment product has not been set yet.
   */
  validate(): ValidationError[] {
    const paymentProduct = this.getPaymentProduct();
    if (!paymentProduct) {
      throw new Error(
        'Error validating PaymentRequest, please set a paymentProduct first.',
      );
    }

    const errors: ValidationError[] = [];

    // check fields that are set first
    for (const key of this._fieldValues.keys()) {
      const field = this._getPaymentProductFieldById(key);
      if (!field) continue;
      errors.push(
        ...field.getErrorMessageIds(this).map((id) => ({
          fieldId: field.id,
          errorMessageId: id,
        })),
      );
    }

    // besides checking the fields for errors, check if
    // all mandatory fields are present as well
    const aof = this.getAccountOnFile();

    const hasValueInAof = (fieldId: string): boolean => {
      // the account-on-file does not belong to the payment product; ignore it
      if (aof?.paymentProductId !== paymentProduct.id) return false;
      const attribute = aof?.getAttribute(fieldId);
      return !!attribute && attribute.status !== 'MUST_WRITE';
    };

    for (const field of paymentProduct.paymentProductFields) {
      // is this field present in the request?
      if (!field.dataRestrictions?.isRequired) continue;

      // if the account on file has the field we can ignore it
      const storedValue = this.getValue(field.id);
      if (storedValue || hasValueInAof(field.id)) continue;

      errors.push({ fieldId: field.id, errorMessageId: 'required' });
    }

    return errors;
  }
}
