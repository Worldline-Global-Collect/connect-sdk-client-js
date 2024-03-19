import type {
  GetIINDetailsResponseJSON,
  IinDetailJSON,
  IinDetailsStatus,
} from './types';

export class IinDetailsResponse {
  readonly countryCode: string;
  readonly paymentProductId: number;
  readonly isAllowedInContext?: boolean;
  readonly coBrands?: IinDetailJSON[];

  constructor(
    readonly status: IinDetailsStatus,
    readonly json: GetIINDetailsResponseJSON,
  ) {
    this.countryCode = this.json.countryCode;
    this.paymentProductId = this.json.paymentProductId;
    this.isAllowedInContext = this.json.isAllowedInContext;
    this.coBrands = this.json.coBrands;
  }
}
