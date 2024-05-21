import type { PaymentProductFieldJSON } from './types';
import type { PaymentRequest } from './PaymentRequest';

import { DataRestrictions } from './DataRestrictions';
import { MaskedString } from './MaskedString';
import { MaskingUtil } from './MaskingUtil';
import { PaymentProductFieldDisplayHints } from './PaymentProductFieldDisplayHints';

export class PaymentProductField {
  private _errorCodes: string[];
  readonly displayHints?: PaymentProductFieldDisplayHints;
  readonly dataRestrictions?: DataRestrictions;
  readonly id: string;
  readonly type: string;

  constructor(readonly json: PaymentProductFieldJSON) {
    this._errorCodes = [];
    this.id = json.id;
    this.type = json.type;
    this.dataRestrictions = json.dataRestrictions
      ? new DataRestrictions(json.dataRestrictions)
      : undefined;
    this.displayHints = json.displayHints
      ? new PaymentProductFieldDisplayHints(json.displayHints)
      : undefined;
  }

  /**
   * @deprecated  This function does not take into account other fields that may be of importance for the validation.
   *              Use {@link PaymentProductField.getErrorMessageIds} instead.
   */
  getErrorCodes(value?: string): string[] {
    if (value) {
      this._errorCodes = [];
      this.isValid(value);
    }
    return this._errorCodes;
  }

  getErrorMessageIds(request?: PaymentRequest): string[] {
    if (request) {
      this._errorCodes = [];
      this.validateValue(request);
    }
    return this._errorCodes;
  }

  /**
   * @deprecated This function does not take into account other fields that may be of importance for the validation.
   *             Use {@link PaymentProductField.validateValue} instead.
   */
  isValid(value: string): boolean {
    // isValid checks all data restrictions
    const validators = this.dataRestrictions?.validationRules || [];

    // Apply masking value first
    const maskedValue = this.applyMask(value);
    value = this.removeMask(maskedValue.formattedValue);

    const errorMessageIds = validators
      .filter((validator) => !validator.validate(value))
      .map((validator) => validator.errorMessageId);

    this._errorCodes.push(...errorMessageIds);
    return errorMessageIds.length === 0;
  }

  validateValue(request: PaymentRequest): boolean {
    // validateValue checks all data restrictions
    const validators = this.dataRestrictions?.validationRules || [];

    const errorMessageIds = validators
      .filter((validator) => !validator.validateValue(request, this.id))
      .map((validator) => validator.errorMessageId);

    this._errorCodes.push(...errorMessageIds);
    return errorMessageIds.length === 0;
  }

  applyMask(newValue: string, oldValue?: string): MaskedString {
    const maskingUtil = new MaskingUtil();
    const mask = this.displayHints ? this.displayHints.mask : undefined;
    return maskingUtil.applyMask(mask, newValue, oldValue);
  }

  applyWildcardMask(newValue: string, oldValue?: string): MaskedString {
    const maskingUtil = new MaskingUtil();
    return maskingUtil.applyMask(
      this.displayHints?.wildcardMask,
      newValue,
      oldValue,
    );
  }

  removeMask(value: string): string {
    const maskingUtil = new MaskingUtil();
    return maskingUtil.removeMask(this.displayHints?.mask, value);
  }
}
